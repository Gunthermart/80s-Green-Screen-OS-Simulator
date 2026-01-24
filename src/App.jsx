import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Terminal, Shield, Activity, BarChart3, Zap, Radar, Cpu, Grid, Lock, Wifi, Layers, Target, Anchor, TrendingUp, AlertCircle, PieChart, ArrowUpRight, ArrowDownRight, HardDrive, BarChart, TrendingDown, Menu, Crosshair, HelpCircle, X, ChevronDown, MoveVertical, AlertTriangle } from 'lucide-react';

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
    { id: 'Neural_Forecast', icon: BarChart3, title: 'MONTE CARLO ENGINE', descEN: 'Probabilistic projection using 50 path simulations.', descFR: 'Projection probabiliste utilisant 50 simulations.' },
    { id: 'Order_Depth', icon: Layers, title: 'LIQUID DEPTH (DOM)', descEN: 'Advanced Liquidity mapping.', descFR: 'Cartographie avancée de liquidité.' },
    { id: 'Sys_Matrix', icon: Grid, title: 'SYSTEMIC TUNNEL', descEN: '3D Liquidity Vortex.', descFR: 'Vortex de Liquidité 3D.' },
    { id: 'Kinetic_Core', icon: Cpu, title: 'KINETIC REACTOR', descEN: 'Particle accelerator visualizing trade flow energy and market entropy.', descFR: 'Accélérateur de particules visualisant l\'énergie des trades et l\'entropie du marché.' },
    { id: 'Tape_Signals', icon: Activity, title: 'TAPE SIGNALS', descEN: 'Real-time trade feed.', descFR: 'Flux de transactions.' },
    { id: 'Whale_Watch', icon: Anchor, title: 'WHALE WATCH', descEN: 'Institutional tracker.', descFR: 'Traqueur institutionnel.' },
    { id: 'Risk_Shield', icon: Shield, title: 'AEGIS RADAR', descEN: 'Multidimensional risk topology.', descFR: 'Topologie de risque multidimensionnelle.' },
    { id: 'Synaptic_Core', icon: HardDrive, title: 'HYPER-CORTEX', descEN: 'Neural Reactor.', descFR: 'Réacteur Neural.' }
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

/* --- UI COMPONENTS --- */

const Window = ({ title, children, icon: IconComp, className = "" }) => (
    <div className={`bg-gray-950/95 border border-emerald-500/20 flex flex-col overflow-hidden shadow-[inset_0_0_20px_rgba(16,185,129,0.02)] min-h-[250px] md:min-h-0 ${className}`}>
        <div className="bg-emerald-950/10 border-b border-emerald-500/10 p-2 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-400/80">
                <IconComp size={14} className="text-emerald-600" />
                {title}
            </div>
            <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_#10b981]" />
        </div>
        <div className="p-3 flex-1 overflow-auto font-mono text-xs text-emerald-400/90 no-scrollbar relative">
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
                    <div className="flex items-center gap-3 text-emerald-400 font-bold tracking-widest uppercase text-sm">
                        <HelpCircle size={20} /> System_Manual_V10.5
                    </div>
                    <button onClick={onClose} className="text-emerald-500 hover:text-red-500 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 no-scrollbar">
                    {SYSTEM_DOCS.map((doc, i) => (
                        <div key={i} className="border border-emerald-500/20 p-4 bg-emerald-900/5 hover:bg-emerald-900/10 transition-colors group">
                            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2 uppercase text-xs tracking-wider border-b border-emerald-500/10 pb-2">
                                <doc.icon size={16} className="text-emerald-600 group-hover:text-emerald-400 transition-colors"/> {doc.title}
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-0.5">English</span>
                                    <p className="text-[11px] text-emerald-300/80 leading-relaxed">{doc.descEN}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-0.5">Français</span>
                                    <p className="text-[11px] text-emerald-300/60 leading-relaxed italic">{doc.descFR}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-2 border-t border-emerald-500/30 bg-emerald-900/5 text-center text-[10px] text-zinc-500 uppercase">
                    Leonce Equity Systems // Authorized Personnel Only
                </div>
            </div>
        </div>
    );
};

/* --- 3D COMPONENTS --- */

const SystemicTunnel3D = ({ prices, volatility }) => {
    const mountRef = useRef(null);
    const assets = useMemo(() => Object.keys(ASSETS_CONFIG), []);
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
        scene.fog = new THREE.FogExp2(0x000000, 0.15);
        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        camera.position.z = 5;
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        mountRef.current.appendChild(renderer.domElement);
        const tunnelGeo = new THREE.CylinderGeometry(3, 3, 40, 32, 20, true);
        tunnelGeo.rotateX(Math.PI / 2);
        const positionAttribute = tunnelGeo.attributes.position;
        const vertex = new THREE.Vector3();
        const originalPositions = [];
        for (let i = 0; i < positionAttribute.count; i++) {
            vertex.fromBufferAttribute(positionAttribute, i);
            originalPositions.push({x: vertex.x, y: vertex.y, z: vertex.z, angle: Math.atan2(vertex.y, vertex.x)});
        }
        const tunnelMat = new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true, transparent: true, opacity: 0.15 });
        const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
        scene.add(tunnel);
        const nodes = {};
        const nodeGroup = new THREE.Group();
        scene.add(nodeGroup);
        assets.forEach(asset => {
            const color = ASSETS_CONFIG[asset].color;
            const geo = new THREE.SphereGeometry(0.15, 12, 12);
            const mat = new THREE.MeshBasicMaterial({ color: color });
            const mesh = new THREE.Mesh(geo, mat);
            const glowGeo = new THREE.SphereGeometry(0.3, 12, 12);
            const glowMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            mesh.add(glow);
            nodeGroup.add(mesh);
            mesh.position.z = -10 - Math.random() * 10;
            nodes[asset] = { mesh, glow, speed: 0.05 + Math.random() * 0.05, angle: Math.random() * Math.PI * 2 };
        });

        let time = 0;
        let animationId;
        const animate = () => {
            animationId = requestAnimationFrame(animate);
            time += 0.01;
            const positions = tunnel.geometry.attributes.position;
            const squeezeFactor = 1 - (Math.min(volatility, 5) * 0.1);
            for (let i = 0; i < positions.count; i++) {
                const orig = originalPositions[i];
                const wave = Math.sin(orig.z * 0.5 + time * 2) * (volatility * 0.2);
                const twist = Math.cos(orig.z * 0.2 + time) * (volatility * 0.1);
                const scale = 1 + (wave * 0.1);
                const newX = orig.x * scale * squeezeFactor + twist;
                const newY = orig.y * scale * squeezeFactor + twist;
                let newZ = orig.z + (time * 5) % 20; 
                if (newZ > 5) newZ -= 40;
                positions.setXYZ(i, newX, newY, newZ);
            }
            positions.needsUpdate = true;
            tunnel.rotation.z = Math.sin(time * 0.2) * 0.1 * volatility;
            assets.forEach(asset => {
                const node = nodes[asset];
                const corr = correlations[asset] || 0.5;
                const targetRadius = (1 - corr) * 2.5; 
                node.angle += 0.01;
                const targetX = Math.cos(node.angle) * targetRadius;
                const targetY = Math.sin(node.angle) * targetRadius;
                node.mesh.position.x += (targetX - node.mesh.position.x) * 0.05;
                node.mesh.position.y += (targetY - node.mesh.position.y) * 0.05;
                node.mesh.position.z = -2 + Math.sin(time + node.angle) * 2;
                node.glow.scale.setScalar(1 + Math.sin(time * 5) * 0.2);
            });
            renderer.render(scene, camera);
        };
        animate();
        const handleResize = () => { if (!mountRef.current) return; const w = mountRef.current.clientWidth; const h = mountRef.current.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); };
        window.addEventListener('resize', handleResize);
        return () => { window.removeEventListener('resize', handleResize); if (mountRef.current) mountRef.current.removeChild(renderer.domElement); cancelAnimationFrame(animationId); tunnelGeo.dispose(); tunnelMat.dispose(); };
    }, [correlations, volatility]);
    return (
        <div className="w-full h-full relative overflow-hidden bg-black">
            <div ref={mountRef} className="w-full h-full" />
            <div className="absolute bottom-2 left-2 pointer-events-auto flex flex-wrap gap-1 w-full pr-2">
                 {assets.map(a => (<span key={a} className={`text-[9px] border px-1.5 py-0.5 rounded ${(correlations[a]||0) > 0.6 ? 'border-red-500 text-red-500' : (correlations[a]||0) < 0.4 ? 'border-emerald-500 text-emerald-500' : 'border-zinc-700 text-zinc-600'}`}>{a.slice(0,3)}</span>))}
            </div>
        </div>
    );
};

