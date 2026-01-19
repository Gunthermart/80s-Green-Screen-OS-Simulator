import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Terminal, Shield, Zap, ChevronRight, List, 
  Crosshair, Radio, Gauge, Box, GripVertical, AlertTriangle,
  Share2, Cloud, Minus, Maximize2, Minimize2,
  TrendingUp, ChevronsRight, Network // AJOUT DE L'IMPORT MANQUANT
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
    
    .draggable-item { transition: transform 0.1s ease, box-shadow 0.2s ease; }
    .drag-handle { cursor: grab; }
    .drag-handle:active { cursor: grabbing; }
    .dragging .drag-handle { cursor: grabbing; }
    
    .resize-handle {
        cursor: nwse-resize;
        position: absolute;
        bottom: 0;
        right: 0;
        width: 20px;
        height: 20px;
        z-index: 60;
    }
    .resize-handle::after {
        content: '';
        position: absolute;
        bottom: 4px;
        right: 4px;
        width: 6px;
        height: 6px;
        border-right: 2px solid #047857;
        border-bottom: 2px solid #047857;
        transition: all 0.2s;
    }
    .resize-handle:hover::after {
        border-color: #10b981;
        width: 10px;
        height: 10px;
    }

    /* Mobile optimisations */
    .mobile-scroll-container {
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
    }
    
    /* Animations Mobile Fun */
    @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    
    .animate-ticker { display: flex; width: fit-content; animation: ticker 30s linear infinite; }
    @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

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
  const cameraRef = useRef(null);

  useEffect(() => {
    let scene, terrain, geometry;
    let resizeObserver;
    let animationId;

    function initThree() {
      const THREE = window.THREE;
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.set(0, 25, 35);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

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
        animationId = requestAnimationFrame(animate);
      };
      animate();

      resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            if (rendererRef.current && cameraRef.current) {
                const { width, height } = entry.contentRect;
                cameraRef.current.aspect = width / height;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(width, height);
            }
        }
      });
      resizeObserver.observe(mountRef.current);
    }

    if (window.THREE) initThree();
    else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.onload = initThree;
      document.head.appendChild(script);
    }
    
    return () => { 
        if (animationId) cancelAnimationFrame(animationId);
        if (resizeObserver) resizeObserver.disconnect();
        if (rendererRef.current && mountRef.current) {
             mountRef.current.removeChild(rendererRef.current.domElement); 
             rendererRef.current = null;
        }
    };
  }, [isStressed, burstMode]);

  return <div ref={mountRef} className="w-full h-full min-h-[200px]" />;
};

