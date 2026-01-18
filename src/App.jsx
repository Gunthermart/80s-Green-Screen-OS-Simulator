import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Terminal, Shield, X, Activity, BarChart3, 
  Radar, Globe, Radio, Share2, 
  Bell, CheckCircle, AlertOctagon, Layers,
  Volume2, VolumeX, Move
} from 'lucide-react';

/* =========================================
   0. CORE STYLES & SHADERS
   ========================================= */
const GlobalStyles = () => (
  <style>{`
    :root {
      --color-primary: #10b981;
      --color-alert: #ef4444;
      --color-ghost: #6b7280;
    }

    @keyframes glitch {
      0% { text-shadow: 2px 0 rgba(255,0,0,0.5), -2px 0 rgba(0,255,0,0.5); transform: skew(0deg); }
      20% { text-shadow: -2px 0 rgba(255,0,0,0.5), 2px 0 rgba(0,255,0,0.5); transform: skew(10deg); }
      40% { text-shadow: 2px 0 rgba(255,0,0,0.5), -2px 0 rgba(0,255,0,0.5); transform: skew(-5deg); }
      60% { text-shadow: -2px 0 rgba(255,0,0,0.5), 2px 0 rgba(0,255,0,0.5); transform: skew(0deg); }
      80% { text-shadow: 2px 0 rgba(255,0,0,0.5), -2px 0 rgba(0,255,0,0.5); transform: skew(5deg); }
      100% { text-shadow: -2px 0 rgba(255,0,0,0.5), 2px 0 rgba(0,255,0,0.5); transform: skew(0deg); }
    }
    .glitch-text { animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite; }
    
    @keyframes scanline {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100%); }
    }
    .scanline {
      width: 100%; height: 100px; z-index: 10;
      background: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(16, 185, 129, 0.1) 50%, rgba(0,0,0,0) 100%);
      opacity: 0.1; position: absolute; bottom: 100%;
      animation: scanline 8s linear infinite; pointer-events: none;
    }

    @keyframes shake {
      0% { transform: translate(1px, 1px) rotate(0deg); }
      10% { transform: translate(-1px, -2px) rotate(-1deg); }
      20% { transform: translate(-3px, 0px) rotate(1deg); }
      30% { transform: translate(3px, 2px) rotate(0deg); }
      40% { transform: translate(1px, -1px) rotate(1deg); }
      50% { transform: translate(-1px, 2px) rotate(-1deg); }
      60% { transform: translate(-3px, 1px) rotate(0deg); }
      70% { transform: translate(3px, 1px) rotate(-1deg); }
      80% { transform: translate(-1px, -1px) rotate(1deg); }
      90% { transform: translate(1px, 2px) rotate(0deg); }
      100% { transform: translate(1px, -2px) rotate(-1deg); }
    }
    .shake-screen { animation: shake 0.5s infinite; }
    
    @keyframes ticker { 
      0% { transform: translate(100%, -50%); } 
      100% { transform: translate(-100%, -50%); } 
    }
    .animate-ticker { 
      animation: ticker 60s linear infinite; 
      will-change: transform;
    }
    .animate-ticker:hover { animation-play-state: paused; }

    .ghost-mode { filter: grayscale(100%) brightness(0.2); }
    
    @media (pointer: fine) { body { cursor: none; } }
    @media (pointer: coarse) { body { cursor: auto; } }
    
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

/* =========================================
   1. SYSTEM HOOKS (AUDIO, LOGIC, RSS)
   ========================================= */

const useSoundSystem = (muted) => {
  const audioCtxRef = useRef(null);

  const playTone = useCallback((freq, type, duration, vol = 0.1) => {
    if (muted) return;
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, [muted]);

  const sfx = useMemo(() => ({
    boot: () => {
      if(muted) return;
      playTone(100, 'square', 0.1);
      setTimeout(() => playTone(200, 'square', 0.1), 100);
      setTimeout(() => playTone(400, 'square', 0.2), 200);
    },
    keyPress: () => playTone(800 + Math.random()*200, 'sine', 0.05, 0.02),
    alert: () => {
      if(muted) return;
      playTone(400, 'sawtooth', 0.5, 0.1);
      setTimeout(() => playTone(300, 'sawtooth', 0.5, 0.1), 400);
    },
    success: () => {
      playTone(600, 'sine', 0.1);
      setTimeout(() => playTone(1200, 'sine', 0.3), 100);
    },
    error: () => playTone(150, 'sawtooth', 0.4, 0.1),
    hover: () => playTone(2000, 'sine', 0.01, 0.005),
    news: () => playTone(1200, 'square', 0.05, 0.05),
    drag: () => playTone(150, 'triangle', 0.1, 0.05)
  }), [playTone, muted]);

  return sfx;
};

const useNewsFeed = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFeed = async () => {
        try {
            const res = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss');
            const data = await res.json();
            
            if (data.status === 'ok') {
                const items = data.items.map(item => ({
                    title: item.title,
                    link: item.link,
                    pubDate: item.pubDate,
                    source: 'COINTELEGRAPH'
                }));
                setNews(items);
                setLoading(false);
            }
        } catch (e) {
            setNews([
                { title: "CONNECTION ERROR: USING CACHED DATA", source: "SYSTEM", pubDate: new Date().toISOString() },
                { title: "Whale Alert: 10,000 BTC moved to Binance", source: "ON-CHAIN", pubDate: new Date().toISOString() },
                { title: "SEC Delaying ETF Decision Again", source: "REUTERS", pubDate: new Date().toISOString() }
            ]);
        }
    };

    useEffect(() => {
        fetchFeed();
        const interval = setInterval(fetchFeed, 60000);
        return () => clearInterval(interval);
    }, []);

    return { news, loading };
};

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
};

/* =========================================
   2. VISUAL LAYERS
   ========================================= */

const CRTOverlay = () => (
  <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden rounded-lg">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.6)_100%)]" />
    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20" />
  </div>
);

const TacticalCursor = ({ isAlert }) => {
  const isMobile = useIsMobile();
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    if (isMobile) return;
    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    const down = () => setClicked(true);
    const up = () => setClicked(false);
    const hoverCheck = (e) => {
      const t = e.target;
      setHovered(t.tagName === 'BUTTON' || t.tagName === 'INPUT' || t.tagName === 'A' || t.closest('button') || t.classList.contains('cursor-move'));
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    window.addEventListener('mouseover', hoverCheck);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('mouseover', hoverCheck);
    };
  }, [isMobile]);

  if (isMobile) return null;

  const color = isAlert ? 'border-red-500' : 'border-emerald-500';
  const size = clicked ? 'scale-75' : (hovered ? 'scale-150' : 'scale-100');

  return (
    <div className="fixed z-[10000] pointer-events-none transition-transform duration-75 ease-out flex items-center justify-center" 
         style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}>
      <div className={`w-1 h-1 rounded-full ${isAlert ? 'bg-red-500' : 'bg-emerald-500'}`} />
      <div className={`absolute w-8 h-8 border border-dashed rounded-full animate-[spin_4s_linear_infinite] opacity-50 ${color} ${size} transition-all duration-300`} />
      <div className={`absolute w-12 h-12 border border-t-0 border-b-0 opacity-30 ${color} ${hovered ? 'scale-100 rotate-0' : 'scale-0 rotate-45'} transition-all duration-300`} />
    </div>
  );
};

/* =========================================
   3. DATA VISUALIZATION
   ========================================= */

const SpectacularGlobe = React.memo(({ isAlert }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const cvs = canvasRef.current;
        const ctx = cvs?.getContext('2d');
        if (!ctx) return;
        
        let w, h, fid, rot = 0;
        const resize = () => { 
            w = cvs.width = cvs.parentElement.clientWidth; 
            h = cvs.height = cvs.parentElement.clientHeight; 
        };
        window.addEventListener('resize', resize); resize();
        
        const dots = Array.from({length: 800}, () => ({ 
            theta: Math.random()*2*Math.PI, 
            phi: Math.acos(Math.random()*2-1), 
            size: Math.random()*2 + 0.5 
        }));

        const draw = () => {
            ctx.clearRect(0, 0, w, h);
            rot += isAlert ? 0.005 : 0.0008;
            
            const cx = w/2, cy = h/2;
            const color = isAlert ? '239,68,68' : '16,185,129';
            const R = Math.min(w, h) * 0.75; 

            const grad = ctx.createRadialGradient(cx, cy, R*0.6, cx, cy, R*1.2);
            grad.addColorStop(0, `rgba(${color}, 0.2)`);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(0,0,w,h);

            ctx.strokeStyle = `rgba(${color}, 0.1)`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(cx, cy, R*1.2, R*0.4, rot*0.2, 0, Math.PI*2);
            ctx.stroke();
            
            ctx.strokeStyle = `rgba(${color}, 0.05)`;
            ctx.beginPath();
            ctx.ellipse(cx, cy, R*1.4, R*1.4, 0, 0, Math.PI*2);
            ctx.stroke();

            dots.forEach(d => {
                const x = R * Math.sin(d.phi) * Math.cos(d.theta);
                const y = R * Math.sin(d.phi) * Math.sin(d.theta);
                const z = R * Math.cos(d.phi);
                
                const rx = x*Math.cos(rot) - z*Math.sin(rot);
                const rz = z*Math.cos(rot) + x*Math.sin(rot);
                
                const perspective = 1000;
                const scale = perspective/(perspective+rz);
                const projX = rx*scale + cx;
                const projY = y*scale + cy;
                const alpha = ((rz + R) / (2 * R));
                
                if (scale > 0) {
                    if (Math.random() > 0.99) {
                         ctx.beginPath();
                         ctx.moveTo(cx, cy);
                         ctx.lineTo(projX, projY);
                         ctx.strokeStyle = `rgba(${color}, 0.05)`;
                         ctx.stroke();
                    }
                    ctx.fillStyle = `rgba(${color}, ${Math.max(0.1, alpha)})`;
                    ctx.beginPath(); 
                    ctx.arc(projX, projY, d.size*scale, 0, Math.PI*2); 
                    ctx.fill();
                }
            });
            fid = requestAnimationFrame(draw);
        };
        draw();
        return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(fid); };
    }, [isAlert]);
    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-60 transition-opacity duration-1000" />;
});

const ForensicsViewer = React.memo(({ isAlert }) => {
    const canvasRef = useRef(null);
    
    const nodes = useMemo(() => {
        const center = { id: 'TARGET', type: 'WALLET', x: 0.5, y: 0.5, r: 8 };
        const cluster = [center];
        for(let i=0; i<8; i++) {
            cluster.push({
                id: `0x${Math.floor(Math.random()*16777215).toString(16)}`,
                type: Math.random() > 0.7 ? 'EXCHANGE' : 'WALLET',
                x: 0.5 + (Math.random()-0.5)*0.6,
                y: 0.5 + (Math.random()-0.5)*0.6,
                r: Math.random() > 0.7 ? 6 : 3
            });
        }
        return cluster;
    }, []);

    const links = useMemo(() => {
        return nodes.slice(1).map(n => ({ source: 0, target: nodes.indexOf(n) }));
    }, [nodes]);

    useEffect(() => {
        const cvs = canvasRef.current;
        const ctx = cvs?.getContext('2d');
        if (!ctx) return;
        let w, h, fid, time = 0;
        const resize = () => { w = cvs.width = cvs.parentElement.clientWidth; h = cvs.height = cvs.parentElement.clientHeight; };
        window.addEventListener('resize', resize); resize();

        const draw = () => {
            ctx.clearRect(0,0,w,h); 
            time += isAlert ? 0.1 : 0.02;
            const primary = isAlert ? '239, 68, 68' : '16, 185, 129';
            
            links.forEach((link, i) => {
                const s = nodes[link.source];
                const t = nodes[link.target];
                const sx = s.x * w; const sy = s.y * h;
                const tx = t.x * w; const ty = t.y * h;

                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(tx, ty);
                ctx.strokeStyle = `rgba(${primary}, 0.2)`;
                ctx.stroke();

                const packetPos = (time + i*0.5) % 1;
                const px = sx + (tx - sx) * packetPos;
                const py = sy + (ty - sy) * packetPos;
                ctx.fillStyle = '#fff';
                ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI*2); ctx.fill();
            });

            nodes.forEach(n => {
                const nx = n.x * w;
                const ny = n.y * h;
                
                if (n.id === 'TARGET') {
                    const pulse = Math.sin(time*2) * 5;
                    ctx.beginPath();
                    ctx.arc(nx, ny, n.r + 5 + pulse, 0, Math.PI*2);
                    ctx.strokeStyle = `rgba(${primary}, 0.3)`;
                    ctx.stroke();
                }

                ctx.beginPath();
                ctx.arc(nx, ny, n.r, 0, Math.PI*2);
                ctx.fillStyle = n.type === 'EXCHANGE' ? '#fbbf24' : `rgb(${primary})`; 
                ctx.fill();
                
                ctx.fillStyle = `rgba(${primary}, 0.8)`;
                ctx.font = '9px monospace';
                ctx.fillText(n.id.substring(0, 6), nx + 10, ny + 3);
            });
            fid = requestAnimationFrame(draw);
        };
        draw();
        return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(fid); };
    }, [isAlert, nodes, links]);

    return (
        <div className="w-full h-full relative group bg-black/50">
             <div className="absolute top-2 left-2 text-[10px] font-bold z-10 text-emerald-500 group-hover:text-white transition-colors flex items-center gap-2">
                 <Share2 size={12}/> NEXUS_FORENSICS
            </div>
             <div className="absolute bottom-2 right-2 text-[8px] font-mono text-gray-500 text-right">
                CLUSTERS: {nodes.length}<br/>
                FLOW: TRACKING
            </div>
            <canvas ref={canvasRef} className="w-full h-full" />
        </div>
    );
});

/* =========================================
   4. UI SHELL & WINDOWS
   ========================================= */

const NotificationToast = ({ notifications }) => (
  <div className="fixed top-14 md:top-16 right-2 md:right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-[90vw]">
    {notifications.map((n) => (
      <div key={n.id} className={`animate-flicker bg-gray-900/95 border-l-4 p-3 text-xs w-64 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur
        ${n.type === 'alert' ? 'border-red-500 text-red-100 bg-red-900/20' : 'border-emerald-500 text-emerald-100 bg-emerald-900/20'}
      `}>
        <div className="flex items-center gap-2 mb-1">
            {n.type === 'alert' ? <AlertOctagon size={14} className="text-red-500 animate-pulse"/> : <CheckCircle size={14} className="text-emerald-500"/>}
            <span className="font-bold uppercase tracking-wider">{n.title}</span>
        </div>
        <div className="opacity-80 font-mono pl-6">{n.message}</div>
      </div>
    ))}
  </div>
);

const Window = ({ id, title, icon: Icon, children, onClose, isOpen, zIndex, onFocus, isAlert, isGhost, position, onMouseDown }) => {
  const isMobile = useIsMobile();
  if (!isOpen) return null;

  const color = isAlert ? '#ef4444' : (isGhost ? '#6b7280' : '#10b981');
  const textColor = isAlert ? 'text-red-400' : (isGhost ? 'text-gray-500' : 'text-emerald-400');
  const bgClass = isGhost ? 'bg-black' : 'bg-gray-950/90';
  
  // Mobile: Fixed Layout
  const mobileClasses = `inset-0 top-12 bottom-8 w-full h-auto m-0 rounded-none border-x-0`;
  
  // Desktop: Dynamic Position via Props (Styles)
  // We use specific widths/heights based on window type for initial sizing, but position is absolute
  const sizeClasses = {
      terminal: 'w-1/3 h-1/2',
      market: 'w-1/4 h-1/3',
      news: 'w-1/3 h-1/3',
      forensics: 'w-1/3 h-1/3'
  };

  return (
    <div 
      onMouseDown={() => onFocus(id)}
      style={{ 
        zIndex, 
        ...(isMobile ? {} : { left: position.x, top: position.y }) 
      }}
      className={`absolute flex flex-col ${bgClass} backdrop-blur-md shadow-2xl transition-shadow duration-300
        ${isMobile ? mobileClasses : `${sizeClasses[id]} border`}
        ${isAlert ? 'border-red-500/60' : 'border-emerald-500/30'}
      `}
    >
      {/* Background Grid SVG */}
      <div className="absolute inset-0 pointer-events-none z-50 opacity-50">
         <svg className="w-full h-full" preserveAspectRatio="none">
            <rect x="0.5" y="0.5" width="99.5%" height="99.5%" fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
            {!isMobile && (
              <>
                <path d="M0 10 V0 H10" fill="none" stroke={color} strokeWidth="2" />
                <path d="M0 calc(100% - 10px) V100% H10" fill="none" stroke={color} strokeWidth="2" />
                <path d="Mcalc(100% - 10px) 0 H100% V10" fill="none" stroke={color} strokeWidth="2" />
                <path d="M100% calc(100% - 10px) V100% Hcalc(100% - 10px)" fill="none" stroke={color} strokeWidth="2" />
              </>
            )}
         </svg>
      </div>

      {/* Header Bar - Draggable Area */}
      <div 
        onMouseDown={(e) => !isMobile && onMouseDown(e, id)}
        className={`relative flex justify-between items-center p-2 border-b select-none z-10 
        ${isGhost ? 'border-gray-800' : (isAlert ? 'border-red-500/30 bg-red-900/10' : 'border-emerald-500/20 bg-emerald-900/10')}
        ${!isMobile ? 'cursor-move' : ''}
      `}>
        <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${textColor}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isAlert ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`}/>
          {Icon && <Icon size={12} />} {title}
        </div>
        {!isGhost && !isMobile && (
          <div className="flex gap-2">
            <button onClick={(e) => { e.stopPropagation(); onClose(id); }} className={`${textColor} hover:text-white transition-colors`}>
                <X size={14} />
            </button>
          </div>
        )}
      </div>
      
      {/* Content Area */}
      <div className={`flex-1 overflow-auto p-4 font-mono text-xs scrollbar-thin relative z-10 ${textColor}`}>
        {children}
      </div>
    </div>
  );
};