const NodeHologram = ({ volatility }) => {
    const mountRef = useRef(null);
    useEffect(() => {
        if (!mountRef.current) return;
        const scene = new THREE.Scene();
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        camera.position.z = 4.5;
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        mountRef.current.appendChild(renderer.domElement);
        const group = new THREE.Group();
        scene.add(group);
        const outerGeo = new THREE.IcosahedronGeometry(1.2, 2);
        const outerMat = new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending });
        const outerShell = new THREE.LineSegments(new THREE.WireframeGeometry(outerGeo), outerMat);
        group.add(outerShell);
        const particleCount = 200;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        for(let i = 0; i < particleCount; i++) {
            const r = 0.8 * Math.sqrt(Math.random()); const theta = Math.random() * 2 * Math.PI; const phi = Math.acos(2 * Math.random() - 1);
            positions[i*3] = r * Math.sin(phi) * Math.cos(theta); positions[i*3+1] = r * Math.sin(phi) * Math.sin(theta); positions[i*3+2] = r * Math.cos(phi);
        }
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMat = new THREE.PointsMaterial({ color: 0x34d399, size: 0.04, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
        const reactor = new THREE.Points(particleGeo, particleMat);
        group.add(reactor);
        const ringGeo = new THREE.TorusGeometry(1.6, 0.02, 16, 100);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x059669, transparent: true, opacity: 0.3 });
        const ring1 = new THREE.Mesh(ringGeo, ringMat); const ring2 = new THREE.Mesh(ringGeo, ringMat);
        ring1.rotation.x = Math.PI / 2; ring2.rotation.x = Math.PI / 4; ring2.rotation.y = Math.PI / 4;
        group.add(ring1); group.add(ring2);
        let time = 0; let animationId;
        const animate = () => {
            animationId = requestAnimationFrame(animate); time += 0.02;
            const stress = Math.max(1, Math.min(volatility, 5)); const pulseSpeed = time * stress;
            outerShell.rotation.y += 0.002 * stress; outerShell.rotation.z -= 0.001 * stress;
            reactor.rotation.y -= 0.01 * stress; reactor.rotation.x += 0.005 * stress;
            ring1.rotation.z += 0.01; ring1.rotation.x = Math.sin(time * 0.5) * 0.5; ring2.rotation.z -= 0.015;
            const heartbeat = 1 + Math.sin(pulseSpeed * 2) * (0.05 * stress);
            outerShell.scale.setScalar(heartbeat); reactor.scale.setScalar(heartbeat * 0.9);
            if (stress > 3) { outerMat.color.setHex(0xef4444); particleMat.color.setHex(0xf87171); ringMat.color.setHex(0x7f1d1d); group.position.x = (Math.random() - 0.5) * 0.1; }
            else if (stress > 1.8) { outerMat.color.setHex(0xf59e0b); particleMat.color.setHex(0xfcd34d); ringMat.color.setHex(0x78350f); group.position.x = 0; }
            else { outerMat.color.setHex(0x10b981); particleMat.color.setHex(0x34d399); ringMat.color.setHex(0x064e3b); group.position.x = 0; }
            const positions = reactor.geometry.attributes.position.array;
            for(let i = 0; i < particleCount; i++) { positions[i*3] += Math.sin(time + i) * 0.002 * stress; }
            reactor.geometry.attributes.position.needsUpdate = true;
            renderer.render(scene, camera);
        };
        animate();
        const handleResize = () => { if (!mountRef.current) return; const w = mountRef.current.clientWidth; const h = mountRef.current.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); };
        window.addEventListener('resize', handleResize);
        return () => { window.removeEventListener('resize', handleResize); if (mountRef.current) mountRef.current.removeChild(renderer.domElement); cancelAnimationFrame(animationId); outerGeo.dispose(); outerMat.dispose(); particleGeo.dispose(); particleMat.dispose(); ringGeo.dispose(); ringMat.dispose(); };
    }, [volatility]);
    return (
        <div className="w-full h-full relative overflow-hidden group bg-black/50">
             <div ref={mountRef} className="w-full h-full" />
             <div className="absolute bottom-2 left-2 text-[10px] uppercase font-bold text-emerald-500/50 group-hover:text-emerald-400 transition-colors bg-black/40 px-2 rounded backdrop-blur-sm">Status: {volatility > 3 ? 'CRITICAL_LOAD' : (volatility > 1.8 ? 'WARNING' : 'OPTIMAL')}</div>
        </div>
    );
};

