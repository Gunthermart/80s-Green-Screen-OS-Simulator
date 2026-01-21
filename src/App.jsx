import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Terminal, Shield, Activity, BarChart3, Zap, Radar, Cpu, Grid, Lock, Wifi, Layers, Target, Anchor, TrendingUp, AlertCircle, PieChart, ArrowUpRight, ArrowDownRight, HardDrive, BarChart, TrendingDown, Menu, Crosshair, HelpCircle, X, ChevronDown } from 'lucide-react';

/* --- CONFIGURATION DES ACTIFS (10 PAIRS) --- */
const ASSETS_CONFIG = {
    BTC: { symbol: 'btcusdt', color: '#f7931a' },
    ETH: { symbol: 'ethusdt', color: '#627eea' },
    SOL: { symbol: 'solusdt', color: '#14f195' },
    BNB: { symbol: 'bnbusdt', color: '#f3ba2f' },
    XRP: { symbol: 'xrpusdt', color: '#23292f' },
    ADA: { symbol: 'adausdt', color: '#0033ad' },
    DOGE: { symbol: 'dogeusdt', color: '#ba9f33' },
    AVAX: { symbol: 'avaxusdt', color: '#e84142' },
    LINK: { symbol: 'linkusdt', color: '#2a5ada' },
    DOT: { symbol: 'dotusdt', color: '#e6007a' },
};

/* --- SYSTEM DOCS --- */
const SYSTEM_DOCS = [
    { id: 'Exec_Shell', icon: Terminal, title: 'EXECUTION SHELL', descEN: 'Command center.', descFR: 'Centre de commandement.' },
    { id: 'Neural_Forecast', icon: BarChart3, title: 'NEURAL FORECAST', descEN: 'Probabilistic projection.', descFR: 'Projection probabiliste.' },
    { id: 'Order_Depth', icon: Layers, title: 'ORDER DEPTH (DOM)', descEN: 'Liquidity mapping.', descFR: 'Cartographie de liquidité.' },
    { id: 'Sys_Matrix', icon: Grid, title: 'SYSTEMIC TUNNEL', descEN: '3D Liquidity Vortex. Center = Correlated (Risk). Walls = Decoupled (Alpha). Tunnel narrows under stress.', descFR: 'Vortex de Liquidité 3D. Centre = Corrélé (Risque). Parois = Décorrelé (Alpha). Le tunnel se resserre sous stress.' },
    { id: 'Kinetic_Core', icon: Cpu, title: 'KINETIC CORE', descEN: 'Flow entropy.', descFR: 'Entropie du flux.' },
    { id: 'Tape_Signals', icon: Activity, title: 'TAPE SIGNALS', descEN: 'Real-time trade feed.', descFR: 'Flux de transactions.' },
    { id: 'Whale_Watch', icon: Anchor, title: 'WHALE WATCH', descEN: 'Institutional tracker.', descFR: 'Traqueur institutionnel.' },
    { id: 'Risk_Shield', icon: Shield, title: 'RISK SHIELD', descEN: 'Exposure monitor.', descFR: 'Moniteur d\'exposition.' },
    { id: 'Synaptic_Core', icon: HardDrive, title: 'SYNAPTIC CORE', descEN: 'Infrastructure health.', descFR: 'Santé infrastructure.' }
];

/* --- HOOKS --- */
const useDataStream = (isLive, whaleLimit) => {
    const [prices, setPrices] = useState({});
    const [trades, setTrades] = useState([]);
    const [volatility, setVolatility] = useState(1);
    const [connectionStatus, setConnectionStatus] = useState('OFFLINE');
    const ws = useRef(null);
    const msgCount = useRef(0);

    useEffect(() => {
        if (!isLive) return;
        const streams = Object.values(ASSETS_CONFIG).map(a => `${a.symbol}@aggTrade`).join('/');
        const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;
        
        ws.current = new WebSocket(url);
        ws.current.onopen = () => setConnectionStatus('ONLINE');
        ws.current.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (!msg.data) return;
            msgCount.current += 1;
            const data = msg.data;
            const symbolKey = msg.stream.split('@')[0].replace('usdt', '').toUpperCase();
            
            if (data.e === 'aggTrade') {
                const p = parseFloat(data.p);
                setPrices(prev => {
                    const old = prev[symbolKey] || { history: [] };
                    const newHistory = [...old.history, p].slice(-60);
                    return {
                        ...prev,
                        [symbolKey]: { 
                            price: p, 
                            trend: p > (old.price || 0) ? 'up' : 'down',
                            history: newHistory,
                            change: old.history.length > 0 ? ((p - old.history[0]) / old.history[0]) * 100 : 0
                        }
                    };
                });
                const newTrade = { symbol: symbolKey, side: data.m ? 'SELL' : 'BUY', price: p, size: parseFloat(data.q), value: parseFloat(data.q) * p, time: Date.now(), isWhale: parseFloat(data.q) * p > whaleLimit, isMaker: data.m };
                setTrades(prev => [newTrade, ...prev].slice(0, 50)); 
            }
        };
        const volInterval = setInterval(() => {
            setVolatility(Math.min(5, Math.max(1, msgCount.current / 8)));
            msgCount.current = 0;
        }, 1000);
        return () => { if (ws.current) ws.current.close(); clearInterval(volInterval); };
    }, [isLive, whaleLimit]);
    return { prices, trades, connectionStatus, volatility, setTrades };
};

