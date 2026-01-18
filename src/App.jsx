import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Terminal, Shield, Activity, Database, Zap, 
  ArrowUpRight, ArrowDownRight, ChevronRight, 
  Cpu, Lock, LayoutGrid, List, BarChart3, AlertCircle,
  Crosshair, Radio, Gauge, Layers, Box, Globe, Newspaper
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
   1. MOTEURS 3D (THREE.JS)
   ========================================= */

const LOB3DTerrain = ({ isStressed, burstMode }) => {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = initThree;
    document.head.appendChild(script);

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
    return () => { if (rendererRef.current) mountRef.current?.removeChild(rendererRef.current.domElement); };
  }, [isStressed, burstMode]);

  return <div ref={mountRef} className="w-full h-full min-h-[250px]" />;
};

const SpectacularGlobe = ({ isStressed, opacity = 0.4 }) => {
    const mountRef = useRef(null);
    const rendererRef = useRef(null);

    useEffect(() => {
        let scene, camera, globe, lines, points;
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        script.onload = () => {
          const THREE = window.THREE;
          if (!mountRef.current) return;

          const width = mountRef.current.clientWidth;
          const height = mountRef.current.clientHeight;

          scene = new THREE.Scene();
          camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
          camera.position.set(0, 0, 180);

          rendererRef.current = new THREE.WebGLRenderer({ antialias: true, alpha: true });
          rendererRef.current.setSize(width, height);
          mountRef.current.appendChild(rendererRef.current.domElement);

          globe = new THREE.Group();
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
          const pointMat = new THREE.PointsMaterial({ 
              color: isStressed ? 0xffffff : 0x10b981, 
              size: 1.2, 
              transparent: true, 
              opacity: 0.5 
          });
          points = new THREE.Points(pointGeom, pointMat);
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
        };
        document.head.appendChild(script);

        const handleResize = () => {
            if (!mountRef.current || !rendererRef.current) return;
            camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
            camera.updateProjectionMatrix();
            rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (rendererRef.current) mountRef.current?.removeChild(rendererRef.current.domElement);
        };
    }, [isStressed]);

    return <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} />;
};

/* =========================================
   2. MODULE D'EXÉCUTION TACTIQUE
   ========================================= */
const CombatOrderEntry = ({ onOrder, isStressed }) => {
  const [side, setSide] = useState('BUY');
  const [amount, setAmount] = useState('');
  return (
    <div className={`flex flex-col gap-4 transition-all duration-300 ${isStressed ? 'scale-[0.98]' : ''}`}>
      <div className="flex bg-zinc-900/50 p-1 border border-zinc-800 rounded">
        {['BUY', 'SELL'].map(s => (
          <button key={s} onClick={() => setSide(s)} className={`flex-1 py-3 text-[10px] font-black tracking-widest transition-all ${side === s ? (s === 'BUY' ? 'bg-emerald-600 text-black shadow-lg' : 'bg-red-600 text-white') : 'text-zinc-600'}`}>{s}</button>
        ))}
      </div>
      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-transparent border border-zinc-800 p-4 text-emerald-400 text-lg outline-none font-black tracking-tighter" placeholder="0.00" />
      <button onClick={() => { onOrder({ side, amount, symbol: 'BTC/USD' }); setAmount(''); }} className={`w-full py-4 font-black text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all ${side === 'BUY' ? 'bg-emerald-600 text-black' : 'bg-red-600 text-white'}`}><Zap size={14} fill="currentColor" /> EXEC_COMMIT</button>
    </div>
  );
};

/* =========================================
   3. CADRE DE FENÊTRE TACTIQUE
   ========================================= */
const TacticalWindow = ({ title, icon: Icon, children, className = "", subTitle, isStressed }) => (
  <div className={`flex flex-col ${THEME.surface} border ${THEME.border} ${className} relative group overflow-hidden transition-all duration-300 ${isStressed ? 'border-emerald-500/40 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]' : ''}`}>
    <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/60 border-b border-zinc-800/80 shrink-0 z-20">
      <div className="flex items-center gap-2">
        <Icon size={12} className={isStressed ? 'text-white animate-pulse' : 'text-emerald-500'} />
        <span className={`text-[10px] font-black tracking-widest uppercase glow-text ${isStressed ? 'text-white' : 'text-zinc-300'}`}>{title}</span>
      </div>
    </div>
    <div className="flex-1 p-3 overflow-hidden relative flex flex-col z-10">
      {children}
    </div>
  </div>
);