/* =========================================
   5. BOOT SEQUENCE
   ========================================= */

const BootSequence = ({ onComplete, sfx }) => {
    const [lines, setLines] = useState([]);
    useEffect(() => {
        const txt = ["BIOS_CHECK...OK", "KERNEL_LOAD...OK", "ORBITAL_LINK...OK", "RSS_FEED_PROXY...CONNECTED", "GUI_INIT..."];
        let d = 0;
        sfx.boot();
        txt.forEach((t, i) => { 
            d += Math.random()*300+100; 
            setTimeout(() => { 
                setLines(p=>[...p,t]); 
                sfx.keyPress();
                if(i===txt.length-1) setTimeout(onComplete, 800); 
            }, d); 
        });
    }, [onComplete, sfx]);
    
    return (
        <div className="h-screen bg-black text-emerald-500 font-mono p-10 flex flex-col justify-end text-sm">
            {lines.map((l,i)=><div key={i} className="animate-flicker">{l}</div>)}
            <div className="animate-pulse mt-2">_</div>
        </div>
    );
};

/* =========================================
   6. MAIN CONTROLLER
   ========================================= */

export default function App() {
  const isMobile = useIsMobile();
  const [booted, setBooted] = useState(false);
  const [alertMode, setAlertMode] = useState(false);
  const [ghostMode, setGhostMode] = useState(false);
  const [muted, setMuted] = useState(false);
  
  const sfx = useSoundSystem(muted);
  const { news, loading: newsLoading } = useNewsFeed();

  // Window Management
  const [windowOrder, setWindowOrder] = useState(['terminal', 'market', 'news', 'forensics']);
  const [openWindows, setOpenWindows] = useState({ 
    terminal: true, market: true, news: true, forensics: true 
  });

  // Window Positioning System
  const [positions, setPositions] = useState({
      terminal: { x: 40, y: 80 },
      market: { x: window.innerWidth - 400, y: 80 },
      news: { x: 40, y: window.innerHeight - 300 },
      forensics: { x: window.innerWidth/2 - 200, y: window.innerHeight/2 - 150 }
  });

  // Dragging State
  const [dragging, setDragging] = useState(null); // { id: string, offsetX: number, offsetY: number }

  // Drag Handlers
  const handleDragStart = (e, id) => {
      sfx.drag();
      bringToFront(id);
      // Calculate offset so window doesn't snap to mouse position
      // Using e.target.closest to ensure we get the window div rect
      const winEl = e.target.closest('.absolute.flex.flex-col');
      if (winEl) {
          const rect = winEl.getBoundingClientRect();
          setDragging({
              id,
              offsetX: e.clientX - rect.left,
              offsetY: e.clientY - rect.top
          });
      }
  };

  const handleDragMove = useCallback((e) => {
      if (!dragging) return;
      setPositions(prev => ({
          ...prev,
          [dragging.id]: {
              x: e.clientX - dragging.offsetX,
              y: e.clientY - dragging.offsetY
          }
      }));
  }, [dragging]);

  const handleDragEnd = useCallback(() => {
      setDragging(null);
  }, []);

  // Attach global mouse listeners for smooth dragging outside of elements
  useEffect(() => {
      if (dragging) {
          window.addEventListener('mousemove', handleDragMove);
          window.addEventListener('mouseup', handleDragEnd);
      } else {
          window.removeEventListener('mousemove', handleDragMove);
          window.removeEventListener('mouseup', handleDragEnd);
      }
      return () => {
          window.removeEventListener('mousemove', handleDragMove);
          window.removeEventListener('mouseup', handleDragEnd);
      };
  }, [dragging, handleDragMove, handleDragEnd]);

  // Data State
  const [notifications, setNotifications] = useState([]);
  const [marketData, setMarketData] = useState([
    { n: 'STX/USD', p: 2.41, v: 5.2 }, { n: 'BTC/USD', p: 94102, v: -0.4 },
    { n: 'ETH/USD', p: 2641, v: 1.2 }, { n: 'SOL/USD', p: 198.4, v: 3.7 }, { n: 'NVDA', p: 135.20, v: 2.1 },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState(["LEONCE EQUITY SYSTEM LOADED.", "Type 'help' for commands."]);

  // Initial Responsive Setup
  useEffect(() => {
    if (isMobile) {
        setOpenWindows({ terminal: true, market: false, news: false, forensics: false });
    } else {
        setOpenWindows({ terminal: true, market: true, news: true, forensics: true });
        // Recalculate safe positions for desktop on resize/load
        setPositions({
            terminal: { x: 20, y: 70 },
            market: { x: window.innerWidth - 300, y: 70 }, // assuming ~25% width
            news: { x: 20, y: window.innerHeight - 250 },
            forensics: { x: window.innerWidth/2 - 150, y: window.innerHeight/2 - 100 }
        });
    }
  }, [isMobile]);

  // Simulation Loop
  useEffect(() => {
    const i = setInterval(() => {
      setMarketData(p => p.map(x => ({...x, p: x.p*(1+(Math.random()-0.5)*0.005), v: x.v+(Math.random()-0.5)*0.1})));
    }, 800);
    return () => clearInterval(i);
  }, []);

  // Alert Loop
  useEffect(() => {
    if (alertMode && !muted) {
        const i = setInterval(() => sfx.alert(), 2000);
        return () => clearInterval(i);
    }
  }, [alertMode, muted, sfx]);

  const addNotif = (t, m, type) => {
      const id = Date.now(); 
      setNotifications(p => [...p, {id, title:t, message:m, type}]);
      if(type === 'alert') sfx.error();
      setTimeout(() => setNotifications(p => p.filter(n => n.id !== id)), 4000);
  };
  
  const bringToFront = (id) => setWindowOrder(prev => [...prev.filter(w => w !== id), id]);

  const toggleWindow = (id) => {
    setOpenWindows(prev => {
        const isMobileAction = window.innerWidth < 768; 
        if (isMobileAction && !prev[id]) {
            return { terminal: false, market: false, news: false, forensics: false, [id]: true };
        }
        const newState = { ...prev, [id]: !prev[id] };
        if(newState[id]) bringToFront(id);
        return newState;
    });
    sfx.hover();
  };

  const handleCmd = (e) => {
      if(e.key !== 'Enter') return;
      sfx.keyPress();
      const [cmd, arg1, arg2] = input.trim().toLowerCase().split(' ');
      setHistory(p => [...p, `> ${input}`]); setInput("");
      
      switch(cmd) {
        case 'help': setHistory(p => [...p, "cmds: help, clear, inject [asset], alert, calm, ghost, mute/unmute"]); break;
        case 'clear': setHistory([]); break;
        case 'mute': setMuted(true); setHistory(p => [...p, "Audio output disabled."]); break;
        case 'unmute': setMuted(false); setHistory(p => [...p, "Audio output enabled."]); sfx.success(); break;
        case 'alert': 
            setAlertMode(true); setGhostMode(false); 
            addNotif('ALERT', 'SYSTEM BREACH DETECTED', 'alert'); 
            break;
        case 'calm': 
            setAlertMode(false); 
            addNotif('INFO', 'System stable', 'info'); 
            sfx.success();
            break;
        case 'ghost': 
            setGhostMode(true); setAlertMode(false); 
            addNotif('GHOST', 'Stealth mode active', 'info'); 
            break;
        case 'inject': 
            addNotif('INJECT', `Injection on ${arg1?.toUpperCase()}`, 'alert');
            setHistory(p => [...p, `[SUCCESS] Massive liquidity injection on ${arg1?.toUpperCase()}`]);
            break;
        case 'open': 
            if (isMobile) {
                setOpenWindows({ terminal: false, market: false, news: false, forensics: false, [arg1]: true });
            } else {
                setOpenWindows(p => ({...p, [arg1]: true})); 
                bringToFront(arg1);
            }
            break;
        case 'close': setOpenWindows(p => ({...p, [arg1]: false})); break;
        default: setHistory(p => [...p, "Unknown command."]); sfx.error();
      }
  };

  if (!booted) return <><GlobalStyles /><BootSequence sfx={sfx} onComplete={() => setBooted(true)} /></>;

  const accent = alertMode ? 'text-red-500' : 'text-emerald-500';
  const border = alertMode ? 'border-red-500/50' : 'border-emerald-500/30';

  return (
    <div className={`relative h-screen w-screen bg-black overflow-hidden flex flex-col font-mono transition-colors duration-500 
      ${ghostMode ? 'grayscale brightness-50' : ''} ${alertMode ? 'shake-screen' : ''}`}>
      
      <GlobalStyles />
      <CRTOverlay />
      <TacticalCursor isAlert={alertMode} />
      {!ghostMode && <NotificationToast notifications={notifications} />}

      {/* --- BACKGROUND --- */}
      <div className="absolute inset-0 z-0">
         <SpectacularGlobe isAlert={alertMode} />
      </div>

      {/* --- HEADER --- */}
      <div className={`relative z-50 h-12 bg-gray-950/80 border-b flex items-center justify-between px-4 backdrop-blur ${border}`}>
         <div className="flex items-center gap-2 md:gap-4">
             <Shield className={accent} size={20} />
             <span className={`font-bold text-lg md:text-xl tracking-[0.2em] glitch-text ${accent}`}>
                {isMobile ? 'LEONCE_M' : 'LEONCE_OS'}
             </span>
         </div>
         
         {/* TASKBAR */}
         {!ghostMode && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-[40vw] md:max-w-none px-2 items-center">
              {['terminal', 'market', 'news', 'forensics'].map((id) => (
                <button 
                  key={id}
                  onClick={() => toggleWindow(id)}
                  onMouseEnter={() => sfx.hover()}
                  className={`px-3 py-1 text-[9px] border rounded transition-all flex items-center gap-2 font-bold uppercase whitespace-nowrap
                    ${openWindows[id] ? `bg-opacity-20 ${alertMode ? 'bg-red-500 border-red-500 text-red-300' : 'bg-emerald-500 border-emerald-500 text-emerald-300'}` 
                                      : `opacity-50 ${alertMode ? 'border-red-900 text-red-700' : 'border-emerald-900 text-emerald-700'}`}
                  `}
                >
                  {id}
                </button>
              ))}
            </div>
         )}
         
         <div className="flex items-center gap-4">
             <button onClick={() => setMuted(!muted)} className={`${accent} opacity-50 hover:opacity-100`}>
                 {muted ? <VolumeX size={16}/> : <Volume2 size={16}/>}
             </button>
             <div className={`text-[10px] md:text-xs font-bold border px-2 py-1 ${border} ${accent} whitespace-nowrap hidden md:block`}>
                 {alertMode ? "DEFCON 1" : "SYSTEM ONLINE"}
             </div>
         </div>
      </div>

      {/* --- WORKSPACE --- */}
      <div className="relative flex-1 z-40 w-full overflow-hidden">
         <Window 
            id="terminal" 
            title="ROOT_ACCESS" 
            icon={Terminal} 
            isOpen={openWindows.terminal} 
            onClose={()=>toggleWindow('terminal')} 
            zIndex={windowOrder.indexOf('terminal') + 10} 
            onFocus={bringToFront} 
            isAlert={alertMode} 
            isGhost={ghostMode}
            position={positions.terminal}
            onMouseDown={handleDragStart}
         >
            {history.map((l,i) => <div key={i} className="mb-1">{l}</div>)}
            <div className="flex mt-2">
                <span className="mr-2 opacity-50">root@sys:~#</span>
                <input autoFocus={!isMobile} className="bg-transparent outline-none flex-1 text-inherit min-w-0" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleCmd} />
            </div>
         </Window>
         
         <Window 
            id="market" 
            title="LIQUIDITY_FLOW" 
            icon={BarChart3} 
            isOpen={openWindows.market} 
            onClose={()=>toggleWindow('market')} 
            zIndex={windowOrder.indexOf('market') + 10} 
            onFocus={bringToFront} 
            isAlert={alertMode} 
            isGhost={ghostMode}
            position={positions.market}
            onMouseDown={handleDragStart}
         >
            <div className="flex justify-between text-[10px] opacity-50 mb-2 border-b border-white/10 pb-1">
                <span>ASSET</span><span>PRICE</span><span>CHG</span>
            </div>
            {marketData.map((m,i) => (
                <div key={i} className="flex justify-between p-1 hover:bg-white/5 cursor-pointer">
                    <span className="font-bold">{m.n}</span>
                    <span>{m.p.toFixed(2)}</span>
                    <span className={m.v>0 ? (alertMode?'text-red-300':'text-green-400') : 'text-red-500'}>{m.v>0?'+':''}{m.v.toFixed(1)}%</span>
                </div>
            ))}
         </Window>
         
         <Window 
            id="news" 
            title="GLOBAL_WIRE_RSS" 
            icon={Radio} 
            isOpen={openWindows.news} 
            onClose={()=>toggleWindow('news')} 
            zIndex={windowOrder.indexOf('news') + 10} 
            onFocus={bringToFront} 
            isAlert={alertMode} 
            isGhost={ghostMode}
            position={positions.news}
            onMouseDown={handleDragStart}
         >
            {newsLoading ? (
                <div className="animate-pulse text-[10px]">ESTABLISHING SECURE CONNECTION TO NEWS SERVERS...</div>
            ) : (
                <div className="flex flex-col gap-2">
                    {news.map((item, i) => (
                        <div key={i} className="border-b border-white/5 pb-2 mb-1 last:border-0 hover:bg-white/5 p-1 transition-colors cursor-default group">
                            <div className="flex justify-between items-center mb-1">
                                <span className={`text-[9px] font-bold px-1 rounded ${i===0 ? (alertMode ? 'bg-red-900 text-red-300' : 'bg-emerald-900 text-emerald-300') : 'text-gray-500'}`}>
                                    {item.source}
                                </span>
                                <span className="text-[8px] opacity-50">{new Date(item.pubDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-emerald-500/50 block">
                                <div className="leading-tight text-[11px] group-hover:text-white transition-colors">{item.title}</div>
                            </a>
                        </div>
                    ))}
                </div>
            )}
         </Window>

         <Window 
            id="forensics" 
            title="NEXUS_FORENSICS" 
            icon={Share2} 
            isOpen={openWindows.forensics} 
            onClose={()=>toggleWindow('forensics')} 
            zIndex={windowOrder.indexOf('forensics') + 10} 
            onFocus={bringToFront} 
            isAlert={alertMode} 
            isGhost={ghostMode}
            position={positions.forensics}
            onMouseDown={handleDragStart}
         >
             <ForensicsViewer isAlert={alertMode} />
         </Window>
      </div>

      {/* --- FOOTER TICKER --- */}
      <div className={`h-8 md:h-6 border-t flex items-center overflow-hidden z-40 text-[9px] font-bold ${border} ${ghostMode ? 'text-gray-600' : 'text-emerald-500'}`}>
         <div className={`px-2 md:px-3 h-full flex items-center shrink-0 border-r ${border} ${alertMode ? 'bg-red-900/40' : 'bg-emerald-900/40'}`}>
             <Activity size={10} className="mr-2 animate-pulse"/> LIVE_WIRE
         </div>
         <div className="flex-1 overflow-hidden relative group">
             <div className="animate-ticker whitespace-nowrap flex gap-8 md:gap-12 absolute top-1/2 -translate-y-1/2">
                 {!newsLoading && news.length > 0 ? (
                     news.slice(0, 10).map((n, i) => (
                         <span key={i} className="flex items-center gap-2">
                             <span className="w-1 h-1 bg-current rounded-full opacity-50"></span>
                             [{n.source}] {n.title}
                         </span>
                     ))
                 ) : (
                     <>
                        <span>INITIALIZING NEWS FEED PROTOCOL...</span>
                        <span>WAITING FOR SATELLITE UPLINK...</span>
                     </>
                 )}
                 <span className="text-opacity-50">SYSTEM_STATUS: OPTIMAL</span>
             </div>
         </div>
      </div>

      <div className="scanline" />
    </div>
  );
}