const NeuralForecast = ({ history, volatility, regime }) => {
    const canvasRef = useRef(null);
    const SIMULATIONS = 50;
    const STEPS = 20;

    // Calculer les scénarios seulement quand l'historique ou le régime change
    const scenarios = useMemo(() => {
        if (history.length < 10) return [];
        const lastP = history[history.length - 1];
        const last10 = history.slice(-10);
        // Pente récente simplifiée
        const slope = (lastP - last10[0]) / 10;
        
        // Biais selon régime
        let bias = 0;
        if (regime === "BULL") bias = Math.abs(slope) * 0.5;
        if (regime === "BEAR") bias = -Math.abs(slope) * 0.5;

        const allPaths = [];
        for (let s = 0; s < SIMULATIONS; s++) {
            const path = [lastP];
            let current = lastP;
            for (let t = 0; t < STEPS; t++) {
                // Monte Carlo simple : Drift + Choc Aléatoire
                // Le choc augmente avec la volatilité et le temps (t)
                const noise = (Math.random() - 0.5) * 2; // -1 to 1
                const shock = noise * (lastP * 0.001 * volatility * (1 + t * 0.1));
                
                // Drift component (tendance)
                const drift = bias + (slope * 0.5);
                
                current = current + drift + shock;
                path.push(current);
            }
            allPaths.push(path);
        }
        return allPaths;
    }, [history, volatility, regime]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !canvas.parentElement || history.length < 2) return;
        const ctx = canvas.getContext('2d');
        
        const resizeCanvas = () => { 
            canvas.width = canvas.parentElement.clientWidth; 
            canvas.height = canvas.parentElement.clientHeight; 
        };
        resizeCanvas();
        
        const w = canvas.width; 
        const h = canvas.height;
        
        // Echelles
        const allPoints = [...history, ...scenarios.flat()];
        const min = Math.min(...allPoints) * 0.9995;
        const max = Math.max(...allPoints) * 1.0005;
        const range = max - min || 1;
        const padding = 20;
        const chartH = h - (padding * 2);
        
        // Espace X : 70% historique, 30% forecast
        const xStepHist = (w * 0.70) / (history.length - 1);
        const xStepFore = (w * 0.30) / STEPS;

        const getY = (p) => h - padding - ((p - min) / range) * chartH;

        let frame = 0;
        let animId;

        const draw = () => {
            frame += 0.5;
            ctx.clearRect(0, 0, w, h);
            
            // 1. DRAW SCENARIOS (Probability Cloud)
            // On dessine d'abord les scénarios pour qu'ils soient derrière l'histoire
            scenarios.forEach((path, sIdx) => {
                const isBullish = path[path.length - 1] > history[history.length - 1];
                
                // Opacité basée sur la densité (trick visuel) et animation de scan
                // Scan line effect : une vague de lumière passe sur les prévisions
                const scanPhase = (frame * 0.1) % STEPS;
                
                ctx.beginPath();
                ctx.moveTo((history.length - 1) * xStepHist, getY(path[0]));
                
                for (let i = 1; i < path.length; i++) {
                    ctx.lineTo((history.length - 1) * xStepHist + (i * xStepFore), getY(path[i]));
                }
                
                // Couleur : Emerald pour Bull, Red pour Bear
                // Transparence très faible pour accumuler la lumière
                if (isBullish) {
                    ctx.strokeStyle = `rgba(16, 185, 129, 0.05)`; // Emerald très transparent
                } else {
                    ctx.strokeStyle = `rgba(239, 68, 68, 0.05)`; // Red très transparent
                }
                ctx.lineWidth = 1;
                ctx.stroke();

                // Highlight tip (points finaux)
                const lastY = getY(path[path.length-1]);
                const lastX = (history.length - 1) * xStepHist + (STEPS * xStepFore);
                ctx.fillStyle = isBullish ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)';
                ctx.fillRect(lastX, lastY, 1, 1);
            });

            // 2. MEAN PATH (Ligne moyenne du forecast - Le "Cœur")
            if (scenarios.length > 0) {
                ctx.beginPath();
                const startX = (history.length - 1) * xStepHist;
                const startY = getY(history[history.length-1]);
                ctx.moveTo(startX, startY);
                
                for(let t=1; t<STEPS; t++) {
                    let sum = 0;
                    scenarios.forEach(path => sum += path[t]);
                    const mean = sum / SIMULATIONS;
                    ctx.lineTo(startX + (t * xStepFore), getY(mean));
                }
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([2, 2]); // Pointillés
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // 3. DRAW HISTORY (Solid Line)
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#10b981';
            ctx.strokeStyle = '#10b981';
            
            history.forEach((p, i) => {
                const x = i * xStepHist;
                const y = getY(p);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
            ctx.shadowBlur = 0;

            // 4. HUD ELEMENTS
            // Séparateur vertical
            const splitX = (history.length - 1) * xStepHist;
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.moveTo(splitX, 0);
            ctx.lineTo(splitX, h);
            ctx.stroke();

            // Labels
            ctx.fillStyle = '#10b981';
            ctx.font = '9px monospace';
            ctx.fillText('PAST', splitX - 30, 10);
            ctx.fillStyle = '#f59e0b';
            ctx.fillText('FUTURE (MONTE CARLO)', splitX + 5, 10);

            // Last Price Marker
            const lp = history[history.length-1];
            const lpY = getY(lp);
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(splitX, lpY, 2, 0, Math.PI*2);
            ctx.fill();

            animId = requestAnimationFrame(draw);
        };
        draw();

        return () => cancelAnimationFrame(animId);
    }, [history, scenarios]); // Re-render quand history change ou scénarios recalculés

    return (
        <div className="w-full h-full relative">
            <canvas ref={canvasRef} className="w-full h-full block" />
            <div className="absolute bottom-1 right-1 text-[8px] text-zinc-600 font-mono">
                sims: {SIMULATIONS} | confidence: 95%
            </div>
        </div>
    );
};