const CorrelationMatrix = ({ isStressed }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const assets = ['BTC', 'ETH', 'SOL', 'NDX', 'SPX', 'DXY', 'GOLD', 'OIL', 'VIX'];
    let nodes = assets.map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5
    }));

    const resize = () => {
        if(containerRef.current && canvas){
            canvas.width = containerRef.current.clientWidth;
            canvas.height = containerRef.current.clientHeight;
        }
    };
    
    const resizeObserver = new ResizeObserver(() => resize());
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    resize();

    let animationFrameId;
    const draw = () => {
      if (!ctx || !canvas) return;
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
      animationFrameId = requestAnimationFrame(draw);
    };
    draw();
    
    return () => {
        resizeObserver.disconnect();
        cancelAnimationFrame(animationFrameId);
    };
  }, [isStressed]);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[150px] overflow-hidden bg-black">
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
  const cameraRef = useRef(null);
  const [sentiment, setSentiment] = useState({ label: 'GREED', value: 72 });

  useEffect(() => {
    let resizeObserver;
    let animationId;

    function initCloud() {
      const THREE = window.THREE;
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 40;
      cameraRef.current = camera;

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
        animationId = requestAnimationFrame(animate);
        
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

      resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            if (rendererRef.current && cameraRef.current) {
                const { width, height } = entry.contentRect;
                cameraRef.current.aspect = width / height;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(width, height);
            }
        }
      });
      resizeObserver.observe(mountRef.current);
    }

    if (window.THREE) initCloud();
    else {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      script.onload = initCloud;
      document.head.appendChild(script);
    }

    return () => { 
        if (animationId) cancelAnimationFrame(animationId);
        if (resizeObserver) resizeObserver.disconnect();
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
  const cameraRef = useRef(null);
  const [stats, setStats] = useState({ liquidations: 0, volume: 0 });

  useEffect(() => {
    let resizeObserver;
    let animationId;

    function initVortex() {
      const THREE = window.THREE;
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 200;
      cameraRef.current = camera;

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
        animationId = requestAnimationFrame(animate);
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

      resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            if (rendererRef.current && cameraRef.current) {
                const { width, height } = entry.contentRect;
                cameraRef.current.aspect = width / height;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(width, height);
            }
        }
      });
      resizeObserver.observe(mountRef.current);
    }

    if (window.THREE) initVortex();
    else {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
        script.onload = initVortex;
        document.head.appendChild(script);
    }

    return () => { 
        if (animationId) cancelAnimationFrame(animationId);
        if (resizeObserver) resizeObserver.disconnect();
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
    const cameraRef = useRef(null);

    useEffect(() => {
        let resizeObserver;
        let animationId;

        function initGlobe() {
          const THREE = window.THREE;
          if (!mountRef.current) return;
          const width = mountRef.current.clientWidth;
          const height = mountRef.current.clientHeight;
          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
          camera.position.set(0, 0, 180);
          cameraRef.current = camera;

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

          // --- ARTEFACTS (Fuschia Glitches) ---
          const artifactGeo = new THREE.BufferGeometry();
          const artifactCount = 60;
          const artifactPos = new Float32Array(artifactCount * 3);
          for (let i = 0; i < artifactCount; i++) {
              const r = 85 + Math.random() * 5; 
              const theta = Math.random() * Math.PI * 2;
              const phi = Math.acos(2 * Math.random() - 1);
              artifactPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
              artifactPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
              artifactPos[i * 3 + 2] = r * Math.cos(phi);
          }
          artifactGeo.setAttribute('position', new THREE.BufferAttribute(artifactPos, 3));
          const artifactMat = new THREE.PointsMaterial({ color: 0xd946ef, size: 2, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });
          const artifacts = new THREE.Points(artifactGeo, artifactMat);
          globe.add(artifacts);

          // --- COMMUNICATION ARCS ---
          const commsGroup = new THREE.Group();
          globe.add(commsGroup);
          
          const getSpherePoint = (r) => {
              const theta = Math.random() * Math.PI * 2;
              const phi = Math.acos(2 * Math.random() - 1);
              return new THREE.Vector3(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
          };

          const activeComms = [];
          for(let i=0; i<20; i++) {
              const start = getSpherePoint(85);
              const end = getSpherePoint(85);
              const dist = start.distanceTo(end);
              const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(85 + dist * 0.5); 
              
              const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
              const points = curve.getPoints(30);
              const geometry = new THREE.BufferGeometry().setFromPoints(points);
              const material = new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.1 });
              const curveMesh = new THREE.Line(geometry, material);
              commsGroup.add(curveMesh);

              const packet = new THREE.Mesh(new THREE.SphereGeometry(1, 4, 4), new THREE.MeshBasicMaterial({ color: 0xd946ef }));
              commsGroup.add(packet);
              activeComms.push({ curve: curve, packet: packet, progress: Math.random(), speed: 0.005 + Math.random() * 0.01 });
          }

          const animate = () => {
              if (!rendererRef.current) return;
              const factor = isStressed ? 5 : 1;
              globe.rotation.y += 0.0015 * factor;
              globe.rotation.x += 0.0004 * factor;
              artifacts.rotation.y -= 0.002 * factor;
              activeComms.forEach(comm => {
                  comm.progress += comm.speed * factor;
                  if(comm.progress > 1) comm.progress = 0;
                  const pos = comm.curve.getPoint(comm.progress);
                  comm.packet.position.copy(pos);
              });
              rendererRef.current.render(scene, camera);
              animationId = requestAnimationFrame(animate);
          };
          animate();

          resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                if (rendererRef.current && cameraRef.current) {
                    const { width, height } = entry.contentRect;
                    cameraRef.current.aspect = width / height;
                    cameraRef.current.updateProjectionMatrix();
                    rendererRef.current.setSize(width, height);
                }
            }
          });
          resizeObserver.observe(mountRef.current);
        }
        
        if (window.THREE) initGlobe();
        else {
             const script = document.createElement('script');
             script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
             script.onload = initGlobe;
             document.head.appendChild(script);
        }

        return () => { 
            if (animationId) cancelAnimationFrame(animationId);
            if (resizeObserver) resizeObserver.disconnect();
            if (rendererRef.current && mountRef.current) mountRef.current.removeChild(rendererRef.current.domElement); 
        };
    }, [isStressed]);

    return <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} />;
};

