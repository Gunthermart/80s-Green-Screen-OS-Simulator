import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, Shield, Activity, Zap, ChevronRight, List, 
  Crosshair, Radio, Gauge, Box, GripVertical, AlertTriangle, Target,
  Network, Share2, Cloud, Wind, Minus, Maximize2, Scaling, Minimize2,
  TrendingUp, LayoutGrid
} from 'lucide-react';

/* =========================================
   0. STYLE CINÉMA & POST-PROCESSING
   ========================================= */
const THEME = {
  bg: 'bg-[#010102]',
  surface: 'bg-[#08080a]',
  border: 'border-[#1a1a1e]',
  accent: 'emerald-500',
};

const GlobalCinemaStyles = () => (
  <style>{`
    @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
    .scanline { position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: rgba(16, 185, 129, 0.05); animation: scanline 6s linear infinite; pointer-events: none; z-index: 100; }
    .crt-overlay { position: fixed; inset: 0; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02)); background-size: 100% 3px, 3px 100%; pointer-events: none; z-index: 101; }
    .glow-text { text-shadow: 0 0 10px rgba(16, 185, 129, 0.5); }
    
    .system-stress { animation: glitch-jitter 0.15s infinite; filter: contrast(1.2) saturate(1.5); }
    .stealth-mode { filter: sepia(1) hue-rotate(-50deg) saturate(2) contrast(1.2) !important; }
    .liquidate-flash { animation: flash-red 0.5s ease-out; }
    
    .draggable-item { cursor: grab; }
    .draggable-item:active { cursor: grabbing; }
    .dragging { opacity: 0.5; border: 1px dashed #10b981; }

    @keyframes flash-red { 0% { background: rgba(239, 68, 68, 0.5); } 100% { background: transparent; } }
    @keyframes glitch-jitter {
      0% { transform: translate(0); }
      25% { transform: translate(-1px, 1px); }
      50% { transform: translate(1px, -1px); }
      100% { transform: translate(0); }
    }

    @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    .animate-ticker { display: flex; width: fit-content; animation: ticker 30s linear infinite; }

    .grid-bg { background-image: radial-gradient(rgba(16, 185, 129, 0.08) 1px, transparent 1px); background-size: 30px 30px; }
    .scan-bar { position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: #10b981; box-shadow: 0 0 15px #10b981; animation: scanning 2s linear infinite; z-index: 100; }
    @keyframes scanning { 0% { top: 0; } 100% { top: 100%; } }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .animate-pop-in { animation: pop-in 0.3s ease-out forwards; }
    @keyframes pop-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  `}</style>
);

/* =========================================
   1. MOTEURS VISUELS (THREE.JS & CANVAS)
   ========================================= */

const LOB3DTerrain = ({ isStressed, burstMode }) => {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    if (window.THREE) initThree();
    else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.onload = initThree;
      document.head.appendChild(script);
    }

    let scene, camera, terrain, geometry;

    function initThree() {
      const THREE = window.THREE;
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.set(0, 25, 35);
      camera.lookAt(0, 0, 0);

      rendererRef.current = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      rendererRef.current.setSize(width, height);
      mountRef.current.appendChild(rendererRef.current.domElement);

      const segments = 45;
      geometry = new THREE.PlaneGeometry(80, 80, segments, segments);
      geometry.rotateX(-Math.PI / 2);
      const material = new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true, transparent: true, opacity: 0.15 });
      terrain = new THREE.Mesh(geometry, material);
      scene.add(terrain);

      const animate = () => {
        if (!rendererRef.current) return;
        const time = Date.now() * 0.001;
        const posAttr = geometry.attributes.position;
        const factor = (isStressed ? 3 : 1) * (burstMode ? 5 : 1);
        for (let i = 0; i < posAttr.count; i++) {
          const x = posAttr.getX(i);
          const z = posAttr.getZ(i);
          let h = Math.sin(x * 0.1 + time) * Math.cos(z * 0.1 + time) * 1.5;
          if (Math.abs(x) < 10) h += Math.sin(time * 4) * 2 * factor; 
          posAttr.setY(i, h);
        }
        posAttr.needsUpdate = true;
        terrain.rotation.y += 0.001 * factor;
        rendererRef.current.render(scene, camera);
        requestAnimationFrame(animate);
      };
      animate();
    }
    
    const handleResize = () => {
        if (!mountRef.current || !rendererRef.current) return;
        rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => { 
        window.removeEventListener('resize', handleResize);
        if (rendererRef.current && mountRef.current) mountRef.current.removeChild(rendererRef.current.domElement); 
    };
  }, [isStressed, burstMode]);

  return <div ref={mountRef} className="w-full h-full min-h-[250px]" />;
};

const CorrelationMatrix = ({ isStressed }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const assets = ['BTC', 'ETH', 'SOL', 'NDX', 'SPX', 'DXY', 'GOLD', 'OIL', 'VIX'];
    const nodes = assets.map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5
    }));

    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      ctx.fillStyle = isStressed ? 'rgba(20, 0, 0, 0.2)' : 'rgba(0, 5, 2, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      nodes.forEach(node => {
        node.x += node.vx * (isStressed ? 2 : 1);
        node.y += node.vy * (isStressed ? 2 : 1);
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
        ctx.beginPath();
        ctx.arc(node.x, node.y, isStressed ? 3 : 2, 0, Math.PI * 2);
        ctx.fillStyle = isStressed ? '#ef4444' : '#10b981';
        ctx.fill();
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            const opacity = 1 - dist / 150;
            ctx.strokeStyle = isStressed ? `rgba(239, 68, 68, ${opacity})` : `rgba(16, 185, 129, ${opacity * 0.5})`;
            ctx.lineWidth = isStressed ? 1.5 : 0.8;
            ctx.stroke();
            if (Math.random() > 0.98) {
               ctx.fillStyle = '#fff';
               const t = Math.random();
               ctx.beginPath();
               ctx.arc(nodes[i].x + (nodes[j].x - nodes[i].x) * t, nodes[i].y + (nodes[j].y - nodes[i].y) * t, 1.5, 0, Math.PI * 2);
               ctx.fill();
            }
          }
        }
        ctx.fillStyle = isStressed ? '#fda4af' : '#6ee7b7';
        ctx.font = '9px monospace';
        ctx.fillText(assets[i], nodes[i].x + 8, nodes[i].y + 3);
      }
      requestAnimationFrame(draw);
    };
    draw();
    return () => window.removeEventListener('resize', resize);
  }, [isStressed]);

  return (
    <div className="relative w-full h-full min-h-[150px] overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute top-2 left-2 pointer-events-none z-10">
        <div className="bg-black/80 border border-emerald-500/20 p-1 px-2 backdrop-blur-md rounded flex items-center gap-2">
            <Network size={10} className={isStressed ? 'text-red-500' : 'text-emerald-500'} />
            <span className="text-[9px] font-black text-zinc-400">CORR_COEFF: <span className={isStressed ? 'text-red-400' : 'text-emerald-400'}>0.94</span></span>
        </div>
      </div>
    </div>
  );
};