const OrderDepth = ({ currentPrice, volatility }) => {
    const depthData = useMemo(() => {
        if (!currentPrice) return { asks: [], bids: [], imbalance: 50, spread: 0, maxVol: 1 };
        const spread = currentPrice * 0.0001 * volatility;
        const asks = []; const bids = []; 
        let totalAskSize = 0; let totalBidSize = 0;
        
        // Generate Asks (Sell Walls)
        for (let i = 0; i < 10; i++) { 
            const isWall = Math.random() > 0.8;
            const size = Math.random() * 5 + (isWall ? 25 : 0) + (i * 0.5); 
            totalAskSize += size; 
            asks.push({ price: currentPrice + (spread/2) + (i * currentPrice * 0.0001), size, cumulative: totalAskSize, isWall }); 
        }
        
        // Generate Bids (Buy Walls)
        for (let i = 0; i < 10; i++) { 
            const isWall = Math.random() > 0.8;
            const size = Math.random() * 5 + (isWall ? 25 : 0) + (i * 0.5); 
            totalBidSize += size; 
            bids.push({ price: currentPrice - (spread/2) - (i * currentPrice * 0.0001), size, cumulative: totalBidSize, isWall }); 
        }

        const maxVol = Math.max(totalAskSize, totalBidSize);
        const imbalance = (totalBidSize / (totalAskSize + totalBidSize)) * 100;

        return { asks: asks.reverse(), bids, imbalance, spread, maxVol };
    }, [currentPrice, volatility]);

    if (!currentPrice) return <div className="text-zinc-500 flex items-center justify-center h-full">WAITING FOR FEED...</div>;

    return (
        <div className="flex flex-col h-full font-mono text-[10px] select-none relative">
            
            {/* PRESSURE METER (Imbalance) */}
            <div className="mb-2 shrink-0 relative h-3 bg-zinc-900/80 border border-emerald-900/30 rounded flex overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center z-10 text-[8px] font-black tracking-widest text-white mix-blend-difference">
                    ORDER_FLOW_PRESSURE
                </div>
                <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300" style={{ width: `${depthData.imbalance}%` }} />
                <div className="h-full bg-gradient-to-l from-red-600 to-red-400 transition-all duration-300" style={{ width: `${100 - depthData.imbalance}%` }} />
                {/* Center Marker */}
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-black z-20"></div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col relative">
                
                {/* ASKS (SELL SIDE) - Top Half */}
                <div className="flex-1 flex flex-col justify-end pb-1 gap-[1px]">
                    {depthData.asks.map((a, i) => (
                        <div key={`ask-${i}`} className={`relative flex items-center h-4 px-2 hover:bg-red-900/20 transition-colors ${a.isWall ? 'animate-pulse bg-red-900/10' : ''}`}>
                            {/* Cumulative Depth Bar (Ghost) */}
                            <div className="absolute right-0 top-0 bottom-0 bg-red-500/10 transition-all duration-500" style={{ width: `${(a.cumulative / depthData.maxVol) * 100}%` }} />
                            {/* Volume Bar (Solid) */}
                            <div className="absolute right-0 top-0.5 bottom-0.5 bg-red-600/40 rounded-l-sm transition-all duration-300" style={{ width: `${Math.min(100, (a.size / 10) * 100)}%` }} />
                            
                            <span className="w-16 text-red-500 font-bold z-10 text-left tabular-nums tracking-tighter">{a.price.toFixed(2)}</span>
                            <span className={`flex-1 text-right z-10 tabular-nums ${a.isWall ? 'text-red-300 font-black' : 'text-zinc-500'}`}>{a.size.toFixed(3)}</span>
                            {a.isWall && <span className="absolute left-1/2 -translate-x-1/2 text-[8px] text-red-500/50 font-black tracking-widest z-0">WALL</span>}
                        </div>
                    ))}
                </div>

                {/* SPREAD INDICATOR (CENTER) */}
                <div className="h-6 shrink-0 bg-zinc-950 border-y border-emerald-900/50 flex items-center justify-between px-2 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors"></div>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase z-10">Spread</span>
                    <span className="text-sm text-white font-black tracking-wider z-10 flex items-center gap-2">
                        {currentPrice.toFixed(2)}
                        <MoveVertical size={10} className="text-emerald-500 animate-pulse" />
                    </span>
                    <span className="text-[9px] text-zinc-500 font-bold z-10">{(depthData.spread).toFixed(4)}</span>
                </div>

                {/* BIDS (BUY SIDE) - Bottom Half */}
                <div className="flex-1 flex flex-col justify-start pt-1 gap-[1px]">
                    {depthData.bids.map((b, i) => (
                        <div key={`bid-${i}`} className={`relative flex items-center h-4 px-2 hover:bg-emerald-900/20 transition-colors ${b.isWall ? 'animate-pulse bg-emerald-900/10' : ''}`}>
                             {/* Cumulative Depth Bar (Ghost) */}
                             <div className="absolute left-0 top-0 bottom-0 bg-emerald-500/10 transition-all duration-500" style={{ width: `${(b.cumulative / depthData.maxVol) * 100}%` }} />
                             {/* Volume Bar (Solid) */}
                             <div className="absolute left-0 top-0.5 bottom-0.5 bg-emerald-600/40 rounded-r-sm transition-all duration-300" style={{ width: `${Math.min(100, (b.size / 10) * 100)}%` }} />
                            
                            <span className={`flex-1 text-left z-10 tabular-nums ${b.isWall ? 'text-emerald-300 font-black' : 'text-zinc-500'}`}>{b.size.toFixed(3)}</span>
                            <span className="w-16 text-emerald-500 font-bold z-10 text-right tabular-nums tracking-tighter">{b.price.toFixed(2)}</span>
                            {b.isWall && <span className="absolute left-1/2 -translate-x-1/2 text-[8px] text-emerald-500/50 font-black tracking-widest z-0">WALL</span>}
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

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
            <div className="grid grid-cols-2 gap-2 text-[10px] uppercase">
                <div className="bg-emerald-900/10 p-2 border border-emerald-900/30 rounded">
                    <div className="text-zinc-500 text-[10px] flex justify-between"><span>Net_Flow</span><span className={stats.netFlow > 0 ? 'text-emerald-400' : 'text-red-400'}>{stats.netFlow > 0 ? '+' : ''}${(stats.netFlow/1000).toFixed(0)}K</span></div>
                    <div className="mt-1 h-1.5 bg-zinc-900 rounded-full flex overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${(stats.buyVol / (stats.buyVol + stats.sellVol || 1)) * 100}%` }} /><div className="h-full bg-red-600" style={{ width: `${(stats.sellVol / (stats.buyVol + stats.sellVol || 1)) * 100}%` }} /></div>
                </div>
                <div className="bg-emerald-900/10 p-2 border border-emerald-900/30 rounded">
                    <div className="text-zinc-500 text-[10px] flex justify-between"><span>Whale_VWAP</span><span className={vwapGap > 0 ? 'text-emerald-400' : 'text-red-400'}>{stats.vwap.toFixed(2)}</span></div>
                     <div className="text-[10px] text-right mt-0.5">Gap: <span className={vwapGap > 0 ? 'text-emerald-500' : 'text-red-500'}>{vwapGap > 0 ? '+' : ''}{vwapGap.toFixed(2)}%</span></div>
                </div>
            </div>
            <div className="flex-1 overflow-auto space-y-1 pr-1">
                {activeTrades.slice(0, 8).map((t, i) => (
                    <div key={i} className={`flex justify-between items-center p-2 border-l-2 text-[10px] ${t.side === 'BUY' ? 'border-emerald-500 bg-emerald-500/5' : 'border-red-500 bg-red-500/5'}`}>
                        <div className="flex flex-col"><span className="font-bold text-white flex items-center gap-1">{t.isMaker ? <div className="w-1.5 h-1.5 rounded-full bg-zinc-500"/> : <Zap size={10} className={t.side === 'BUY' ? 'text-emerald-400' : 'text-red-400'}/>} ${ (t.value/1000).toFixed(0) }K</span></div>
                        <div className="flex flex-col text-right"><span className={t.side === 'BUY' ? 'text-emerald-400' : 'text-red-400'}>{t.price.toFixed(2)}</span><span className="text-[9px] text-zinc-600">{new Date(t.time).toLocaleTimeString([], {hour12:false, minute:'2-digit', second:'2-digit'})}</span></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* --- SPECTACULAR RISK SHIELD V10.4 (AEGIS RADAR) --- */
const RiskRadar = ({ volatility }) => {
    const canvasRef = useRef(null);
    
    // Niveaux d'alerte DEFCON
    const defcon = useMemo(() => {
        if (volatility > 4) return { level: 1, color: '#ef4444', label: 'CRITICAL' };
        if (volatility > 2.5) return { level: 2, color: '#f97316', label: 'HIGH' };
        if (volatility > 1.5) return { level: 3, color: '#eab308', label: 'ELEVATED' };
        return { level: 4, color: '#10b981', label: 'NOMINAL' };
    }, [volatility]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !canvas.parentElement) return;
        const ctx = canvas.getContext('2d');
        
        const resizeCanvas = () => {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
        };
        resizeCanvas();
        
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2 + 10; // Un peu plus bas pour laisser de la place au header DEFCON
        const maxRadius = Math.min(w, h) * 0.35;

        // Metrics simulés basés sur la volatilité
        // On normalise tout entre 0 et 100
        const metrics = [
            { label: 'VOL', val: Math.min(100, volatility * 20) },
            { label: 'VAR', val: Math.min(100, volatility * 15 + 10) },
            { label: 'LEV', val: 45 + Math.sin(Date.now() * 0.001) * 5 }, // Leverage stable mais vivant
            { label: 'DD', val: Math.max(0, volatility * 10 - 5) }, // Drawdown
            { label: 'COR', val: Math.min(100, volatility * 25) }, // Correlation risk
            { label: 'LIQ', val: Math.max(10, 100 - (volatility * 15)) } // Liquidity risk (inverse)
        ];

        const numPoints = metrics.length;
        const angleStep = (Math.PI * 2) / numPoints;

        let frame = 0;
        let animId;

        const draw = () => {
            frame++;
            ctx.clearRect(0, 0, w, h);

            // 1. DEFCON HEADER
            ctx.font = 'bold 12px monospace';
            ctx.fillStyle = defcon.color;
            ctx.textAlign = 'center';
            ctx.fillText(`DEFCON ${defcon.level} // ${defcon.label}`, cx, 20);
            
            // Ligne de séparation qui pulse
            ctx.beginPath();
            ctx.moveTo(20, 30);
            ctx.lineTo(w - 20, 30);
            ctx.strokeStyle = defcon.color;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.5 + Math.sin(frame * 0.1) * 0.3;
            ctx.stroke();
            ctx.globalAlpha = 1;

            // 2. RADAR GRID (Les toiles d'araignée)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            for (let r = 0.2; r <= 1; r += 0.2) {
                ctx.beginPath();
                for (let i = 0; i <= numPoints; i++) {
                    const angle = i * angleStep - Math.PI / 2;
                    const x = cx + Math.cos(angle) * (maxRadius * r);
                    const y = cy + Math.sin(angle) * (maxRadius * r);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }

            // Axes
            ctx.beginPath();
            for (let i = 0; i < numPoints; i++) {
                const angle = i * angleStep - Math.PI / 2;
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx + Math.cos(angle) * maxRadius, cy + Math.sin(angle) * maxRadius);
            }
            ctx.stroke();

            // 3. THE DATA SHAPE (Le polygone de risque)
            ctx.beginPath();
            const shapePoints = [];
            
            metrics.forEach((m, i) => {
                const angle = i * angleStep - Math.PI / 2;
                // Petit effet de respiration sur les valeurs
                const noise = Math.sin(frame * 0.05 + i) * 2; 
                const r = maxRadius * (m.val / 100) + noise;
                const x = cx + Math.cos(angle) * r;
                const y = cy + Math.sin(angle) * r;
                shapePoints.push({x, y, r, angle}); // Store for labels
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.closePath();

            // Style dynamique selon DEFCON
            ctx.fillStyle = `${defcon.color}33`; // 20% opacity hex
            ctx.fill();
            ctx.strokeStyle = defcon.color;
            ctx.lineWidth = 2;
            ctx.stroke();

            // 4. SCAN LINE EFFECT (Radar sweep)
            const scanAngle = (frame * 0.02) % (Math.PI * 2);
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(scanAngle) * maxRadius * 1.2, cy + Math.sin(scanAngle) * maxRadius * 1.2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            // Dégradé pour la traînée du radar
            const grad = ctx.createLinearGradient(cx, cy, cx + Math.cos(scanAngle)*maxRadius, cy + Math.sin(scanAngle)*maxRadius);
            grad.addColorStop(0, 'rgba(255,255,255,0)');
            grad.addColorStop(1, 'rgba(255,255,255,0.8)');
            ctx.strokeStyle = grad;
            ctx.stroke();

            // 5. LABELS & VALUES
            ctx.font = '9px monospace';
            shapePoints.forEach((p, i) => {
                // Position label a bit outside
                const labelR = maxRadius + 15;
                const lx = cx + Math.cos(p.angle) * labelR;
                const ly = cy + Math.sin(p.angle) * labelR;
                
                ctx.fillStyle = '#6b7280'; // Zinc-500
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(metrics[i].label, lx, ly - 5);
                
                // Value highlight
                ctx.fillStyle = defcon.color;
                ctx.fillText(metrics[i].val.toFixed(0), lx, ly + 5);

                // Petit point sur le vertex
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI*2);
                ctx.fill();
            });

            // 6. QUANTITATIVE METRICS (Bottom corner)
            // Simulated advanced metrics
            const sharpe = (2.5 - (volatility * 0.3)).toFixed(2);
            const var95 = (volatility * 1.645).toFixed(2); // Simplified VaR calculation

            ctx.font = '9px monospace';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#6b7280';
            ctx.fillText(`Sharpe: ${sharpe}`, 10, h - 10);
            
            ctx.textAlign = 'right';
            ctx.fillStyle = defcon.color;
            ctx.fillText(`VaR(95%): -${var95}%`, w - 10, h - 10);

            animId = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(animId);
    }, [volatility, defcon]);

    return (
        <div className="w-full h-full relative">
            <canvas ref={canvasRef} className="w-full h-full block" />
            {/* Petit overlay flash en cas de critique */}
            {defcon.level === 1 && (
                <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none"></div>
            )}
        </div>
    );
};

/* --- KINETIC REACTOR V10.5 --- */
const KineticCore = ({ volatility, trades }) => {
    const mountRef = useRef(null);
    
    useEffect(() => {
        if (!mountRef.current) return;
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        // SCENE SETUP
        const scene = new THREE.Scene();
        // Légère brume pour la profondeur
        scene.fog = new THREE.FogExp2(0x000000, 0.05);

        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        camera.position.z = 12;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        // Important pour les particules brillantes
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);

        // PARTICLE SYSTEM
        // On crée un pool de particules
        const particleCount = 1200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const speeds = new Float32Array(particleCount); // Vitesse orbitale
        const radii = new Float32Array(particleCount);  // Distance au centre
        const angles = new Float32Array(particleCount); // Angle actuel
        
        const colorBuy = new THREE.Color(0x10b981); // Emerald
        const colorSell = new THREE.Color(0xef4444); // Red
        const colorNeutral = new THREE.Color(0x059669); // Dark Emerald

        for(let i = 0; i < particleCount; i++) {
            // Distribution aléatoire en anneau/sphère
            const r = 2 + Math.random() * 5;
            const angle = Math.random() * Math.PI * 2;
            const phi = (Math.random() - 0.5) * Math.PI; // Hauteur orbitale

            // Position initiale (Cartésienne)
            positions[i*3] = r * Math.cos(angle) * Math.cos(phi);
            positions[i*3+1] = r * Math.sin(phi); // Hauteur z
            positions[i*3+2] = r * Math.sin(angle) * Math.cos(phi);

            // Stockage polaire pour l'animation
            radii[i] = r;
            angles[i] = angle;
            speeds[i] = 0.02 + Math.random() * 0.05;

            // Couleurs par défaut (Neutral flow)
            colorNeutral.toArray(colors, i * 3);
            
            // Taille variable
            sizes[i] = Math.random() * 0.15;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Shader Material pour des points brillants
        // On utilise PointsMaterial standard mais avec vertexColors
        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
            opacity: 0.8
        });

        const particleSystem = new THREE.Points(geometry, material);
        scene.add(particleSystem);

        // CORE SPHERE (Le noyau d'énergie)
        const coreGeo = new THREE.IcosahedronGeometry(1.5, 2);
        const coreMat = new THREE.MeshBasicMaterial({ 
            color: 0x10b981, 
            wireframe: true, 
            transparent: true, 
            opacity: 0.3 
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        scene.add(core);

        // ANIMATION LOOP
        let time = 0;
        let animationId;
        
        // Variables pour gérer l'injection de trades
        let lastTradeIndex = 0;

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            time += 0.01;

            // 1. REACTION TO VOLATILITY (Thermal Dynamics)
            const heat = Math.max(1, volatility); // Facteur d'agitation
            core.scale.setScalar(1 + Math.sin(time * 5) * 0.05 * heat);
            core.rotation.y += 0.01 * heat;
            core.rotation.z += 0.005 * heat;
            
            // Couleur du noyau change si haute volatilité
            if (heat > 3) core.material.color.setHex(0xffaa00);
            else core.material.color.setHex(0x10b981);

            // 2. PARTICLE PHYSICS
            const positions = particleSystem.geometry.attributes.position.array;
            const colors = particleSystem.geometry.attributes.color.array;
            const sizes = particleSystem.geometry.attributes.size.array;

            // Injection des nouveaux trades (Change la couleur des particules)
            // On prend les derniers trades et on "colorie" des particules au hasard
            if (trades.length > lastTradeIndex) {
                const newTrades = trades.slice(lastTradeIndex);
                newTrades.forEach(t => {
                    // On affecte X particules par trade (plus gros trade = plus de particules)
                    const impact = Math.min(50, Math.floor(t.size * 5)); 
                    for(let k=0; k<impact; k++) {
                        const pIdx = Math.floor(Math.random() * particleCount);
                        if (t.side === 'BUY') {
                            colorBuy.toArray(colors, pIdx * 3);
                            sizes[pIdx] = 0.3; // Flash size
                        } else {
                            colorSell.toArray(colors, pIdx * 3);
                            sizes[pIdx] = 0.3;
                        }
                    }
                });
                lastTradeIndex = trades.length;
                particleSystem.geometry.attributes.color.needsUpdate = true;
                particleSystem.geometry.attributes.size.needsUpdate = true;
            }

            // Mouvement orbital
            for(let i = 0; i < particleCount; i++) {
                // Decay taille (retour à la normale)
                if (sizes[i] > 0.1) sizes[i] *= 0.98;
                
                // Decay couleur (retour vers neutre très lent)
                // (Complexe à faire performant frame par frame en JS pur, on simplifie)
                
                // Mouvement
                angles[i] += speeds[i] * heat; // Plus vite si volatil
                
                // Turbulence (Noise)
                const turbulence = Math.sin(time * 2 + i) * 0.05 * heat;
                const r = radii[i] + turbulence;

                const phi = (i % 3 === 0) ? Math.sin(time + i) : 0; // Quelques particules oscillent en Z

                positions[i*3] = r * Math.cos(angles[i]);
                positions[i*3+1] = (radii[i] * 0.3) * Math.sin(angles[i]) + phi; // Disque aplati
                positions[i*3+2] = r * Math.sin(angles[i]);
            }
            
            particleSystem.geometry.attributes.position.needsUpdate = true;
            particleSystem.geometry.attributes.size.needsUpdate = true;

            // Rotation globale du système
            particleSystem.rotation.z = time * 0.1;
            particleSystem.rotation.x = Math.sin(time * 0.2) * 0.2;

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
            geometry.dispose();
            material.dispose();
            coreGeo.dispose();
            coreMat.dispose();
        };
    }, [volatility, trades]);

    return (
        <div className="w-full h-full relative overflow-hidden bg-black/80">
            <div ref={mountRef} className="w-full h-full" />
            
            {/* HUD OVERLAY */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
                <div className="flex items-center gap-2">
                    <span className="text-[9px] text-zinc-500 uppercase">Reactor_Load</span>
                    <div className="w-16 h-1 bg-zinc-900 rounded overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-300" style={{width: `${Math.min(100, volatility * 20)}%`}} />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] text-zinc-500 uppercase">Entropy</span>
                    <span className="text-[9px] text-emerald-400 font-mono">{(volatility * 1.452).toFixed(3)} J/s</span>
                </div>
            </div>

            {/* Warning Label if High Volatility */}
            {volatility > 3 && (
                <div className="absolute bottom-2 right-2 flex items-center gap-1 text-red-500 animate-pulse">
                    <AlertTriangle size={10} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Core_Instability</span>
                </div>
            )}
        </div>
    );
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
    "LEONCE OS V10.5",
    "KINETIC REACTOR: IGNITED",
    "ENTROPY SENSORS: ONLINE"
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
        case 'help': 
            setShowHelp(true); 
            newHist.push("AVAILABLE: SCAN, PURGE, FOCUS, MENU, PING, RISK, SYS, WHOAMI");
            break;
        case 'scan': Object.entries(prices).forEach(([s, d]) => newHist.push(` > ${s}: ${d.price.toFixed(2)}`)); break;
        case 'purge': setTrades([]); setHistory(["PURGED"]); break;
        case 'focus': if (ASSETS_CONFIG[arg?.toUpperCase()]) setActiveSymbol(arg.toUpperCase()); break;
        case 'clear': setHistory([]); setInput(''); return;
        
        /* COMMANDES */
        case 'menu': 
            newHist.push("> REDIRECTING TO MENU HUB...");
            setTimeout(() => window.location.href = '/menu/index.html', 1000); 
            break;
        case 'ping':
            newHist.push(`> PING: ${Math.floor(Math.random() * 20) + 12}ms [STABLE]`);
            newHist.push(`> SERVER: ASIA-NORTHEAST-1`);
            break;
        case 'risk':
            const riskLevel = volatility > 3 ? "CRITICAL" : (volatility > 1.5 ? "ELEVATED" : "NOMINAL");
            newHist.push(`> RISK LEVEL: ${riskLevel}`);
            newHist.push(`> VOLATILITY INDEX: ${(volatility * 10).toFixed(2)}`);
            break;
        case 'sys':
            newHist.push(`> CPU LOAD: ${Math.floor(Math.random() * 15) + 10}%`);
            newHist.push(`> MEMORY: 14.2GB / 64GB`);
            newHist.push(`> UPTIME: 42h 12m 04s`);
            break;
        case 'whoami':
            newHist.push(`> USER: OPERATOR_LEONCE`);
            newHist.push(`> ACCESS: LEVEL 5 (ROOT)`);
            break;

        default: newHist.push(`ERR: ???`);
      }
      setHistory(newHist.slice(-8)); setInput(''); 
    }
  };

  if (!booted) return <div className="h-screen bg-black flex flex-col items-center justify-center font-mono text-emerald-500 tracking-[0.5em] animate-pulse text-sm md:text-lg">INITIALIZING_V10.5</div>;

  return (
    <div className="h-screen w-full bg-black font-mono text-emerald-500 overflow-hidden flex flex-col selection:bg-emerald-500/20">
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden h-full w-full opacity-20"><div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%),linear-gradient(90deg,rgba(0,255,0,0.01),rgba(0,0,0,0.01),rgba(0,255,0,0.01))] bg-[length:100%_4px,3px_100%]" /></div>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* HEADER */}
      <div className="h-12 md:h-12 border-b bg-gray-950 border-emerald-900/40 flex justify-between items-center px-4 shrink-0 z-40 relative">
        <div className="flex items-center gap-4">
          <span className="font-black text-sm tracking-[0.2em] md:tracking-[0.4em] text-emerald-400 uppercase">Leonce_OS</span>
          <div className="flex gap-1 items-center">
             <div className="hidden sm:block px-3 py-1 rounded text-[10px] border border-emerald-500/30 text-emerald-500 font-black uppercase bg-emerald-900/10">{marketRegime}</div>
             <div className="relative">
                 <button onClick={() => setIsAssetSelectorOpen(!isAssetSelectorOpen)} className="px-3 py-1 rounded text-[10px] border border-emerald-500/30 text-white font-black uppercase bg-emerald-900/20 hover:bg-emerald-800/40 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500/50">
                    {activeSymbol} <ChevronDown size={10} className={`transition-transform duration-300 ${isAssetSelectorOpen ? 'rotate-180' : ''}`} />
                 </button>
                 {isAssetSelectorOpen && (
                     <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsAssetSelectorOpen(false)}></div>
                        <div className="absolute top-full left-0 mt-1 w-28 bg-gray-950 border border-emerald-500/30 shadow-2xl z-50 flex flex-col max-h-60 overflow-y-auto no-scrollbar rounded animate-in fade-in zoom-in-95 duration-100">
                            {Object.keys(ASSETS_CONFIG).map(symbol => (
                                <button key={symbol} onClick={() => { setActiveSymbol(symbol); setIsAssetSelectorOpen(false); }} className={`text-left px-3 py-2 text-[10px] hover:bg-emerald-900/30 transition-colors uppercase font-mono ${activeSymbol === symbol ? 'text-emerald-400 font-bold bg-emerald-900/10' : 'text-zinc-400'}`}>{symbol}</button>
                            ))}
                        </div>
                     </>
                 )}
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[10px] font-bold">
           <button onClick={() => setShowHelp(true)} className="flex items-center gap-1 text-emerald-400 hover:text-white transition-colors border border-emerald-500/20 px-2 py-1 rounded bg-emerald-900/20"><HelpCircle size={14} /> <span className="hidden md:inline">MANUAL</span></button>
           <div className={`flex items-center gap-2 ${connectionStatus === 'ONLINE' ? 'text-emerald-500' : 'text-red-500'}`}><Wifi size={14}/> <span className="hidden md:inline">{connectionStatus}</span></div>
           <div className="hidden md:flex items-center gap-2 border-l border-emerald-900/40 pl-6 text-zinc-600 uppercase tracking-widest"><Lock size={14}/> Secure</div>
           <button className="md:hidden text-emerald-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><Menu size={18} /></button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:grid md:grid-cols-3 md:grid-rows-3 gap-2 p-2 md:gap-px md:bg-emerald-900/10 md:p-px overflow-y-auto md:overflow-hidden scroll-smooth">
        <Window title="Exec_Shell" icon={Terminal} className="order-1">
            <div className="flex flex-col h-full justify-between">
                <div className="flex-1 opacity-80 min-h-[100px]">{history.map((l, i) => <div key={i} className="break-all">{l}</div>)}<div ref={bottomRef}/></div>
                <div className="flex border-t border-emerald-900/20 pt-1 mt-1 font-bold"><span className="mr-1 text-emerald-700">$</span><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleCommand} className="bg-transparent outline-none flex-1 uppercase text-white w-full" autoFocus={false} placeholder="CMD..." /></div>
            </div>
        </Window>
        
        <Window title="Monte_Carlo_Engine" icon={BarChart3} className="order-2"><NeuralForecast history={prices[activeSymbol]?.history || []} volatility={volatility} regime={marketRegime} /></Window>
        <Window title="Liquid_Depth" icon={Layers} className="order-3"><OrderDepth currentPrice={prices[activeSymbol]?.price || 0} volatility={volatility} /></Window>

        {/* SYSTEMIC TUNNEL (VORTEX) 3D VISUALIZER */}
        <Window title="Liquidity_Tunnel_3D" icon={Grid} className="order-4">
            <SystemicTunnel3D prices={prices} volatility={volatility} />
        </Window>

        <Window title="Kinetic_Reactor" icon={Cpu} className="order-5"><KineticCore volatility={volatility} trades={trades}/></Window>
        <Window title="Tape_Signals" icon={Activity} className="order-6">
            <div className="space-y-0.5">
                {trades.filter(t => t.symbol === activeSymbol).slice(0, 10).map((t, i) => (
                    <div key={i} className={`flex justify-between items-center p-2 border-l-2 text-[10px] ${t.side === 'BUY' ? 'border-emerald-500 bg-emerald-500/5' : 'border-red-500 bg-red-500/5'}`}>
                        <div className="flex flex-col"><span className="font-bold text-white flex items-center gap-1">{t.isMaker ? <div className="w-1.5 h-1.5 rounded-full bg-zinc-500"/> : <Zap size={10} className={t.side === 'BUY' ? 'text-emerald-400' : 'text-red-400'}/>} ${ (t.value/1000).toFixed(0) }K</span></div>
                        <div className="flex flex-col text-right"><span className={t.side === 'BUY' ? 'text-emerald-400' : 'text-red-400'}>{t.price.toFixed(2)}</span><span className="text-[9px] text-zinc-600">{new Date(t.time).toLocaleTimeString([], {hour12:false, minute:'2-digit', second:'2-digit'})}</span></div>
                    </div>
                ))}
            </div>
        </Window>

        <Window title="Whale_Watch" icon={Anchor} className="order-7"><WhaleWatch trades={trades} activeSymbol={activeSymbol} currentPrice={prices[activeSymbol]?.price} /></Window>

        <Window title="Aegis_Radar" icon={Shield} className="order-8"><RiskRadar volatility={volatility} /></Window>

        <Window title="Hyper-Cortex" icon={HardDrive} className="order-9"><NodeHologram volatility={volatility} /></Window>
      </div>

      <div className="h-8 md:h-8 bg-black border-t border-emerald-900/40 flex items-center overflow-hidden shrink-0">
        <div className="animate-ticker flex whitespace-nowrap">
            {Object.entries(prices).map(([s, d]) => (
                <span key={s} onClick={() => setActiveSymbol(s)} className={`mx-4 md:mx-6 text-[12px] md:text-[11px] cursor-pointer font-black uppercase transition-all flex items-center gap-2 ${activeSymbol === s ? 'text-white underline decoration-emerald-500' : 'text-emerald-900 hover:text-emerald-600'}`}>
                    {s} <span className={d.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}>{d.price?.toFixed(2)}</span>
                </span>
            ))}
        </div>
      </div>
      <style>{`@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .animate-ticker { animation: ticker 40s linear infinite; } .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } input { caret-color: #10b981; }`}</style>
    </div>
  );
}