// --- NOUVEAU MODULE: L'ORACLE DE PROJECTION ---
const NeuralOracle = ({ isStressed }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let points = [];
    const historyLength = 60; 
    const projectionLength = 30; 
    
    for (let i = 0; i < historyLength; i++) {
        points.push(50 + Math.sin(i * 0.2) * 20 + (Math.random() - 0.5) * 10);
    }

    const resize = () => {
        if (containerRef.current && canvas) {
            canvas.width = containerRef.current.clientWidth;
            canvas.height = containerRef.current.clientHeight;
        }
    };
    
    const resizeObserver = new ResizeObserver(() => resize());
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    resize();

    let offset = 0;
    let animationFrameId;

    const draw = () => {
        if (!canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for(let i=0; i<canvas.width; i+=40) { ctx.moveTo(i,0); ctx.lineTo(i,canvas.height); }
        for(let i=0; i<canvas.height; i+=40) { ctx.moveTo(0,i); ctx.lineTo(canvas.width,i); }
        ctx.stroke();

        offset += 0.05;
        const lastVal = points[points.length-1];
        const trend = isStressed ? -0.5 : 0.1;
        const noise = (Math.random() - 0.5) * 4;
        const newVal = lastVal + Math.sin(offset) * 2 + noise + trend;
        
        points.push(newVal);
        if(points.length > historyLength) points.shift();

        const w = canvas.width;
        const h = canvas.height;
        const totalPoints = historyLength + projectionLength;
        const step = w / totalPoints;
        const scaleY = (val) => h/2 - (val - 50) * 2; 

        ctx.beginPath();
        ctx.moveTo(0, scaleY(points[0]));
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(i * step, scaleY(points[i]));
        }
        ctx.strokeStyle = isStressed ? '#ef4444' : '#10b981';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.lineTo((points.length-1)*step, h);
        ctx.lineTo(0, h);
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, isStressed ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fill();

        const startX = (points.length - 1) * step;
        const startY = scaleY(points[points.length - 1]);
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        ctx.bezierCurveTo(startX + w * 0.2, startY - (isStressed ? 20 : 50), startX + w * 0.4, startY - (isStressed ? 10 : 100), w, startY - (isStressed ? 50 : 150));
        ctx.lineTo(w, startY + (isStressed ? 150 : 50));
        ctx.bezierCurveTo(startX + w * 0.4, startY + (isStressed ? 100 : 10), startX + w * 0.2, startY + (isStressed ? 50 : 20), startX, startY);
        ctx.fillStyle = isStressed ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.05)';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(startX + w * 0.2, startY + (isStressed ? 40 : -20), w, startY + (isStressed ? 100 : -40));
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = isStressed ? '#ef4444' : '#34d399';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.arc(startX, startY, 4, 0, Math.PI*2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        
        animationFrameId = requestAnimationFrame(draw);
    };
    
    draw();
    return () => {
        resizeObserver.disconnect();
        cancelAnimationFrame(animationFrameId);
    };
  }, [isStressed]);

  return (
      <div ref={containerRef} className="relative w-full h-full min-h-[150px] overflow-hidden bg-black/80">
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

// -- SLIDER TACTILE POUR MOBILE (SWIPE TO KILL) --
const CombatSlider = ({ onConfirm, isStressed, side }) => {
    const [drag, setDrag] = useState(0);
    const containerRef = useRef(null);
    const isDragging = useRef(false);

    const handleStart = (e) => isDragging.current = true;
    const handleEnd = () => {
        isDragging.current = false;
        if (drag > 200) onConfirm();
        setDrag(0);
    };
    const handleMove = (e) => {
        if (!isDragging.current) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const rect = containerRef.current.getBoundingClientRect();
        const raw = clientX - rect.left;
        setDrag(Math.max(0, Math.min(raw, rect.width - 50)));
    };

    return (
        <div 
            ref={containerRef}
            className={`relative h-14 rounded-full border border-zinc-800 overflow-hidden flex items-center select-none ${side === 'BUY' ? 'bg-emerald-900/10' : 'bg-red-900/10'}`}
            onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
            onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd}
        >
            <div className="absolute inset-0 flex items-center justify-center opacity-40">
                <div className="flex items-center gap-2 animate-pulse">
                    <ChevronsRight size={16} className={side === 'BUY' ? 'text-emerald-500' : 'text-red-500'} />
                    <span className={`text-[10px] font-black tracking-[0.3em] ${side === 'BUY' ? 'text-emerald-500' : 'text-red-500'}`}>SLIDE_TO_{side}</span>
                </div>
            </div>
            <div 
                style={{ transform: `translateX(${drag}px)` }}
                className={`w-12 h-12 rounded-full absolute left-1 shadow-lg flex items-center justify-center z-10 transition-transform duration-75 ${side === 'BUY' ? 'bg-emerald-500 text-black' : 'bg-red-600 text-white'}`}
            >
                <Zap size={18} fill="currentColor" />
            </div>
        </div>
    );
};