/* --- UI COMPONENTS (RESTORED) --- */

const Window = ({ title, children, icon: IconComp, className = "" }) => (
    <div className={`bg-gray-950/95 border border-emerald-500/20 flex flex-col overflow-hidden shadow-[inset_0_0_20px_rgba(16,185,129,0.02)] min-h-[250px] md:min-h-0 ${className}`}>
        <div className="bg-emerald-950/10 border-b border-emerald-500/10 p-2 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-400/80">
                <IconComp size={12} className="text-emerald-600" />
                {title}
            </div>
            <div className="h-1 w-1 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_#10b981]" />
        </div>
        <div className="p-3 flex-1 overflow-auto font-mono text-[10px] text-emerald-400/90 no-scrollbar relative">
            {children}
        </div>
    </div>
);

const HelpModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-950 border border-emerald-500/50 w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl relative">
                <div className="flex justify-between items-center p-4 border-b border-emerald-500/30 bg-emerald-900/10">
                    <div className="flex items-center gap-3 text-emerald-400 font-bold tracking-widest uppercase">
                        <HelpCircle size={20} /> System_Manual_V9.9
                    </div>
                    <button onClick={onClose} className="text-emerald-500 hover:text-red-500 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 no-scrollbar">
                    {SYSTEM_DOCS.map((doc, i) => (
                        <div key={i} className="border border-emerald-500/20 p-4 bg-emerald-900/5 hover:bg-emerald-900/10 transition-colors group">
                            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2 uppercase text-xs tracking-wider border-b border-emerald-500/10 pb-2">
                                <doc.icon size={14} className="text-emerald-600 group-hover:text-emerald-400 transition-colors"/> {doc.title}
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-[9px] text-zinc-500 font-bold uppercase block mb-0.5">English</span>
                                    <p className="text-[10px] text-emerald-300/80 leading-relaxed">{doc.descEN}</p>
                                </div>
                                <div>
                                    <span className="text-[9px] text-zinc-500 font-bold uppercase block mb-0.5">Français</span>
                                    <p className="text-[10px] text-emerald-300/60 leading-relaxed italic">{doc.descFR}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-2 border-t border-emerald-500/30 bg-emerald-900/5 text-center text-[9px] text-zinc-500 uppercase">
                    Leonce Equity Systems // Authorized Personnel Only
                </div>
            </div>
        </div>
    );
};

/* --- 3D COMPONENTS --- */

/* SYSTEMIC TUNNEL (VORTEX) 3D VISUALIZER */
const SystemicTunnel3D = ({ prices, volatility }) => {
    const mountRef = useRef(null);
    const assets = useMemo(() => Object.keys(ASSETS_CONFIG), []);

    // Calcul des corrélations (Gravité)
    const correlations = useMemo(() => {
        const matrix = {};
        assets.forEach(target => {
            let totalCorr = 0;
            assets.forEach(ref => {
                if (target === ref) return;
                const hT = prices[target]?.price || 0;
                const hR = prices[ref]?.price || 0;
                if (hT === 0 || hR === 0) return;
                const diff = Math.abs((hT - hR) / (hT + hR)); 
                const val = Math.max(0, 1 - (diff * 1000) % 1); 
                if(val > 0.7) totalCorr += val;
            });
            matrix[target] = Math.min(1, totalCorr / 3); 
        });
        return matrix;
    }, [prices, assets]);

    useEffect(() => {
        if (!mountRef.current) return;
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        const scene = new THREE.Scene();
        // Fog pour la profondeur du tunnel
        scene.fog = new THREE.FogExp2(0x000000, 0.15);

        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        mountRef.current.appendChild(renderer.domElement);

        // 1. LE TUNNEL (Cylinder Geometry)
        const tunnelGeo = new THREE.CylinderGeometry(3, 3, 40, 32, 20, true);
        tunnelGeo.rotateX(Math.PI / 2); // Orienter vers la caméra
        
        // Stocker les positions initiales pour la déformation
        const positionAttribute = tunnelGeo.attributes.position;
        const vertex = new THREE.Vector3();
        const originalPositions = [];
        for (let i = 0; i < positionAttribute.count; i++) {
            vertex.fromBufferAttribute(positionAttribute, i);
            originalPositions.push({x: vertex.x, y: vertex.y, z: vertex.z, angle: Math.atan2(vertex.y, vertex.x)});
        }

        const tunnelMat = new THREE.MeshBasicMaterial({ 
            color: 0x10b981, 
            wireframe: true, 
            transparent: true, 
            opacity: 0.15 
        });
        const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
        scene.add(tunnel);

        // 2. LES ACTIFS (Spheres dans le tunnel)
        const nodes = {};
        const nodeGroup = new THREE.Group();
        scene.add(nodeGroup);

        assets.forEach(asset => {
            const color = ASSETS_CONFIG[asset].color;
            const geo = new THREE.SphereGeometry(0.15, 12, 12);
            const mat = new THREE.MeshBasicMaterial({ color: color });
            const mesh = new THREE.Mesh(geo, mat);
            
            // Halo
            const glowGeo = new THREE.SphereGeometry(0.3, 12, 12);
            const glowMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            mesh.add(glow);

            nodeGroup.add(mesh);
            // Position de départ aléatoire mais au loin
            mesh.position.z = -10 - Math.random() * 10;
            
            nodes[asset] = { mesh, glow, speed: 0.05 + Math.random() * 0.05, angle: Math.random() * Math.PI * 2 };
        });

        let time = 0;
        let animationId;

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            time += 0.01;

            // --- ANIMATION DU TUNNEL (DEFORMATION) ---
            const positions = tunnel.geometry.attributes.position;
            // Facteur de resserrement basé sur la volatilité (Squeeze)
            const squeezeFactor = 1 - (Math.min(volatility, 5) * 0.1); // Plus de vol = tunnel plus étroit

            for (let i = 0; i < positions.count; i++) {
                const orig = originalPositions[i];
                // Ondulation qui avance (z + time)
                const wave = Math.sin(orig.z * 0.5 + time * 2) * (volatility * 0.2);
                const twist = Math.cos(orig.z * 0.2 + time) * (volatility * 0.1);
                
                // Appliquer la déformation
                // x et y sont modifiés pour créer l'effet de respiration et de twist
                const scale = 1 + (wave * 0.1);
                
                const newX = orig.x * scale * squeezeFactor + twist;
                const newY = orig.y * scale * squeezeFactor + twist;
                
                // Mouvement infini : on décale Z, et on boucle
                let newZ = orig.z + (time * 5) % 20; 
                if (newZ > 5) newZ -= 40; // Reset au fond

                positions.setXYZ(i, newX, newY, newZ);
            }
            positions.needsUpdate = true;
            
            // Rotation du tunnel pour effet désorientant si haute vol
            tunnel.rotation.z = Math.sin(time * 0.2) * 0.1 * volatility;


            // --- ANIMATION DES ACTIFS ---
            assets.forEach(asset => {
                const node = nodes[asset];
                const corr = correlations[asset] || 0.5; // 0 (mur) à 1 (centre)
                
                // Logique de positionnement
                // Corr élevée -> Proche du centre (0,0)
                // Corr faible -> Proche des murs (radius ~2.5)
                const targetRadius = (1 - corr) * 2.5; 
                
                // Mise à jour de l'angle (ils tournent dans le tunnel)
                node.angle += 0.01;
                
                const targetX = Math.cos(node.angle) * targetRadius;
                const targetY = Math.sin(node.angle) * targetRadius;

                // Lerp vers la position cible
                node.mesh.position.x += (targetX - node.mesh.position.x) * 0.05;
                node.mesh.position.y += (targetY - node.mesh.position.y) * 0.05;
                
                // Mouvement en Z (avancent vers la caméra ou reculent)
                // Ici on les fait flotter dans une zone visible
                node.mesh.position.z = -2 + Math.sin(time + node.angle) * 2;

                // Pulsation du glow
                node.glow.scale.setScalar(1 + Math.sin(time * 5) * 0.2);
            });

            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!mountRef.current) return;
            const w = mountRef.current.clientWidth;
            const h = mountRef.current.clientHeight;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
            cancelAnimationFrame(animationId);
            tunnelGeo.dispose();
            tunnelMat.dispose();
        };
    }, [correlations, volatility]);

    return (
        <div className="w-full h-full relative overflow-hidden bg-black">
            <div ref={mountRef} className="w-full h-full" />
            
            {/* Légende Interactive */}
            <div className="absolute bottom-2 left-2 pointer-events-auto flex flex-wrap gap-1 w-full pr-2">
                 {assets.map(a => (
                     <span key={a} className={`text-[7px] border px-1 rounded ${
                         (correlations[a]||0) > 0.6 ? 'border-red-500 text-red-500' : 
                         (correlations[a]||0) < 0.4 ? 'border-emerald-500 text-emerald-500' : 'border-zinc-700 text-zinc-600'
                     }`}>
                         {a.slice(0,3)}
                     </span>
                 ))}
            </div>
            <div className="absolute top-2 right-2 text-[7px] text-zinc-500 uppercase text-right">
                <div>Center = Risk (Flow)</div>
                <div>Walls = Alpha (Surf)</div>
            </div>
        </div>
    );
};