const SentimentCloud = ({ isStressed }) => {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const [sentiment, setSentiment] = useState({ label: 'GREED', value: 72 });

  useEffect(() => {
    if (window.THREE) initCloud();
    else {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      script.onload = initCloud;
      document.head.appendChild(script);
    }

    function initCloud() {
      const THREE = window.THREE;
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 40;

      rendererRef.current = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      rendererRef.current.setSize(width, height);
      mountRef.current.appendChild(rendererRef.current.domElement);

      const particleCount = 2000;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        const r = 15 + Math.random() * 5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        if (isStressed) {
            colors[i * 3] = 0.8 + Math.random() * 0.2; 
            colors[i * 3 + 1] = 0.1; 
            colors[i * 3 + 2] = 0.1; 
        } else {
            const isGreed = Math.random() > 0.3;
            colors[i * 3] = isGreed ? 0.0 : 0.8; 
            colors[i * 3 + 1] = isGreed ? 0.8 : 0.2; 
            colors[i * 3 + 2] = isGreed ? 0.4 : 0.2; 
        }
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({ size: 0.5, vertexColors: true, transparent: true, opacity: 0.8 });
      const cloud = new THREE.Points(geometry, material);
      scene.add(cloud);

      const coreGeom = new THREE.IcosahedronGeometry(5, 1);
      const coreMat = new THREE.MeshBasicMaterial({ 
          color: isStressed ? 0xef4444 : 0x10b981, 
          wireframe: true,
          transparent: true,
          opacity: 0.3 
      });
      const core = new THREE.Mesh(coreGeom, coreMat);
      scene.add(core);

      const animate = () => {
        if (!rendererRef.current) return;
        requestAnimationFrame(animate);
        
        const time = Date.now() * 0.001;
        cloud.rotation.y += isStressed ? 0.02 : 0.003;
        cloud.rotation.x = Math.sin(time * 0.5) * 0.1;
        
        const scale = 1 + Math.sin(time * 2) * (isStressed ? 0.1 : 0.02);
        cloud.scale.set(scale, scale, scale);
        core.rotation.y -= 0.01;
        core.scale.set(scale * 0.8, scale * 0.8, scale * 0.8);

        if (Math.random() > 0.99) {
            setSentiment(prev => ({
                label: isStressed ? 'PANIC' : (Math.random() > 0.5 ? 'GREED' : 'NEUTRAL'),
                value: isStressed ? 12 : Math.floor(40 + Math.random() * 50)
            }));
        }

        rendererRef.current.render(scene, camera);
      };
      animate();
    }

    const handleResize = () => {
        if (!mountRef.current || !rendererRef.current) return;
        rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => { 
        window.removeEventListener('resize', handleResize);
        if (rendererRef.current && mountRef.current) {
             mountRef.current.removeChild(rendererRef.current.domElement); 
             rendererRef.current = null;
        }
    };
  }, [isStressed]);

  return (
    <div className="relative w-full h-full min-h-[150px] overflow-hidden">
        <div ref={mountRef} className="absolute inset-0 w-full h-full" />
        <div className="absolute top-2 right-2 pointer-events-none z-10 text-right">
             <div className="text-[9px] text-zinc-500 uppercase font-black">Social_Volume</div>
             <div className="text-lg font-black tracking-tighter text-white">2.4M/s</div>
        </div>
        <div className="absolute bottom-2 left-2 bg-black/60 border border-emerald-500/20 p-2 backdrop-blur-md rounded pointer-events-none z-10 flex flex-col items-center min-w-[80px]">
             <div className="text-[8px] text-zinc-500 uppercase font-black">Sentiment</div>
             <div className={`text-xl font-black tracking-tighter ${isStressed ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>
                {sentiment.value}
             </div>
             <div className={`text-[9px] font-bold ${isStressed ? 'text-red-400' : 'text-emerald-600'}`}>
                {sentiment.label}
             </div>
        </div>
    </div>
  );
};

const VortexLiquidation = ({ isStressed }) => {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const [stats, setStats] = useState({ liquidations: 0, volume: 0 });

  useEffect(() => {
    if (window.THREE) initVortex();
    else {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
        script.onload = initVortex;
        document.head.appendChild(script);
    }

    function initVortex() {
      const THREE = window.THREE;
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 200;

      rendererRef.current = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      rendererRef.current.setSize(width, height);
      mountRef.current.appendChild(rendererRef.current.domElement);

      const particleCount = isStressed ? 4000 : 2500;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        const angle = i * 0.1;
        const radius = i * 0.5;
        positions[i * 3] = radius * Math.cos(angle);
        positions[i * 3 + 1] = radius * Math.sin(angle);
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

        if (isStressed) { colors[i * 3] = 0.9; colors[i * 3 + 1] = 0.1; colors[i * 3 + 2] = 0.1; } 
        else { colors[i * 3] = 0.06; colors[i * 3 + 1] = 0.72; colors[i * 3 + 2] = 0.50; }
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({ size: 2, vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
      const points = new THREE.Points(geometry, material);
      scene.add(points);

      const liquidations = [];
      const createLiquidation = (side) => {
        const geom = new THREE.SphereGeometry(2, 8, 8);
        const mat = new THREE.MeshBasicMaterial({ color: side === 'long' ? 0xef4444 : 0x10b981, transparent: true, opacity: 1 });
        const sphere = new THREE.Mesh(geom, mat);
        sphere.position.set((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200, 0);
        scene.add(sphere);
        liquidations.push({ mesh: sphere, life: 1 });
      };

      const animate = () => {
        if (!rendererRef.current) return;
        requestAnimationFrame(animate);
        points.rotation.z += isStressed ? 0.01 : 0.002;
        points.rotation.x = Math.sin(Date.now() * 0.0005) * 0.2;

        for (let i = liquidations.length - 1; i >= 0; i--) {
          const liq = liquidations[i];
          liq.mesh.position.lerp(new THREE.Vector3(0, 0, 0), 0.05);
          liq.mesh.scale.multiplyScalar(0.95);
          liq.life -= 0.02;

          if (liq.life <= 0) {
            scene.remove(liq.mesh);
            liquidations.splice(i, 1);
            setStats(prev => ({ liquidations: prev.liquidations + 1, volume: prev.volume + Math.floor(Math.random() * 100000) }));
          }
        }
        if (Math.random() > (isStressed ? 0.8 : 0.95)) createLiquidation(Math.random() > 0.5 ? 'long' : 'short');
        rendererRef.current.render(scene, camera);
      };
      animate();
    }

    const handleResize = () => {
        if (!mountRef.current || !rendererRef.current) return;
        rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => { 
        window.removeEventListener('resize', handleResize);
        if (rendererRef.current && mountRef.current) {
             mountRef.current.removeChild(rendererRef.current.domElement); 
             rendererRef.current = null;
        }
    };
  }, [isStressed]);

  return (
    <div className="relative w-full h-full min-h-[250px] overflow-hidden">
        <div ref={mountRef} className="absolute inset-0 w-full h-full" />
        <div className="absolute top-2 left-2 flex flex-col gap-2 pointer-events-none z-10">
          <div className="bg-black/60 border border-emerald-500/20 p-2 backdrop-blur-md rounded">
             <div className="text-[9px] text-zinc-500 uppercase font-black">Gravity_Well_Depth</div>
             <div className="text-lg font-black tracking-tighter text-white">4.821_LY</div>
          </div>
          {isStressed && (
              <div className="bg-black/60 border border-red-500/20 p-2 backdrop-blur-md rounded animate-pulse">
                 <div className="text-[9px] text-red-500/50 uppercase font-black">Crit_Pressure_Alert</div>
                 <div className="flex items-center gap-2"><AlertTriangle size={12} className="text-red-500" /><span className="text-xs font-black text-red-500 tracking-widest">HIGH_VOL</span></div>
              </div>
          )}
        </div>
        <div className="absolute bottom-2 right-2 bg-black/60 border border-emerald-500/20 p-2 backdrop-blur-md rounded text-right pointer-events-none z-10">
          <div className="text-[9px] text-zinc-500 uppercase font-black mb-1">Session_Absorption</div>
          <div className="text-xl font-black text-emerald-400 tabular-nums">{stats.liquidations.toLocaleString()} <span className="text-[10px] text-zinc-500">UNITS</span></div>
          <div className="text-xs font-bold text-white mt-1">${(stats.volume / 1000000).toFixed(2)}M <span className="text-emerald-900">VOL</span></div>
        </div>
    </div>
  );
};

const SpectacularGlobe = ({ isStressed, opacity = 0.4 }) => {
    const mountRef = useRef(null);
    const rendererRef = useRef(null);

    useEffect(() => {
        if (window.THREE) initGlobe();
        else {
             const script = document.createElement('script');
             script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
             script.onload = initGlobe;
             document.head.appendChild(script);
        }

        function initGlobe() {
          const THREE = window.THREE;
          if (!mountRef.current) return;
          const width = mountRef.current.clientWidth;
          const height = mountRef.current.clientHeight;
          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
          camera.position.set(0, 0, 180);
          rendererRef.current = new THREE.WebGLRenderer({ antialias: true, alpha: true });
          rendererRef.current.setSize(width, height);
          mountRef.current.appendChild(rendererRef.current.domElement);
          const globe = new THREE.Group();
          scene.add(globe);
          const pointCount = 700;
          const pointGeom = new THREE.BufferGeometry();
          const positions = new Float32Array(pointCount * 3);
          for (let i = 0; i < pointCount; i++) {
              const phi = Math.acos(-1 + (2 * i) / pointCount);
              const theta = Math.sqrt(pointCount * Math.PI) * phi;
              const r = 85;
              positions[i * 3] = r * Math.cos(theta) * Math.sin(phi);
              positions[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
              positions[i * 3 + 2] = r * Math.cos(phi);
          }
          pointGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          const pointMat = new THREE.PointsMaterial({ color: isStressed ? 0xffffff : 0x10b981, size: 1.2, transparent: true, opacity: 0.5 });
          const points = new THREE.Points(pointGeom, pointMat);
          globe.add(points);
          const lineMat = new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.08 });
          for (let i = 0; i < 45; i++) {
              const curve = new THREE.EllipseCurve(0, 0, 85, 85, 0, 2 * Math.PI, false, Math.random() * Math.PI);
              const pathPoints = curve.getPoints(50);
              const lineGeom = new THREE.BufferGeometry().setFromPoints(pathPoints);
              const line = new THREE.Line(lineGeom, lineMat);
              line.rotation.x = Math.random() * Math.PI;
              line.rotation.y = Math.random() * Math.PI;
              globe.add(line);
          }
          const animate = () => {
              if (!rendererRef.current) return;
              const factor = isStressed ? 5 : 1;
              globe.rotation.y += 0.0015 * factor;
              globe.rotation.x += 0.0004 * factor;
              rendererRef.current.render(scene, camera);
              requestAnimationFrame(animate);
          };
          animate();
        }
        return () => { if (rendererRef.current && mountRef.current) mountRef.current.removeChild(rendererRef.current.domElement); };
    }, [isStressed]);

    return <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} />;
};

// --- NOUVEAU MODULE: L'ORACLE DE PROJECTION (NEURAL FORWARD WAVE) ---
const NeuralOracle = ({ isStressed }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Config de la simulation
    let points = [];
    const historyLength = 60; // Points passés
    const projectionLength = 30; // Points futurs
    
    // Init data
    for (let i = 0; i < historyLength; i++) {
        points.push(50 + Math.sin(i * 0.2) * 20 + (Math.random() - 0.5) * 10);
    }

    const resize = () => {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    let offset = 0;

    const draw = () => {
        if (!canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // --- 1. GRILLE DE FOND ---
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for(let i=0; i<canvas.width; i+=40) { ctx.moveTo(i,0); ctx.lineTo(i,canvas.height); }
        for(let i=0; i<canvas.height; i+=40) { ctx.moveTo(0,i); ctx.lineTo(canvas.width,i); }
        ctx.stroke();

        // --- 2. CALCUL DYNAMIQUE ---
        offset += 0.05;
        // Simule un nouveau prix entrant
        const lastVal = points[points.length-1];
        const trend = isStressed ? -0.5 : 0.1;
        const noise = (Math.random() - 0.5) * 4;
        const newVal = lastVal + Math.sin(offset) * 2 + noise + trend;
        
        // Shift array
        points.push(newVal);
        if(points.length > historyLength) points.shift();

        // Mapping coords
        const w = canvas.width;
        const h = canvas.height;
        const totalPoints = historyLength + projectionLength;
        const step = w / totalPoints;
        const scaleY = (val) => h/2 - (val - 50) * 2; // Centré sur 50

        // --- 3. DESSIN HISTORIQUE (PASSÉ) ---
        ctx.beginPath();
        ctx.moveTo(0, scaleY(points[0]));
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(i * step, scaleY(points[i]));
        }
        ctx.strokeStyle = isStressed ? '#ef4444' : '#10b981';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Lueur sous la ligne
        ctx.lineTo((points.length-1)*step, h);
        ctx.lineTo(0, h);
        ctx.fillStyle = isStressed 
            ? 'linear-gradient(to bottom, rgba(239, 68, 68, 0.2), transparent)' 
            : 'linear-gradient(to bottom, rgba(16, 185, 129, 0.2), transparent)';
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, isStressed ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fill();

        // --- 4. ORACLE (FUTUR) ---
        // Point de départ de la projection
        const startX = (points.length - 1) * step;
        const startY = scaleY(points[points.length - 1]);
        
        // Cône d'incertitude
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        // Haut du cône (Scénario Optimiste)
        ctx.bezierCurveTo(
            startX + w * 0.2, startY - (isStressed ? 20 : 50),
            startX + w * 0.4, startY - (isStressed ? 10 : 100),
            w, startY - (isStressed ? 50 : 150)
        );
        // Bas du cône (Scénario Pessimiste)
        ctx.lineTo(w, startY + (isStressed ? 150 : 50));
        ctx.bezierCurveTo(
            startX + w * 0.4, startY + (isStressed ? 100 : 10),
            startX + w * 0.2, startY + (isStressed ? 50 : 20),
            startX, startY
        );
        ctx.fillStyle = isStressed ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.05)';
        ctx.fill();

        // Ligne de projection médiane (Probabilité Max)
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        // Projection simple
        ctx.quadraticCurveTo(
            startX + w * 0.2, startY + (isStressed ? 40 : -20),
            w, startY + (isStressed ? 100 : -40)
        );
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = isStressed ? '#ef4444' : '#34d399';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);

        // Pulse sur le présent
        ctx.beginPath();
        ctx.arc(startX, startY, 4, 0, Math.PI*2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        
        requestAnimationFrame(draw);
    };
    
    draw();
    return () => window.removeEventListener('resize', resize);
  }, [isStressed]);

  return (
      <div className="relative w-full h-full min-h-[150px] overflow-hidden bg-black/80">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <div className="absolute top-2 left-2 pointer-events-none z-10">
          <div className="bg-black/80 border border-emerald-500/20 p-1 px-2 backdrop-blur-md rounded flex items-center gap-2">
            <TrendingUp size={10} className={isStressed ? 'text-red-500' : 'text-emerald-500'} />
            <span className="text-[9px] font-black text-zinc-400">PROB_VECTOR: <span className={isStressed ? 'text-red-400 blink' : 'text-emerald-400'}>{isStressed ? 'BEARISH_DIVERGENCE' : 'ACCUMULATION'}</span></span>
          </div>
        </div>
      </div>
  );
};

/* =========================================
   2. COMPOSANTS TACTIQUES
   ========================================= */
const CombatOrderEntry = ({ onOrder, isStressed }) => {
  const [side, setSide] = useState('BUY');
  const [amount, setAmount] = useState('');
  return (
    <div className={`flex flex-col gap-4 transition-all duration-300 ${isStressed ? 'scale-[0.98]' : ''}`}>
      <div className="flex bg-zinc-900/50 p-1 border border-zinc-800 rounded">
        {['BUY', 'SELL'].map(s => (
          <button key={s} onMouseDown={(e) => e.stopPropagation()} onClick={() => setSide(s)} className={`flex-1 py-3 text-[10px] font-black tracking-widest transition-all ${side === s ? (s === 'BUY' ? 'bg-emerald-600 text-black shadow-lg' : 'bg-red-600 text-white') : 'text-zinc-600'}`}>{s}</button>
        ))}
      </div>
      <input type="number" value={amount} onMouseDown={(e) => e.stopPropagation()} onChange={(e) => setAmount(e.target.value)} className="bg-transparent border border-zinc-800 p-4 text-emerald-400 text-lg outline-none font-black tracking-tighter" placeholder="0.00" />
      <button onMouseDown={(e) => e.stopPropagation()} onClick={() => { onOrder({ side, amount, symbol: 'BTC/USD' }); setAmount(''); }} className={`w-full py-4 font-black text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all ${side === 'BUY' ? 'bg-emerald-600 text-black' : 'bg-red-600 text-white'}`}><Zap size={14} fill="currentColor" /> EXEC_COMMIT</button>
    </div>
  );
};

// -- FENÊTRE TACTIQUE MODULAIRE (AVEC REDUCTION & GESTION TAILLE) --
const TacticalWindow = ({ title, icon: Icon, children, className = "", subTitle, isStressed, onDragStart, onDragOver, onDragEnd, id, index, collapsed, onToggle, onResize, sizeMode }) => {
  // Détermine la classe finale selon l'état
  let finalClass = className; // Par défaut
  if (collapsed) {
      finalClass = 'row-span-1 h-[40px] col-span-12'; // Réduit : prend une ligne
  } else {
      if (sizeMode === 'large') finalClass = 'col-span-12 md:col-span-6 row-span-4';
      else if (sizeMode === 'wide') finalClass = 'col-span-12 row-span-2';
      // Sinon reste sur className original
  }

  return (
    <div 
        draggable="true"
        onDragStart={(e) => onDragStart(e, index)}
        onDragOver={(e) => onDragOver(e, index)}
        onDragEnd={onDragEnd}
        className={`flex flex-col ${THEME.surface} border ${THEME.border} ${finalClass} relative group overflow-hidden transition-all duration-300 draggable-item ${isStressed ? 'border-emerald-500/40 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]' : ''}`}
    >
        <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/60 border-b border-zinc-800/80 shrink-0 z-20 cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-2">
            <GripVertical size={12} className="text-zinc-600 group-hover:text-emerald-500 transition-colors" />
            <Icon size={12} className={isStressed ? 'text-white animate-pulse' : 'text-emerald-500'} />
            <span className={`text-[10px] font-black tracking-widest uppercase glow-text ${isStressed ? 'text-white' : 'text-zinc-300'}`}>{title}</span>
            {subTitle && !collapsed && <span className="text-[8px] font-bold text-zinc-600 hidden sm:inline ml-2">{subTitle}</span>}
        </div>
        <div className="flex items-center gap-2" onMouseDown={(e) => e.stopPropagation()}>
            {/* BOUTON RESIZE (CYCLE) */}
            <button onClick={() => onResize(index)} className={`text-zinc-600 hover:text-emerald-400 transition-colors ${collapsed ? 'hidden' : ''}`} title="Cycle Size">
               <Scaling size={10} />
            </button>
            {/* BOUTON COLLAPSE / RESTORE */}
            <button onClick={() => onToggle(index)} className={`transition-colors ${collapsed ? 'text-emerald-500 animate-pulse' : 'text-zinc-500 hover:text-red-400'}`}>
                {collapsed ? <Maximize2 size={10} /> : <Minus size={10} />}
            </button>
        </div>
        </div>
        {!collapsed && (
            <div className="flex-1 p-3 overflow-hidden relative flex flex-col z-10" onMouseDown={e => e.stopPropagation()}>
            {children}
            </div>
        )}
    </div>
  );
};

/* =========================================
   3. CŒUR DU TERMINAL (OMNI-DECK)
   ========================================= */
export default function App() {
  const [isLive, setIsLive] = useState(false);
  const [isStressed, setIsStressed] = useState(false);
  const [isStealth, setIsStealth] = useState(false);
  const [isLiquidating, setIsLiquidating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [burstMode, setBurstMode] = useState(false);
  const [activeTab, setActiveTab] = useState('DASHBOARD');

  const [logs, setLogs] = useState(["SYSTEM_READY", "SECURE_UPLINK_STABLE", "VORTEX_ENGINE_ACTIVE", "NEURAL_ORACLE_ONLINE"]);
  const [orders, setOrders] = useState([]);
  const [input, setInput] = useState("");
  const [trades, setTrades] = useState([]);

  // --- DRAG AND DROP & LAYOUT STATE ---
  // sizeMode: 'default' | 'large' | 'wide'
  const initialLayout = [
    { id: 'vortex', component: 'Vortex', title: 'LIQUIDATION_VORTEX', icon: Box, subTitle: 'GRAVITY_WELL', className: 'col-span-12 md:col-span-6 row-span-4', isCollapsed: false, sizeMode: 'default' },
    { id: 'oracle', component: 'Oracle', title: 'NEURAL_ORACLE', icon: TrendingUp, subTitle: 'PROB_VECTOR', className: 'col-span-12 md:col-span-6 row-span-2', isCollapsed: false, sizeMode: 'default' }, // NOUVEAU MODULE ORACLE
    { id: 'matrix', component: 'Matrix', title: 'CORRELATION_MATRIX', icon: Share2, subTitle: 'NEURAL_NET', className: 'col-span-12 md:col-span-3 row-span-2', isCollapsed: false, sizeMode: 'default' }, 
    { id: 'cloud', component: 'Cloud', title: 'SENTIMENT_CLOUD', icon: Cloud, subTitle: 'SOCIAL_SWARM', className: 'col-span-12 md:col-span-3 row-span-2', isCollapsed: false, sizeMode: 'default' },
    { id: 'cmd', component: 'CMD', title: 'Command_Center', icon: Terminal, className: 'col-span-12 md:col-span-6 row-span-2 border-emerald-500/20 bg-emerald-950/5', isCollapsed: false, sizeMode: 'default' },
    { id: 'pos', component: 'Positions', title: 'Active_Positions', icon: List, className: 'col-span-12 md:col-span-4 row-span-2', isCollapsed: false, sizeMode: 'default' },
    { id: 'exec', component: 'Execution', title: 'Order_Execution', icon: Zap, className: 'col-span-12 md:col-span-3 row-span-2', isCollapsed: false, sizeMode: 'default' }, 
    { id: 'risk', component: 'Risk', title: 'Risk_Monitor', icon: Gauge, className: 'col-span-12 md:col-span-5 row-span-2', isCollapsed: false, sizeMode: 'default' },
  ];
  const [layout, setLayout] = useState(initialLayout);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const onDragStart = (e, index) => {
    dragItem.current = index;
    e.target.classList.add('dragging');
  };

  const onDragEnter = (e, index) => {
    e.preventDefault();
    dragOverItem.current = index;
  };

  const onDragEnd = (e) => {
    e.target.classList.remove('dragging');
    const newLayout = [...layout];
    const draggedItemContent = newLayout[dragItem.current];
    newLayout.splice(dragItem.current, 1);
    newLayout.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setLayout(newLayout);
  };

  const toggleCollapse = (index) => {
      const newLayout = [...layout];
      newLayout[index].isCollapsed = !newLayout[index].isCollapsed;
      setLayout(newLayout);
  };

  const setGlobalCollapse = (collapsed) => {
      setLayout(prev => prev.map(item => ({...item, isCollapsed: collapsed})));
  };

  const toggleSize = (index) => {
      const newLayout = [...layout];
      const currentMode = newLayout[index].sizeMode || 'default';
      let nextMode = 'default';
      
      // Cycle: Default -> Large -> Wide -> Default
      if (currentMode === 'default') nextMode = 'large';
      else if (currentMode === 'large') nextMode = 'wide';
      else nextMode = 'default';
      
      newLayout[index].sizeMode = nextMode;
      setLayout(newLayout);
  };

  // --- SIMULATION DATA ---
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      const newTrade = {
        id: Date.now(), side: Math.random() > 0.5 ? 'BUY' : 'SELL', size: (Math.random() * 2).toFixed(4),
        price: (94000 + Math.random() * 500).toFixed(2), time: new Date().toLocaleTimeString('fr-FR', { hour12: false })
      };
      setTrades(prev => [newTrade, ...prev].slice(0, 15));
    }, 800);
    return () => clearInterval(interval);
  }, [isLive]);

  const addLog = (msg) => setLogs(prev => [msg, ...prev].slice(0, 50));

  const handleCommand = (e) => {
    if (e.key !== 'Enter') return;
    const cmd = input.trim().toUpperCase();
    setInput("");
    addLog(`> ${cmd}`);

    const launchTargets = {
      'SEA': 'SEA/index.html', 'PACMAN': 'Pacman/index.html', 'DOOM': 'Doom/index.html',
      'INDEX': 'index.html', 'OS': 'os/os.html', 'DRONE2': 'drone2/index.html',
      'KLONDIKE': 'klondike/index.html', 'PERF': 'perf/index.html', 'TWIX': 'twix/index.html',
      'TAMAGOTCHI': 'tamagotchi/index.html', 'AQUARIUM': 'aquarium/index.html', 'CALC': 'calc/index.html',
      'CALC2': 'calc2/index.html', 'CANDY': 'candy/index.html', 'CCTV': 'cctv/index.html',
      'CITY': 'city/index.html', 'CODEPAD': 'codepad/index.html', 'DRONE': 'drone/index.html',
      'FI': 'fi/index.html', 'GEO': 'geo/index.html', 'GRAPH': 'graph/index.html',
      'MAPMIND': 'mapmind/index.html', 'MINESWEEPER': 'minesweeper/index.html', 'MINUTEUR': 'minuteur/index.html',
      'NEWS': 'news/index.html', 'NUCLEUS': 'nucleus/index.html', 'PLANETARIUM': 'planetarium/index.html',
      'PPPD': 'pppd/index.html', 'SUDOKU': 'sudoku/index.html'
    };

    if (launchTargets[cmd]) {
      setIsStressed(true);
      addLog(`UPLINK: ${cmd}...`);
      setTimeout(() => { setIsStressed(false); window.open(`${window.location.origin}/${launchTargets[cmd]}`, '_blank'); }, 800);
      return;
    }

    switch(cmd) {
      case 'LIQUIDATE': setIsLiquidating(true); setOrders([]); addLog("CRITICAL: ALL_POSITIONS_PURGED"); setTimeout(() => setIsLiquidating(false), 500); break;
      case 'STEALTH': setIsStealth(!isStealth); addLog(isStealth ? "STEALTH_OFF" : "STEALTH_ON"); break;
      case 'NEURAL_SCAN': setIsScanning(true); addLog("RUNNING_NEURAL_SCAN..."); setTimeout(() => { setIsScanning(false); addLog("SENTIMENT: BULLISH_84%"); }, 2000); break;
      case 'RISK_FLUSH': setIsStressed(true); addLog("SCALING_EXPOSURE_-50%"); setOrders(prev => prev.map(o => ({...o, amount: (o.amount / 2).toFixed(4)}))); setTimeout(() => setIsStressed(false), 1000); break;
      case 'DATA_BURST': setBurstMode(true); addLog("DATA_BURST_ENGAGED"); setTimeout(() => setBurstMode(false), 3000); break;
      case 'CLEAR': setLogs([]); break;
      case 'HELP': 
        addLog("--- OMNI_LAUNCHER_V6.8 ---");
        addLog("APPS: AQUARIUM, CALC, CALC2, CANDY, CCTV, CITY");
        addLog("APPS: CODEPAD, DOOM, DRONE, DRONE2, FI, GEO");
        addLog("APPS: GRAPH, INDEX, KLONDIKE, MAPMIND, MINESWEEPER");
        addLog("APPS: MINUTEUR, NEWS, NUCLEUS, OS, PACMAN, PERF");
        addLog("APPS: PLANETARIUM, PPPD, SEA, SUDOKU, TAMAGOTCHI, TWIX");
        addLog("--- TACTICAL_OPS ---");
        addLog("CMDS: LIQUIDATE, STEALTH, NEURAL_SCAN, RISK_FLUSH, DATA_BURST");
        addLog("--- SYSTEM ---");
        addLog("CMDS: HELP, CLEAR");
        break;
      default: addLog(`ERR: CMD_${cmd}_UNKNOWN.`);
    }
  };

  const handleExecution = (order) => {
    setIsStressed(true); setTimeout(() => setIsStressed(false), 300);
    addLog(`EXEC_${order.side}: ${order.amount} ${order.symbol}`);
    setOrders(prev => [{...order, id: Date.now(), time: new Date().toLocaleTimeString()}, ...prev]);
  };

  // --- RENDER COMPONENT MAPPING ---
  const renderComponent = (type) => {
    switch(type) {
      case 'Vortex': return <VortexLiquidation isStressed={isStressed} />;
      case 'Matrix': return <CorrelationMatrix isStressed={isStressed} />;
      case 'Cloud': return <SentimentCloud isStressed={isStressed} />;
      case 'Oracle': return <NeuralOracle isStressed={isStressed} />; // RENDER ORACLE
      case 'LOB': return <LOB3DTerrain isStressed={isStressed} burstMode={burstMode} />;
      case 'Execution': return <CombatOrderEntry onOrder={handleExecution} isStressed={isStressed} />;
      case 'CMD': return (
        <>
          <SpectacularGlobe isStressed={isStressed} opacity={0.4} />
          <div className="flex-1 overflow-auto no-scrollbar space-y-1 mb-3 relative z-10">
            {logs.map((l, i) => <div key={i} className={`text-[10px] ${l.startsWith('>') ? 'text-emerald-400 font-bold' : l.startsWith('---') ? 'text-emerald-600 font-black' : 'text-zinc-600'}`}>{l}</div>)}
          </div>
          <div className="flex items-center gap-2 border-t border-emerald-900/50 pt-2 relative z-10">
            <ChevronRight size={14} className="text-emerald-500" />
            <input className="bg-transparent outline-none flex-1 text-[11px] text-white uppercase" value={input} onMouseDown={(e) => e.stopPropagation()} onChange={e => setInput(e.target.value)} onKeyDown={handleCommand} placeholder="ENTER_CMD..." autoFocus />
          </div>
        </>
      );
      case 'Tape': return <div className="flex flex-col gap-1 text-[9px] uppercase">{trades.map(t => (<div key={t.id} className="flex justify-between items-center border-l border-zinc-900 pl-2 animate-pop-in"><span className="opacity-30">{t.time}</span><span className={t.side === 'BUY' ? 'text-emerald-500 font-bold' : 'text-red-500 font-bold'}>{t.side}</span><span className="text-zinc-200">{t.size}</span><span className="text-zinc-700">{t.price}</span></div>))}</div>;
      case 'Positions': return <div className="flex flex-col h-full text-[9px] uppercase"><div className="grid grid-cols-4 pb-2 border-b border-zinc-900 font-black text-zinc-700"><span>Asset</span><span>Side</span><span>Size</span><span>PnL</span></div><div className="flex-1 overflow-auto no-scrollbar">{orders.map(o => (<div key={o.id} className="grid grid-cols-4 py-2 border-b border-zinc-900/50 items-center"><span className="font-bold text-zinc-300">{o.symbol}</span><span className={o.side === 'BUY' ? 'text-emerald-500' : 'text-red-500'}>{o.side}</span><span className="text-zinc-500">{o.amount}</span><span className="text-emerald-400 font-bold">+$142.20</span></div>))}</div></div>;
      case 'Risk': return <div className="grid grid-cols-2 gap-4 h-full items-center">{[{ l: 'VaR_99%', v: '$42,100', d: '-0.4%' }, { l: 'Beta_Exp', v: '0.84', d: '+1.2%' }, { l: 'DD_Max', v: '2.14%', d: '0.0%' }, { l: 'Node_Auth', v: 'SECURE', d: 'ECC_ON' }].map(item => (<div key={item.l} className="flex flex-col border-l border-zinc-900 pl-4"><span className="text-[8px] font-black text-zinc-700 uppercase">{item.l}</span><div className="flex items-baseline gap-2"><span className={`text-sm font-black tracking-tighter ${isStressed && item.l === 'Node_Auth' ? 'text-red-500' : 'text-zinc-200'}`}>{item.v}</span><span className="text-[8px] font-bold text-emerald-500">{item.d}</span></div></div>))}</div>;
      default: return null;
    }
  };

  if (!isLive) {
    return (
      <div className="h-screen w-screen bg-[#010102] flex flex-col items-center justify-center font-mono p-6 relative overflow-hidden">
        <GlobalCinemaStyles />
        <div className="crt-overlay" />
        <div className="scanline" />
        <SpectacularGlobe isStressed={false} opacity={0.5} />
        <div className="relative z-10 flex flex-col items-center gap-10">
          <div className="relative">
             <Crosshair size={120} className="text-emerald-500/20 animate-[spin_15s_linear_infinite]" strokeWidth={0.5} />
             <Shield size={42} className="text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 glow-text" />
          </div>
          <div className="text-center space-y-3">
            <h1 className="text-white text-xl tracking-[1.5em] md:tracking-[2.5em] uppercase font-black ml-[1.5em] md:ml-[2.5em] glow-text">Leonce_Equity</h1>
            <p className="text-emerald-900 text-[10px] font-bold tracking-[0.8em] uppercase">Sovereign_Omni_Deck_V6.8</p>
          </div>
          <button onClick={() => setIsLive(true)} className="group relative px-16 py-4 border border-emerald-500/20 text-emerald-500 uppercase tracking-[1em] overflow-hidden transition-all hover:border-emerald-500 bg-black/40 backdrop-blur-sm">
            <span className="relative z-10 group-hover:text-black transition-colors">Start_Uplink</span>
            <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-[100dvh] w-screen ${THEME.bg} flex flex-col font-mono text-zinc-400 overflow-hidden relative grid-bg ${isStressed ? 'system-stress' : ''} ${isStealth ? 'stealth-mode' : ''} ${isLiquidating ? 'liquidate-flash' : ''}`}>
      <GlobalCinemaStyles />
      <div className="scanline" />
      <div className="crt-overlay" />
      {isScanning && <div className="scan-bar" />}

      <header className="h-14 border-b border-zinc-800/50 bg-black/90 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <Shield className="text-emerald-500" size={18} />
          <div className="flex flex-col">
            <span className="font-black text-xs text-white tracking-widest italic glow-text">LEONCE_EQUITY</span>
            <span className="text-[8px] text-zinc-700 font-bold uppercase tracking-tighter">Combat_Node_V6</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
            
          {/* GLOBAL CONTROLS */}
          <div className="flex items-center gap-2 mr-4 border-r border-zinc-900 pr-4">
              <button onClick={() => setGlobalCollapse(true)} className="text-zinc-500 hover:text-white transition-colors" title="COLLAPSE_ALL">
                  <Minimize2 size={14} />
              </button>
              <button onClick={() => setGlobalCollapse(false)} className="text-zinc-500 hover:text-emerald-500 transition-colors" title="EXPAND_ALL">
                  <Maximize2 size={14} />
              </button>
          </div>

          <div className="hidden sm:flex flex-col items-end border-r border-zinc-900 pr-6 mr-6">
            <span className="text-[8px] text-zinc-600 uppercase font-black">Net_Liquidity</span>
            <span className="text-xs text-emerald-500 font-black tracking-tighter">$1,240,492</span>
          </div>
          <Radio size={16} className={isStressed ? 'text-red-500 animate-ping' : 'text-emerald-500 animate-pulse'} />
        </div>
      </header>

      <main className="hidden md:grid flex-1 p-2 grid-cols-12 grid-rows-6 gap-2 relative overflow-hidden">
        {layout.map((item, index) => (
          <TacticalWindow 
            key={item.id}
            index={index}
            id={item.id}
            title={item.title} 
            icon={item.icon} 
            subTitle={item.subTitle} 
            className={item.className} 
            isStressed={isStressed}
            collapsed={item.isCollapsed}
            sizeMode={item.sizeMode}
            onToggle={toggleCollapse}
            onResize={toggleSize}
            onDragStart={onDragStart}
            onDragOver={onDragEnter}
            onDragEnd={onDragEnd}
          >
            {renderComponent(item.component)}
          </TacticalWindow>
        ))}
      </main>

      {/* VIEW MOBILE */}
      <main className="md:hidden flex-1 p-2 relative">
        {activeTab === 'DASHBOARD' && (
           <div className="flex flex-col h-full gap-2">
              <TacticalWindow title="NEURAL_ORACLE" icon={TrendingUp} className="flex-1" isStressed={isStressed}><NeuralOracle isStressed={isStressed} /></TacticalWindow>
              <TacticalWindow title="LIQ_VORTEX" icon={Box} className="flex-1" isStressed={isStressed}><VortexLiquidation isStressed={isStressed} /></TacticalWindow>
              <TacticalWindow title="SENTIMENT_CLOUD" icon={Cloud} className="h-48" isStressed={isStressed}><SentimentCloud isStressed={isStressed} /></TacticalWindow>
              <TacticalWindow title="CORR_MATRIX" icon={Share2} className="h-48" isStressed={isStressed}><CorrelationMatrix isStressed={isStressed} /></TacticalWindow>
              <TacticalWindow title="CMD_CENTER" icon={Terminal} className="h-40 relative" isStressed={isStressed}>
                <SpectacularGlobe isStressed={isStressed} opacity={0.3} />
                <div className="flex-1 overflow-auto no-scrollbar text-[9px] mb-2 relative z-10">{logs.slice(0,5).map((l,i)=><div key={i}>{l}</div>)}</div>
                <div className="flex items-center gap-2 border-t border-zinc-800 pt-2 relative z-10"><ChevronRight size={12} className="text-emerald-500" /><input className="bg-transparent outline-none flex-1 text-[10px] uppercase" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleCommand} placeholder="CMD..." /></div>
              </TacticalWindow>
           </div>
        )}
        {activeTab === 'EXECUTION' && (<TacticalWindow title="Execution" icon={Zap} className="h-full" isStressed={isStressed}><CombatOrderEntry onOrder={handleExecution} isStressed={isStressed} /></TacticalWindow>)}
        {activeTab === 'RISK' && (<TacticalWindow title="Risk" icon={Gauge} className="h-full" isStressed={isStressed}><div className="grid grid-cols-2 gap-4">{[{l:'VaR', v:'$42K'}, {l:'Exp', v:'$842K'}, {l:'DD', v:'2.1%'}, {l:'Lat', v:'12ms'}].map(i => (<div key={i.l} className="p-4 bg-zinc-900/40 border border-zinc-800 rounded"><span className="text-[8px] text-zinc-600 font-bold uppercase">{i.l}</span><div className="text-base font-black text-zinc-200 tracking-tighter">{i.v}</div></div>))}</div></TacticalWindow>)}
      </main>

      <footer className="h-8 md:h-10 border-t border-zinc-900 bg-black flex items-center shrink-0 z-50 overflow-hidden">
        <div className="bg-emerald-950/20 h-full flex items-center px-4 border-r border-zinc-800 shrink-0 z-10"><span className="text-[9px] font-black text-emerald-500 uppercase italic animate-pulse">Live_Intel</span></div>
        <div className="flex-1 relative overflow-hidden flex items-center">
          <div className="animate-ticker whitespace-nowrap flex items-center gap-12 text-[9px] font-bold text-zinc-600 uppercase">
            <span>WHALE_ALERT: +1,240 BTC BINANCE /// MARKET_SENTIMENT: 84% BULLISH /// VOLATILITY_SCAN: HIGH_ALERT /// NODE_STABILITY: 100% /// FED_WATCH: T-14D TO CPI_RELEASE /// SECURE_UPLINK: AES_256_ACTIVE ///</span>
            <span>WHALE_ALERT: +1,240 BTC BINANCE /// MARKET_SENTIMENT: 84% BULLISH /// VOLATILITY_SCAN: HIGH_ALERT /// NODE_STABILITY: 100% /// FED_WATCH: T-14D TO CPI_RELEASE /// SECURE_UPLINK: AES_256_ACTIVE ///</span>
          </div>
        </div>
        <div className="md:hidden flex w-full h-full absolute inset-0 bg-black">{[{ id: 'DASHBOARD', icon: Box, label: 'SCAN' }, { id: 'EXECUTION', icon: Zap, label: 'EXEC' }, { id: 'RISK', icon: Gauge, label: 'RISK' }].map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex flex-col items-center justify-center gap-1 ${activeTab === tab.id ? 'text-emerald-500 bg-emerald-500/5' : 'text-zinc-800'}`}><tab.icon size={18} /><span className="text-[8px] font-black uppercase">{tab.label}</span></button>))}</div>
      </footer>
    </div>
  );
}