const CombatOrderEntry = ({ onOrder, isStressed, isMobile }) => {
  const [side, setSide] = useState('BUY');
  const [amount, setAmount] = useState('');

  if (isMobile) {
      return (
          <div className="flex flex-col h-full justify-between py-2">
              <div className="grid grid-cols-2 gap-2 mb-4">
                 <button onClick={() => setSide('BUY')} className={`p-4 rounded border ${side === 'BUY' ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-zinc-800 bg-zinc-900 text-zinc-600'} font-black text-xl transition-all`}>BUY</button>
                 <button onClick={() => setSide('SELL')} className={`p-4 rounded border ${side === 'SELL' ? 'border-red-500 bg-red-500/20 text-red-400' : 'border-zinc-800 bg-zinc-900 text-zinc-600'} font-black text-xl transition-all`}>SELL</button>
              </div>
              <div className="flex-1 flex flex-col justify-center items-center relative mb-6">
                 <span className="text-[10px] text-zinc-500 uppercase font-black absolute top-0 left-0">Quantity (BTC)</span>
                 <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-transparent text-center text-6xl font-black text-white outline-none w-full placeholder-zinc-800" placeholder="0.00" />
              </div>
              <CombatSlider side={side} isStressed={isStressed} onConfirm={() => { onOrder({ side, amount, symbol: 'BTC/USD' }); setAmount(''); }} />
          </div>
      )
  }

  return (
    <div className={`flex flex-col gap-4 transition-all duration-300 ${isStressed ? 'scale-[0.98]' : ''}`}>
      <div className="flex bg-zinc-900/50 p-1 border border-zinc-800 rounded">
        {['BUY', 'SELL'].map(s => (
          <button key={s} onMouseDown={(e) => e.stopPropagation()} onClick={() => setSide(s)} className={`flex-1 py-4 md:py-3 text-[12px] md:text-[10px] font-black tracking-widest transition-all ${side === s ? (s === 'BUY' ? 'bg-emerald-600 text-black shadow-lg' : 'bg-red-600 text-white') : 'text-zinc-600'}`}>{s}</button>
        ))}
      </div>
      <input type="number" value={amount} onMouseDown={(e) => e.stopPropagation()} onChange={(e) => setAmount(e.target.value)} className="bg-transparent border border-zinc-800 p-4 text-emerald-400 text-2xl md:text-lg outline-none font-black tracking-tighter" placeholder="0.00" />
      <button onMouseDown={(e) => e.stopPropagation()} onClick={() => { onOrder({ side, amount, symbol: 'BTC/USD' }); setAmount(''); }} className={`w-full py-4 md:py-4 font-black text-sm md:text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all ${side === 'BUY' ? 'bg-emerald-600 text-black' : 'bg-red-600 text-white'}`}><Zap size={14} fill="currentColor" /> EXEC_COMMIT</button>
    </div>
  );
};