/* NODE HOLOGRAM */
const NodeHologram = ({ volatility }) => {
    const mountRef = useRef(null);
    useEffect(() => {
        if (!mountRef.current) return;
        const scene = new THREE.Scene(); scene.background = null; 
        const width = mountRef.current.clientWidth; const height = mountRef.current.clientHeight;
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000); camera.position.z = 4;
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); renderer.setSize(width, height);
        mountRef.current.appendChild(renderer.domElement);
        const geometry = new THREE.IcosahedronGeometry(1.2, 1);
        const material = new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
        const sphere = new THREE.LineSegments(new THREE.WireframeGeometry(geometry), material);
        scene.add(sphere);
        
        let time = 0; let animationId;
        const animate = () => {
            animationId = requestAnimationFrame(animate); time += 0.01;
            sphere.rotation.y += 0.005; sphere.rotation.x += 0.002;
            const pulse = 1 + Math.sin(time * (2 + volatility * 2)) * 0.05;
            sphere.scale.set(pulse, pulse, pulse);
            if (volatility > 3.5) { material.color.setHex(0xef4444); material.opacity = 0.8 + Math.random() * 0.2; sphere.rotation.z += 0.1; } 
            else { material.color.setHex(0x10b981); material.opacity = 0.6; }
            renderer.render(scene, camera);
        };
        animate();
        const handleResize = () => { if (!mountRef.current) return; renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight); camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight; camera.updateProjectionMatrix(); };
        window.addEventListener('resize', handleResize);
        return () => { window.removeEventListener('resize', handleResize); if(mountRef.current) mountRef.current.removeChild(renderer.domElement); cancelAnimationFrame(animationId); geometry.dispose(); material.dispose(); renderer.dispose(); };
    }, [volatility]);
    return <div className="w-full h-full relative overflow-hidden group"><div ref={mountRef} className="w-full h-full" /><div className="absolute bottom-2 left-2 text-[8px] uppercase font-bold text-emerald-500/50 group-hover:text-emerald-400 transition-colors">Synaptic_Core: {volatility > 3.5 ? 'OVERLOAD' : 'STABLE'}</div></div>;
};