/* =========================================
   4. CŒUR DU TERMINAL (OMNI-DECK)
   ========================================= */
export default function App() {
  const [isLive, setIsLive] = useState(false);
  const [isStressed, setIsStressed] = useState(false);
  const [isStealth, setIsStealth] = useState(false);
  const [isLiquidating, setIsLiquidating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [burstMode, setBurstMode] = useState(false);
  const [activeTab, setActiveTab] = useState('DASHBOARD');

  const [logs, setLogs] = useState(["SYSTEM_READY", "SECURE_UPLINK_STABLE", "LOB_RENDERER_ACTIVE"]);
  const [orders, setOrders] = useState([]);
  const [input, setInput] = useState("");
  const [trades, setTrades] = useState([]);

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

  const addLog = (msg) => setLogs(prev => [msg, ...prev].slice(0, 20));

  const handleCommand = (e) => {
    if (e.key !== 'Enter') return;
    const cmd = input.trim().toUpperCase();
    setInput("");
    addLog(`> ${cmd}`);
    switch(cmd) {
      case 'LIQUIDATE': setIsLiquidating(true); setOrders([]); addLog("CRITICAL: POSITIONS_PURGED"); setTimeout(() => setIsLiquidating(false), 500); break;
      case 'STEALTH': setIsStealth(!isStealth); addLog(isStealth ? "STEALTH_OFF" : "STEALTH_ON"); break;
      case 'NEURAL_SCAN': setIsScanning(true); addLog("RUNNING_NEURAL_SCAN..."); setTimeout(() => { setIsScanning(false); addLog("SENTIMENT: BULLISH_84%"); }, 2000); break;
      case 'RISK_FLUSH': setIsStressed(true); addLog("SCALING_EXPOSURE_-50%"); setOrders(prev => prev.map(o => ({...o, amount: (o.amount / 2).toFixed(4)}))); setTimeout(() => setIsStressed(false), 1000); break;
      case 'DATA_BURST': setBurstMode(true); addLog("DATA_BURST_ENGAGED"); setTimeout(() => setBurstMode(false), 3000); break;
      case 'OS': 
      case 'LAUNCH_OS':
        setIsStressed(true);
        addLog("DECRYPTING_OS_HANDSHAKE...");
        setTimeout(() => {
          setIsStressed(false);
          addLog("UPLINK_REDIRECT: OS.HTML");
          window.open('os.html', '_blank');
        }, 800);
        break;
      case 'INDEX':
      case 'LAUNCH_INDEX':
        setIsStressed(true);
        addLog("SYNCHRONIZING_INDEX_UPLINK...");
        setTimeout(() => {
          setIsStressed(false);
          addLog("ACCESS_GRANTED: INDEX.HTML");
          window.open('index.html', '_blank');
        }, 800);
        break;
      case 'HELP': addLog("ACTIONS: OS, INDEX, LIQUIDATE, STEALTH, NEURAL_SCAN, RISK_FLUSH, DATA_BURST"); break;
      default: addLog("ERR: UNKNOWN_CMD");
    }
  };

  const handleExecution = (order) => {
    setIsStressed(true); setTimeout(() => setIsStressed(false), 300);
    addLog(`EXEC_${order.side}: ${order.amount} ${order.symbol}`);
    setOrders(prev => [{...order, id: Date.now(), time: new Date().toLocaleTimeString()}, ...prev]);
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
            <p className="text-emerald-900 text-[10px] font-bold tracking-[0.8em] uppercase">Sovereign_Omni_Deck_V5.6</p>
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
            <span className="text-[8px] text-zinc-700 font-bold uppercase tracking-tighter">Combat_Node_V5</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end border-r border-zinc-900 pr-6 mr-6">
            <span className="text-[8px] text-zinc-600 uppercase font-black">Net_Liquidity</span>
            <span className="text-xs text-emerald-500 font-black tracking-tighter">$1,240,492</span>
          </div>
          <Radio size={16} className={isStressed ? 'text-red-500 animate-ping' : 'text-emerald-500 animate-pulse'} />
        </div>
      </header>

      <main className="hidden md:grid flex-1 p-2 grid-cols-12 grid-rows-6 gap-2 relative overflow-hidden">
        <TacticalWindow title="LOB_Topography_3D" icon={Box} className="col-span-12 md:col-span-6 row-span-4" isStressed={isStressed}>
          <LOB3DTerrain isStressed={isStressed} burstMode={burstMode} />
        </TacticalWindow>
        <TacticalWindow title="Order_Execution" icon={Zap} className="col-span-12 md:col-span-3 row-span-4" isStressed={isStressed}>
          <CombatOrderEntry onOrder={handleExecution} isStressed={isStressed} />
        </TacticalWindow>
        <TacticalWindow title="Command_Center" icon={Terminal} className="col-span-12 md:col-span-3 row-span-4 border-emerald-500/20 bg-emerald-950/5 relative" isStressed={isStressed}>
          <SpectacularGlobe isStressed={isStressed} opacity={0.4} />
          <div className="flex-1 overflow-auto no-scrollbar space-y-1 mb-3 relative z-10">
            {logs.map((l, i) => <div key={i} className={`text-[10px] ${l.startsWith('>') ? 'text-emerald-400 font-bold' : 'text-zinc-600'}`}>{l}</div>)}
          </div>
          <div className="flex items-center gap-2 border-t border-emerald-900/50 pt-2 relative z-10">
            <ChevronRight size={14} className="text-emerald-500" />
            <input className="bg-transparent outline-none flex-1 text-[11px] text-white uppercase" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleCommand} placeholder="ENTER_CMD..." autoFocus />
          </div>
        </TacticalWindow>
        <TacticalWindow title="Live_Tape" icon={Activity} className="col-span-12 md:col-span-3 row-span-2" isStressed={isStressed}>
           <div className="flex flex-col gap-1 text-[9px] uppercase">{trades.map(t => (<div key={t.id} className="flex justify-between items-center border-l border-zinc-900 pl-2 animate-pop-in"><span className="opacity-30">{t.time}</span><span className={t.side === 'BUY' ? 'text-emerald-500 font-bold' : 'text-red-500 font-bold'}>{t.side}</span><span className="text-zinc-200">{t.size}</span><span className="text-zinc-700">{t.price}</span></div>))}</div>
        </TacticalWindow>
        <TacticalWindow title="Active_Positions" icon={List} className="col-span-12 md:col-span-4 row-span-2" isStressed={isStressed}>
          <div className="flex flex-col h-full text-[9px] uppercase"><div className="grid grid-cols-4 pb-2 border-b border-zinc-900 font-black text-zinc-700"><span>Asset</span><span>Side</span><span>Size</span><span>PnL</span></div><div className="flex-1 overflow-auto no-scrollbar">{orders.map(o => (<div key={o.id} className="grid grid-cols-4 py-2 border-b border-zinc-900/50 items-center"><span className="font-bold text-zinc-300">{o.symbol}</span><span className={o.side === 'BUY' ? 'text-emerald-500' : 'text-red-500'}>{o.side}</span><span className="text-zinc-500">{o.amount}</span><span className="text-emerald-400 font-bold">+$142.20</span></div>))}</div></div>
        </TacticalWindow>
        <TacticalWindow title="Risk_Monitor" icon={Gauge} className="col-span-12 md:col-span-5 row-span-2" isStressed={isStressed}>
           <div className="grid grid-cols-2 gap-4 h-full items-center">{[{ l: 'VaR_99%', v: '$42,100', d: '-0.4%' }, { l: 'Beta_Exp', v: '0.84', d: '+1.2%' }, { l: 'DD_Max', v: '2.14%', d: '0.0%' }, { l: 'Node_Auth', v: 'SECURE', d: 'ECC_ON' }].map(item => (<div key={item.l} className="flex flex-col border-l border-zinc-900 pl-4"><span className="text-[8px] font-black text-zinc-700 uppercase">{item.l}</span><div className="flex items-baseline gap-2"><span className={`text-sm font-black tracking-tighter ${isStressed && item.l === 'Node_Auth' ? 'text-red-500' : 'text-zinc-200'}`}>{item.v}</span><span className="text-[8px] font-bold text-emerald-500">{item.d}</span></div></div>))}</div>
        </TacticalWindow>
      </main>

      {/* VIEW MOBILE */}
      <main className="md:hidden flex-1 p-2 relative">
        {activeTab === 'DASHBOARD' && (
           <div className="flex flex-col h-full gap-2">
              <TacticalWindow title="LOB_3D_SCAN" icon={Box} className="flex-1" isStressed={isStressed}><LOB3DTerrain isStressed={isStressed} burstMode={burstMode} /></TacticalWindow>
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

      {/* FOOTER TICKER */}
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