// -- FENÊTRE TACTIQUE MODULAIRE --
const TacticalWindow = ({ 
    title, icon: Icon, children, 
    subTitle, isStressed, 
    onDragStart, onDragOver, onDragEnd, 
    index, collapsed, onToggle, 
    w, h, // Nouvelles props de dimensions
    onResizeStart, // Handler pour commencer le resize
    isActive, // State de focus
    onActivate, // Handler d'activation
    isMobile // Mode mobile (no drag/resize)
}) => {
    
  // LOOKUP TABLE STATIQUE POUR TAILWIND (Indispensable pour que le compilateur voie les classes)
  const colSpans = {
      2: 'md:col-span-2', 3: 'md:col-span-3', 4: 'md:col-span-4', 5: 'md:col-span-5', 6: 'md:col-span-6',
      7: 'md:col-span-7', 8: 'md:col-span-8', 9: 'md:col-span-9', 10: 'md:col-span-10', 11: 'md:col-span-11', 12: 'md:col-span-12'
  };
  const rowSpans = {
      1: 'row-span-1', 2: 'row-span-2', 3: 'row-span-3', 4: 'row-span-4', 5: 'row-span-5', 6: 'row-span-6'
  };

  const colClass = colSpans[w] || 'md:col-span-3'; // Default fallback
  const rowClass = rowSpans[h] || 'row-span-2'; // Default fallback

  // Calcul dynamique des classes Grid
  const gridClass = isMobile
    ? 'w-full h-full flex flex-col animate-slide-up' // Mobile style: Full Card
    : collapsed 
        ? 'col-span-12 row-span-1 h-[40px]' 
        : `col-span-12 ${colClass} ${rowClass}`;
    
  // Gestion du style actif (Z-index et Bordure)
  const activeStyle = isMobile
    ? 'border-none bg-transparent'
    : isActive 
        ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] z-50' 
        : 'border-[#1a1a1e] z-10 opacity-90 hover:opacity-100';

  const handleClass = isMobile ? '' : 'drag-handle cursor-grab active:cursor-grabbing';

  return (
    <div 
        onClick={() => !isMobile && onActivate(index)} // CLICK POUR ACTIVER (Desktop seulement)
        onDragOver={(e) => !isMobile && onDragOver(e, index)}
        onDragEnd={!isMobile ? onDragEnd : undefined}
        className={`flex flex-col ${THEME.surface} border ${gridClass} relative group overflow-hidden ${isMobile ? '' : 'draggable-item'} ${activeStyle} ${isStressed ? 'border-red-500/40 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]' : ''}`}
    >
        {/* HEADER (Hidden on Mobile for cleaner look, handled by TabBar) */}
        {!isMobile && (
            <div 
                 draggable={!isMobile && !collapsed}
                 onDragStart={(e) => {
                     onActivate(index); 
                     onDragStart(e, index);
                 }}
                 className={`flex items-center justify-between px-3 py-3 md:py-2 bg-zinc-900/60 border-b border-zinc-800/80 shrink-0 z-20 transition-colors ${handleClass}`}
            >
                <div className="flex items-center gap-2 pointer-events-none">
                    <GripVertical size={12} className={`transition-colors ${isActive ? 'text-emerald-400' : 'text-zinc-600'}`} />
                    <Icon size={14} className={isStressed ? 'text-white animate-pulse' : (isActive ? 'text-emerald-400' : 'text-zinc-500')} />
                    <span className={`text-[12px] md:text-[10px] font-black tracking-widest uppercase glow-text ${isStressed ? 'text-white' : (isActive ? 'text-white' : 'text-zinc-400')}`}>{title}</span>
                    {subTitle && (!collapsed) && <span className="text-[10px] md:text-[8px] font-bold text-zinc-600 hidden sm:inline ml-2">{subTitle}</span>}
                </div>
                <div className="flex items-center gap-2" onMouseDown={(e) => e.stopPropagation()}>
                    <button onClick={() => onToggle(index)} className={`transition-colors ${collapsed ? 'text-emerald-500 animate-pulse' : 'text-zinc-500 hover:text-white'}`}>
                        {collapsed ? <Maximize2 size={10} /> : <Minus size={10} />}
                    </button>
                </div>
            </div>
        )}
        
        {(!collapsed || isMobile) && (
            <>
                <div className="flex-1 p-3 overflow-hidden relative flex flex-col z-10" onMouseDown={(e) => e.stopPropagation()}>
                    {children}
                </div>
                {/* POIGNÉE DE REDIMENSIONNEMENT (Desktop seulement) */}
                {!isMobile && (
                    <div 
                        className="resize-handle opacity-0 group-hover:opacity-100 transition-opacity"
                        onMouseDown={(e) => {
                            onActivate(index);
                            onResizeStart(e, index);
                        }}
                    />
                )}
            </>
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
  const [activeWindowId, setActiveWindowId] = useState('cmd'); 
  const [mobileTab, setMobileTab] = useState('EXECUTION'); // Default mobile tab

  const [logs, setLogs] = useState(["SYSTEM_READY", "SECURE_UPLINK_STABLE", "VORTEX_ENGINE_ACTIVE", "NEURAL_ORACLE_ONLINE"]);
  const [orders, setOrders] = useState([]);
  const [input, setInput] = useState("");
  const [trades, setTrades] = useState([]);

  // --- LAYOUT & RESIZE STATE ---
  const initialLayout = [
    { id: 'vortex', component: 'Vortex', title: 'LIQUIDATION_VORTEX', icon: Box, subTitle: 'GRAVITY_WELL', w: 6, h: 4, isCollapsed: false },
    { id: 'oracle', component: 'Oracle', title: 'NEURAL_ORACLE', icon: TrendingUp, subTitle: 'PROB_VECTOR', w: 6, h: 2, isCollapsed: false },
    { id: 'matrix', component: 'Matrix', title: 'CORRELATION_MATRIX', icon: Share2, subTitle: 'NEURAL_NET', w: 3, h: 2, isCollapsed: false }, 
    { id: 'cloud', component: 'Cloud', title: 'SENTIMENT_CLOUD', icon: Cloud, subTitle: 'SOCIAL_SWARM', w: 3, h: 2, isCollapsed: false },
    { id: 'cmd', component: 'CMD', title: 'Command_Center', icon: Terminal, w: 6, h: 2, isCollapsed: false },
    { id: 'pos', component: 'Positions', title: 'Active_Positions', icon: List, w: 4, h: 2, isCollapsed: false },
    { id: 'exec', component: 'Execution', title: 'Order_Execution', icon: Zap, w: 3, h: 2, isCollapsed: false }, 
    { id: 'risk', component: 'Risk', title: 'Risk_Monitor', icon: Gauge, w: 5, h: 2, isCollapsed: false },
  ];
  const [layout, setLayout] = useState(initialLayout);
  
  // Drag & Drop Refs
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const [resizing, setResizing] = useState(null); 

  // --- GESTION DU REDIMENSIONNEMENT (SNAP TO GRID) ---
  const handleResizeStart = (e, index) => {
      e.preventDefault();
      e.stopPropagation();
      const item = layout[index];
      setResizing({
          index,
          startX: e.clientX,
          startY: e.clientY,
          startW: item.w,
          startH: item.h
      });
  };

  const handleMouseMove = useCallback((e) => {
      if (!resizing) return;
      const deltaX = e.clientX - resizing.startX;
      const deltaY = e.clientY - resizing.startY;
      const colStep = window.innerWidth / 12;
      const rowStep = window.innerHeight / 8; 
      
      const colsChanged = Math.round(deltaX / colStep);
      const rowsChanged = Math.round(deltaY / rowStep);
      
      if (colsChanged === 0 && rowsChanged === 0) return;

      setLayout(prev => {
          const newLayout = [...prev];
          const item = newLayout[resizing.index];
          let newW = Math.max(2, Math.min(12, resizing.startW + colsChanged));
          let newH = Math.max(1, Math.min(6, resizing.startH + rowsChanged));
          if (item.w !== newW || item.h !== newH) {
              item.w = newW;
              item.h = newH;
              return newLayout;
          }
          return prev;
      });
  }, [resizing]);

  const handleMouseUp = useCallback(() => {
      setResizing(null);
  }, []);

  useEffect(() => {
      if (resizing) {
          window.addEventListener('mousemove', handleMouseMove);
          window.addEventListener('mouseup', handleMouseUp);
      } else {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
      }
      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
      };
  }, [resizing, handleMouseMove, handleMouseUp]);


  // --- GESTION DRAG & DROP ---
  const onDragStart = (e, index) => {
    dragItem.current = index;
    document.body.style.cursor = 'grabbing';
    e.target.parentElement.classList.add('dragging'); 
  };

  const onDragEnter = (e, index) => {
    e.preventDefault();
    dragOverItem.current = index;
  };

  const onDragEnd = (e) => {
    document.body.style.cursor = 'auto';
    const items = document.querySelectorAll('.dragging');
    items.forEach(i => i.classList.remove('dragging'));
    if (dragItem.current === null || dragOverItem.current === null) return;
    const newLayout = [...layout];
    const draggedItemContent = newLayout[dragItem.current];
    newLayout.splice(dragItem.current, 1);
    newLayout.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setLayout(newLayout);
  };

  const toggleCollapse = (index) => {
      setLayout(prev => {
          const newLayout = [...prev];
          const item = newLayout[index];
          item.isCollapsed = !item.isCollapsed;
          return newLayout;
      });
  };

  const setGlobalCollapse = (collapsed) => {
      setLayout(prev => prev.map(item => ({...item, isCollapsed: collapsed})));
  };

  const handleWindowActivate = (index) => {
      setActiveWindowId(layout[index].id);
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
        addLog("--- OMNI_LAUNCHER_V7.4 ---");
        addLog("CMDS: LIQUIDATE, STEALTH, NEURAL_SCAN, RISK_FLUSH, DATA_BURST");
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
  const renderComponent = (type, isMobile = false) => {
    switch(type) {
      case 'Vortex': return <VortexLiquidation isStressed={isStressed} />;
      case 'Matrix': return <CorrelationMatrix isStressed={isStressed} />;
      case 'Cloud': return <SentimentCloud isStressed={isStressed} />;
      case 'Oracle': return <NeuralOracle isStressed={isStressed} />;
      case 'LOB': return <LOB3DTerrain isStressed={isStressed} burstMode={burstMode} />;
      case 'Execution': return <CombatOrderEntry onOrder={handleExecution} isStressed={isStressed} isMobile={isMobile} />;
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
            <p className="text-emerald-900 text-[10px] font-bold tracking-[0.8em] uppercase">Sovereign_Omni_Deck_V7.4</p>
          </div>
          <button onClick={() => setIsLive(true)} className="group relative px-16 py-4 border border-emerald-500/20 text-emerald-500 uppercase tracking-[1em] overflow-hidden transition-all hover:border-emerald-500 bg-black/40 backdrop-blur-sm">
            <span className="relative z-10 group-hover:text-black transition-colors">Start_Uplink</span>
            <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        </div>
      </div>
    );
  }

  // Configuration des onglets Mobile (Le "Dock")
  const mobileModules = {
      'ORACLE': { component: 'Oracle', icon: TrendingUp },
      'VORTEX': { component: 'Vortex', icon: Box },
      'MATRIX': { component: 'Matrix', icon: Share2 },
      'CLOUD': { component: 'Cloud', icon: Cloud },
      'EXECUTION': { component: 'Execution', icon: Zap },
      'COMMAND': { component: 'CMD', icon: Terminal },
      'RISK': { component: 'Risk', icon: Gauge },
  };

  return (
    <div className={`h-[100dvh] w-screen ${THEME.bg} flex flex-col font-mono text-zinc-400 overflow-hidden relative grid-bg ${isStressed ? 'system-stress' : ''} ${isStealth ? 'stealth-mode' : ''} ${isLiquidating ? 'liquidate-flash' : ''}`}>
      <GlobalCinemaStyles />
      <div className="scanline" />
      <div className="crt-overlay" />
      {isScanning && <div className="scan-bar" />}

      {/* HEADER DESKTOP / MOBILE (Unifié mais adapté) */}
      <header className="h-14 border-b border-zinc-800/50 bg-black/90 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <Shield className="text-emerald-500" size={18} />
          <div className="flex flex-col">
            <span className="font-black text-xs text-white tracking-widest italic glow-text">LEONCE_EQUITY</span>
            <span className="text-[8px] text-zinc-700 font-bold uppercase tracking-tighter">Combat_Node_V7</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
            
          {/* GLOBAL CONTROLS (Desktop Only) */}
          <div className="hidden md:flex items-center gap-2 mr-4 border-r border-zinc-900 pr-4">
              <button onClick={() => setGlobalCollapse(true)} className="text-zinc-500 hover:text-white transition-colors" title="COLLAPSE_ALL">
                  <Minimize2 size={14} />
              </button>
              <button onClick={() => setGlobalCollapse(false)} className="text-zinc-500 hover:text-emerald-500 transition-colors" title="EXPAND_ALL">
                  <Maximize2 size={14} />
              </button>
          </div>

          <div className="flex flex-col items-end border-r border-zinc-900 pr-6 mr-6">
            <span className="text-[8px] text-zinc-600 uppercase font-black">Net_Liquidity</span>
            <span className="text-xs text-emerald-500 font-black tracking-tighter">$1,240,492</span>
          </div>
          <Radio size={16} className={isStressed ? 'text-red-500 animate-ping' : 'text-emerald-500 animate-pulse'} />
        </div>
      </header>

      {/* DESKTOP MAIN GRID - FIX: Use h-full and min-h-0 to force confinement within flex container */}
      <main 
        className="hidden md:grid flex-1 p-2 grid-cols-12 grid-rows-6 gap-2 relative overflow-hidden min-h-0"
        style={{ cursor: resizing ? 'nwse-resize' : 'auto' }}
      >
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
            w={item.w}
            h={item.h}
            isActive={activeWindowId === item.id}
            onActivate={handleWindowActivate}
            onToggle={toggleCollapse}
            onResizeStart={handleResizeStart}
            onDragStart={onDragStart}
            onDragOver={onDragEnter}
            onDragEnd={onDragEnd}
            isMobile={false}
          >
            {renderComponent(item.component, false)}
          </TacticalWindow>
        ))}
      </main>

      {/* MOBILE MAIN STREAM (V7.4 - TACTICAL DECK) */}
      <main className="md:hidden flex-1 relative overflow-hidden bg-black/50 p-4 pb-24 flex flex-col justify-center">
         {/* Background Effect Specific to Mobile */}
         <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-black to-black animate-pulse" />

         {/* Active Module Card */}
         <div className="relative z-10 w-full h-full max-h-[600px] bg-[#0c0c0e] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
            <div className="h-8 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between px-3">
                 <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                     <span className="text-[10px] font-black tracking-widest text-emerald-500">{mobileTab}</span>
                 </div>
                 <div className="flex gap-1">
                     {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-zinc-700 rounded-full" />)}
                 </div>
            </div>
            <div className="flex-1 relative overflow-hidden p-2">
                {renderComponent(mobileModules[mobileTab].component, true)}
            </div>
         </div>
      </main>

      {/* MOBILE TACTICAL DOCK (Bottom Nav - Infinite Scroll) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full h-20 bg-[#050505]/90 backdrop-blur-xl border-t border-zinc-800 z-50 flex items-center gap-4 overflow-x-auto px-6 pb-2 no-scrollbar snap-x">
          {Object.entries(mobileModules).map(([key, mod]) => {
              const isActive = mobileTab === key;
              return (
                  <button 
                    key={key} 
                    onClick={() => setMobileTab(key)}
                    className={`shrink-0 snap-center flex flex-col items-center justify-center w-14 h-14 rounded-lg transition-all duration-200 active:scale-90 ${isActive ? 'bg-emerald-900/20 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'opacity-50 grayscale'}`}
                  >
                      <mod.icon size={20} className={isActive ? 'text-emerald-400' : 'text-zinc-500'} />
                      <span className={`text-[8px] mt-1 font-black ${isActive ? 'text-emerald-400' : 'text-zinc-600'}`}>{key.substring(0, 4)}</span>
                  </button>
              )
          })}
      </div>

      <footer className="hidden md:flex h-10 border-t border-zinc-900 bg-black items-center shrink-0 z-50 overflow-hidden">
        <div className="bg-emerald-950/20 h-full flex items-center px-4 border-r border-zinc-800 shrink-0 z-10"><span className="text-[9px] font-black text-emerald-500 uppercase italic animate-pulse">Live_Intel</span></div>
        <div className="flex-1 relative overflow-hidden flex items-center">
          <div className="animate-ticker whitespace-nowrap flex items-center gap-12 text-[9px] font-bold text-zinc-600 uppercase">
            <span>WHALE_ALERT: +1,240 BTC BINANCE /// MARKET_SENTIMENT: 84% BULLISH /// VOLATILITY_SCAN: HIGH_ALERT /// NODE_STABILITY: 100% /// FED_WATCH: T-14D TO CPI_RELEASE /// SECURE_UPLINK: AES_256_ACTIVE ///</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