/* NEURAL FORECAST */
const NeuralForecast = ({ history, volatility, regime }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current; if(!canvas || !canvas.parentElement || history.length < 10) return;
        const ctx = canvas.getContext('2d');
        const resizeCanvas = () => { canvas.width = canvas.parentElement.clientWidth; canvas.height = canvas.parentElement.clientHeight; };
        resizeCanvas();
        const w = canvas.width; const h = canvas.height;
        const min = Math.min(...history) * 0.9998; const max = Math.max(...history) * 1.0002;
        const range = (max - min) || 0.01; const padding = 20; const chartH = h - (padding * 2); const xStep = (w * 0.70) / history.length;
        ctx.clearRect(0,0,w,h);
        ctx.beginPath(); ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2;
        history.forEach((p, i) => { const x = i * xStep; const y = h - padding - ((p - min) / range) * chartH; if(i === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
        ctx.stroke();
        const lastP = history[history.length-1]; const lastX = (history.length-1) * xStep; const lastY = h - padding - ((lastP - min) / range) * chartH;
        const slope = ((lastP - history[history.length-10]) / 10) * (1 + (volatility/10));
        ctx.beginPath(); ctx.fillStyle = 'rgba(16, 185, 129, 0.05)'; ctx.moveTo(lastX, lastY);
        for(let i=1; i<=15; i++) { const spread = (i * volatility * (lastP * 0.00005)); const p = lastP + (slope * i) + spread; ctx.lineTo(lastX + i * xStep, h - padding - ((p - min) / range) * chartH); }
        for(let i=15; i>=1; i--) { const spread = (i * volatility * (lastP * 0.00005)); const p = lastP + (slope * i) - spread; ctx.lineTo(lastX + i * xStep, h - padding - ((p - min) / range) * chartH); }
        ctx.closePath(); ctx.fill();
    }, [history, volatility, regime]);
    return <canvas ref={canvasRef} className="w-full h-full" />;
};

/* ORDER DEPTH */
const OrderDepth = ({ currentPrice, volatility }) => {
    const depthData = useMemo(() => {
        if (!currentPrice) return { asks: [], bids: [], imbalance: 0, spread: 0 };
        const spread = currentPrice * 0.0001 * volatility;
        const asks = []; const bids = []; let totalAskSize = 0; let totalBidSize = 0;
        for (let i = 0; i < 8; i++) { const size = Math.random() * 2 + (i === 4 ? 8 : 0); totalAskSize += size; asks.push({ price: currentPrice + (spread/2) + (i * currentPrice * 0.00015), size, cumulative: totalAskSize }); }
        for (let i = 0; i < 8; i++) { const size = Math.random() * 2 + (i === 3 ? 10 : 0); totalBidSize += size; bids.push({ price: currentPrice - (spread/2) - (i * currentPrice * 0.00015), size, cumulative: totalBidSize }); }
        return { asks: asks.reverse(), bids, imbalance: (totalBidSize / (totalAskSize + totalBidSize)) * 100, spread };
    }, [currentPrice, volatility]);
    return (
        <div className="flex flex-col h-full font-mono text-[9px] select-none">
            <div className="mb-2 shrink-0"><div className="h-1 w-full bg-zinc-900 flex rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${depthData.imbalance}%` }} /><div className="h-full bg-red-600" style={{ width: `${100 - depthData.imbalance}%` }} /></div></div>
            <div className="flex-1 overflow-hidden flex flex-col gap-0.5">
                {depthData.asks.map((a, i) => (<div key={`ask-${i}`} className="grid grid-cols-3 relative group overflow-hidden h-3.5 items-center px-1"><div className="absolute right-0 top-0 bottom-0 bg-red-900/10" style={{ width: `${(a.cumulative / 25) * 100}%` }} /><span className="text-red-500 font-bold z-10">{a.price.toFixed(2)}</span><span className="text-zinc-500 text-center z-10">{a.size.toFixed(3)}</span><span className="text-zinc-700 text-right text-[7px] z-10 opacity-50">{a.cumulative.toFixed(1)}</span></div>))}
                <div className="py-1 my-1 border-y border-emerald-900/30 bg-emerald-500/5 text-center px-2 shrink-0"><span className="text-white font-black text-[11px]">{currentPrice?.toFixed(2)}</span></div>
                {depthData.bids.map((b, i) => (<div key={`bid-${i}`} className="grid grid-cols-3 relative group overflow-hidden h-3.5 items-center px-1"><div className="absolute left-0 top-0 bottom-0 bg-emerald-900/10" style={{ width: `${(b.cumulative / 25) * 100}%` }} /><span className="text-emerald-400 font-bold z-10">{b.price.toFixed(2)}</span><span className="text-zinc-500 text-center z-10">{b.size.toFixed(3)}</span><span className="text-zinc-700 text-right text-[7px] z-10 opacity-50">{b.cumulative.toFixed(1)}</span></div>))}
            </div>
        </div>
    );
};

/* WHALE WATCH */
const WhaleWatch = ({ trades, activeSymbol, currentPrice }) => {
    const activeTrades = useMemo(() => trades.filter(t => t.symbol === activeSymbol && t.isWhale), [trades, activeSymbol]);
    const stats = useMemo(() => {
        let buyVol = 0; let sellVol = 0; let totalVol = 0; let totalVal = 0;
        activeTrades.forEach(t => { if(t.side === 'BUY') buyVol += t.value; else sellVol += t.value; totalVol += t.size; totalVal += t.value; });
        const netFlow = buyVol - sellVol; const vwap = totalVol > 0 ? totalVal / totalVol : 0;
        return { buyVol, sellVol, netFlow, vwap };
    }, [activeTrades]);
    const vwapGap = currentPrice && stats.vwap ? ((currentPrice - stats.vwap) / stats.vwap) * 100 : 0;
    return (
        <div className="flex flex-col h-full gap-2">
            <div className="grid grid-cols-2 gap-2 text-[9px] uppercase">
                <div className="bg-emerald-900/10 p-2 border border-emerald-900/30 rounded">
                    <div className="text-zinc-500 text-[8px] flex justify-between"><span>Net_Flow</span><span className={stats.netFlow > 0 ? 'text-emerald-400' : 'text-red-400'}>{stats.netFlow > 0 ? '+' : ''}${(stats.netFlow/1000).toFixed(0)}K</span></div>
                    <div className="mt-1 h-1 bg-zinc-900 rounded-full flex overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${(stats.buyVol / (stats.buyVol + stats.sellVol || 1)) * 100}%` }} /><div className="h-full bg-red-600" style={{ width: `${(stats.sellVol / (stats.buyVol + stats.sellVol || 1)) * 100}%` }} /></div>
                </div>
                <div className="bg-emerald-900/10 p-2 border border-emerald-900/30 rounded">
                    <div className="text-zinc-500 text-[8px] flex justify-between"><span>Whale_VWAP</span><span className={vwapGap > 0 ? 'text-emerald-400' : 'text-red-400'}>{stats.vwap.toFixed(2)}</span></div>
                     <div className="text-[8px] text-right mt-0.5">Gap: <span className={vwapGap > 0 ? 'text-emerald-500' : 'text-red-500'}>{vwapGap > 0 ? '+' : ''}{vwapGap.toFixed(2)}%</span></div>
                </div>
            </div>
            <div className="flex-1 overflow-auto space-y-1 pr-1">
                {activeTrades.slice(0, 8).map((t, i) => (
                    <div key={i} className={`flex justify-between items-center p-1.5 border-l-2 text-[9px] ${t.side === 'BUY' ? 'border-emerald-500 bg-emerald-500/5' : 'border-red-500 bg-red-500/5'}`}>
                        <div className="flex flex-col"><span className="font-bold text-white flex items-center gap-1">{t.isMaker ? <div className="w-1 h-1 rounded-full bg-zinc-500"/> : <Zap size={8} className={t.side === 'BUY' ? 'text-emerald-400' : 'text-red-400'}/>} ${ (t.value/1000).toFixed(0) }K</span></div>
                        <div className="flex flex-col text-right"><span className={t.side === 'BUY' ? 'text-emerald-400' : 'text-red-400'}>{t.price.toFixed(2)}</span><span className="text-[7px] text-zinc-600">{new Date(t.time).toLocaleTimeString([], {hour12:false, minute:'2-digit', second:'2-digit'})}</span></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* KINETIC CORE */
const KineticCore = ({ volatility, trades }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current; if(!canvas) return; const ctx = canvas.getContext('2d');
        const w = canvas.width = canvas.parentElement.clientWidth; const h = canvas.height = canvas.parentElement.clientHeight;
        const cols = Math.floor(w / 30); const rows = Math.floor(h / 30); const xGap = w / cols; const yGap = h / rows;
        const recent = trades.slice(0, 20); const buyVol = recent.filter(t => t.side === 'BUY').reduce((a, t) => a + t.size, 0); const sellVol = recent.filter(t => t.side === 'SELL').reduce((a, t) => a + t.size, 0);
        const bias = (buyVol - sellVol) / (buyVol + sellVol || 1);
        let frame = 0;
        const draw = () => {
            ctx.fillStyle = 'rgba(0,5,2,0.15)'; ctx.fillRect(0,0,w,h); frame += 0.02 * volatility;
            for(let i=0; i<cols; i++) { for(let j=0; j<rows; j++) {
                    const x = i * xGap + xGap/2; const y = j * yGap + yGap/2;
                    const noise = Math.sin(i * 0.5 + frame) * Math.cos(j * 0.5 + frame); const angle = (bias * Math.PI) + (noise * (volatility / 2));
                    const len = 8 + (volatility * 1.5); const tx = x + Math.cos(angle) * len; const ty = y + Math.sin(angle) * len;
                    const coherence = 1 - Math.abs(noise); ctx.strokeStyle = `rgba(${255 * (1-coherence)}, ${255 * coherence}, 120, ${0.2 + coherence*0.5})`;
                    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(tx, ty); ctx.stroke();
            }}
            requestAnimationFrame(draw);
        };
        const anim = requestAnimationFrame(draw); return () => cancelAnimationFrame(anim);
    }, [volatility, trades]);
    return <canvas ref={canvasRef} className="w-full h-full opacity-60" />;
};

/* --- MAIN APPLICATION --- */
export default function App() {
  const [booted, setBooted] = useState(false);
  const [activeSymbol, setActiveSymbol] = useState('BTC');
  const [whaleThreshold, setWhaleThreshold] = useState(50000);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isAssetSelectorOpen, setIsAssetSelectorOpen] = useState(false);
  
  const { prices, trades, connectionStatus, volatility, setTrades } = useDataStream(booted, whaleThreshold);

  const marketRegime = useMemo(() => {
    if (trades.length < 20) return "CALIB";
    const buys = trades.slice(0, 20).filter(t => t.side === 'BUY').length;
    return buys > 13 ? "BULL" : (buys < 7 ? "BEAR" : "RNG");
  }, [trades]);

  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    "LEONCE OS V9.9",
    "LIQUIDITY_TUNNEL: DEPLOYED",
    "MATRIX: DECOMPOSED"
  ]);

  const bottomRef = useRef(null);

  useEffect(() => { setTimeout(() => setBooted(true), 1200); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView(); }, [history]);

  const handleCommand = (e) => {
    if (e.key === 'Enter') {
      const full = input.trim().toLowerCase();
      const [cmd, arg] = full.split(' ');
      const newHist = [...history, `> ${full}`];
      switch(cmd) {
        case 'help': setShowHelp(true); break;
        case 'scan': Object.entries(prices).forEach(([s, d]) => newHist.push(` > ${s}: ${d.price.toFixed(2)}`)); break;
        case 'purge': setTrades([]); setHistory(["PURGED"]); break;
        case 'focus': if (ASSETS_CONFIG[arg?.toUpperCase()]) setActiveSymbol(arg.toUpperCase()); break;
        case 'clear': setHistory([]); setInput(''); return;
        default: newHist.push(`ERR: ???`);
      }
      setHistory(newHist.slice(-5)); setInput('');
    }
  };

  if (!booted) return <div className="h-screen bg-black flex flex-col items-center justify-center font-mono text-emerald-500 tracking-[0.5em] animate-pulse text-xs md:text-base">INITIALIZING_V9.9</div>;

  return (
    <div className="h-screen w-full bg-black font-mono text-emerald-500 overflow-hidden flex flex-col selection:bg-emerald-500/20">
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden h-full w-full opacity-20"><div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%),linear-gradient(90deg,rgba(0,255,0,0.01),rgba(0,0,0,0.01),rgba(0,255,0,0.01))] bg-[length:100%_4px,3px_100%]" /></div>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* HEADER */}
      <div className="h-12 md:h-10 border-b bg-gray-950 border-emerald-900/40 flex justify-between items-center px-4 shrink-0 z-40 relative">
        <div className="flex items-center gap-4">
          <span className="font-black text-xs tracking-[0.2em] md:tracking-[0.4em] text-emerald-400 uppercase">Leonce_OS</span>
          <div className="flex gap-1 items-center">
             <div className="hidden sm:block px-3 py-0.5 rounded text-[8px] border border-emerald-500/30 text-emerald-500 font-black uppercase bg-emerald-900/10">{marketRegime}</div>
             <div className="relative">
                 <button onClick={() => setIsAssetSelectorOpen(!isAssetSelectorOpen)} className="px-3 py-0.5 rounded text-[8px] border border-emerald-500/30 text-white font-black uppercase bg-emerald-900/20 hover:bg-emerald-800/40 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500/50">
                    {activeSymbol} <ChevronDown size={8} className={`transition-transform duration-300 ${isAssetSelectorOpen ? 'rotate-180' : ''}`} />
                 </button>
                 {isAssetSelectorOpen && (
                     <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsAssetSelectorOpen(false)}></div>
                        <div className="absolute top-full left-0 mt-1 w-24 bg-gray-950 border border-emerald-500/30 shadow-2xl z-50 flex flex-col max-h-60 overflow-y-auto no-scrollbar rounded animate-in fade-in zoom-in-95 duration-100">
                            {Object.keys(ASSETS_CONFIG).map(symbol => (
                                <button key={symbol} onClick={() => { setActiveSymbol(symbol); setIsAssetSelectorOpen(false); }} className={`text-left px-3 py-2 text-[9px] hover:bg-emerald-900/30 transition-colors uppercase font-mono ${activeSymbol === symbol ? 'text-emerald-400 font-bold bg-emerald-900/10' : 'text-zinc-400'}`}>{symbol}</button>
                            ))}
                        </div>
                     </>
                 )}
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[9px] font-bold">
           <button onClick={() => setShowHelp(true)} className="flex items-center gap-1 text-emerald-400 hover:text-white transition-colors border border-emerald-500/20 px-2 py-0.5 rounded bg-emerald-900/20"><HelpCircle size={12} /> <span className="hidden md:inline">MANUAL</span></button>
           <div className={`flex items-center gap-2 ${connectionStatus === 'ONLINE' ? 'text-emerald-500' : 'text-red-500'}`}><Wifi size={12}/> <span className="hidden md:inline">{connectionStatus}</span></div>
           <div className="hidden md:flex items-center gap-2 border-l border-emerald-900/40 pl-6 text-zinc-600 uppercase tracking-widest"><Lock size={12}/> Secure</div>
           <button className="md:hidden text-emerald-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><Menu size={16} /></button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:grid md:grid-cols-3 md:grid-rows-3 gap-2 p-2 md:gap-px md:bg-emerald-900/10 md:p-px overflow-y-auto md:overflow-hidden scroll-smooth">
        <Window title="Exec_Shell" icon={Terminal} className="order-1">
            <div className="flex flex-col h-full justify-between">
                <div className="flex-1 opacity-80 min-h-[100px]">{history.map((l, i) => <div key={i} className="break-all">{l}</div>)}<div ref={bottomRef}/></div>
                <div className="flex border-t border-emerald-900/20 pt-1 mt-1 font-bold"><span className="mr-1 text-emerald-700">$</span><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleCommand} className="bg-transparent outline-none flex-1 uppercase text-white w-full" autoFocus={false} placeholder="CMD..." /></div>
            </div>
        </Window>
        
        <Window title="Neural_Forecast" icon={BarChart3} className="order-2"><NeuralForecast history={prices[activeSymbol]?.history || []} volatility={volatility} regime={marketRegime} /></Window>
        <Window title="Order_Depth" icon={Layers} className="order-3"><OrderDepth currentPrice={prices[activeSymbol]?.price || 0} volatility={volatility} /></Window>

        {/* SYSTEMIC MATRIX REPLACED BY 3D TUNNEL */}
        <Window title="Liquidity_Tunnel_3D" icon={Grid} className="order-4">
            <SystemicTunnel3D prices={prices} volatility={volatility} />
        </Window>

        <Window title="Kinetic_Core" icon={Cpu} className="order-5"><KineticCore volatility={volatility} trades={trades}/></Window>
        <Window title="Tape_Signals" icon={Activity} className="order-6">
            <div className="space-y-0.5">
                {trades.filter(t => t.symbol === activeSymbol).slice(0, 10).map((t, i) => (
                    <div key={i} className={`flex justify-between items-center ${t.isWhale ? 'bg-emerald-500/10 font-bold' : ''}`}>
                        <span className="text-zinc-600">{new Date(t.time).toLocaleTimeString([], {hour12:false, minute:'2-digit', second:'2-digit'})}</span>
                        <span className={t.side === 'BUY' ? 'text-emerald-400' : 'text-red-400'}>{t.price.toFixed(2)}</span>
                    </div>
                ))}
            </div>
        </Window>

        <Window title="Whale_Watch" icon={Anchor} className="order-7"><WhaleWatch trades={trades} activeSymbol={activeSymbol} currentPrice={prices[activeSymbol]?.price} /></Window>

        <Window title="Risk_Shield" icon={Shield} className="order-8">
            <div className="space-y-4 h-full flex flex-col justify-between uppercase">
                <div>
                    <div className="flex justify-between mb-1"><span className="text-zinc-500 text-[8px]">Stress</span><span className={volatility > 3.5 ? 'text-red-500' : 'text-emerald-400'}>{(volatility*20).toFixed(0)}%</span></div>
                    <div className="h-1 w-full bg-zinc-900"><div className={`h-full ${volatility > 3.5 ? 'bg-red-600' : 'bg-emerald-500'}`} style={{ width: `${volatility*20}%` }} /></div>
                </div>
                <div className="text-[8px] text-zinc-700 italic border-t border-emerald-900/20 pt-2">Guardian: Active</div>
            </div>
        </Window>

        <Window title="Synaptic_Core" icon={HardDrive} className="order-9"><NodeHologram volatility={volatility} /></Window>
      </div>

      <div className="h-8 md:h-6 bg-black border-t border-emerald-900/40 flex items-center overflow-hidden shrink-0">
        <div className="animate-ticker flex whitespace-nowrap">
            {Object.entries(prices).map(([s, d]) => (
                <span key={s} onClick={() => setActiveSymbol(s)} className={`mx-4 md:mx-6 text-[10px] md:text-[9px] cursor-pointer font-black uppercase transition-all flex items-center gap-2 ${activeSymbol === s ? 'text-white underline decoration-emerald-500' : 'text-emerald-900 hover:text-emerald-600'}`}>
                    {s} <span className={d.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}>{d.price?.toFixed(2)}</span>
                </span>
            ))}
        </div>
      </div>
      <style>{`@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .animate-ticker { animation: ticker 40s linear infinite; } .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } input { caret-color: #10b981; }`}</style>
    </div>
  );
}
