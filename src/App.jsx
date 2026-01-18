import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Terminal, Shield, Activity, BarChart3, 
  Radar, Radio, Share2, 
  Layers, Volume2, VolumeX, 
  Database, Zap, ArrowUpRight, ArrowDownRight,
  Maximize2, ChevronRight, Cpu, Globe,
  Calendar, Clock, AlertTriangle, TrendingUp,
  Lock, Wifi, HardDrive, Fingerprint, Newspaper, Calculator, Grid3X3
} from 'lucide-react';

/* =========================================
   0. CONFIGURATION ET STYLES
   ========================================= */
const THEME = {
  bg: 'bg-[#0a0a0c]',
  surface: 'bg-[#121214]',
  border: 'border-[#242427]',
  text: 'text-zinc-400',
  accent: 'text-emerald-500',
  up: 'text-emerald-400',
  down: 'text-red-400',
  font: 'font-mono'
};

const GlobalStyles = () => (
  <style>{`
    @keyframes pulse-subtle { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
    .animate-pulse-subtle { animation: pulse-subtle 3s infinite ease-in-out; }
    .data-grid { background-image: radial-gradient(#242427 1px, transparent 1px); background-size: 20px 20px; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    input::selection { background: #10b981; color: #000; }
    @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    .animate-ticker { display: flex; width: fit-content; animation: ticker 30s linear infinite; }
    @keyframes scanline { 0% { bottom: 100%; } 100% { bottom: -100px; } }
    .scanline { width: 100%; height: 100px; z-index: 10; background: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(16, 185, 129, 0.05) 50%, rgba(0,0,0,0) 100%); opacity: 0.1; position: absolute; bottom: 100%; animation: scanline 8s linear infinite; pointer-events: none; }
    @keyframes fast-log { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .animate-log { animation: fast-log 0.1s ease-out forwards; }
    @keyframes glitch-flash { 0% { background: transparent; } 1% { background: rgba(16, 185, 129, 0.1); } 2% { background: transparent; } }
    .animate-glitch-flash { animation: glitch-flash 4s infinite; }
  `}</style>
);

// --- CALCULATRICE FINANCIÈRE ---
const CALC_TERMINAL_CONTENT = `
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      :root { --bg: #121214; --border: #242427; --accent: #10b981; --text: #e8eaed; }
      body { background: #0a0a0c; color: var(--text); font-family: ui-monospace, monospace; margin: 0; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
      .calc { display: flex; flex-direction: column; height: 100%; padding: 10px; box-sizing: border-box; }
      .display { background: var(--bg); border: 1px solid var(--border); padding: 15px; text-align: right; margin-bottom: 10px; min-height: 80px; display: flex; flex-direction: column; justify-content: flex-end; }
      #history { font-size: 12px; color: #5f6368; min-height: 1.2em; word-break: break-all; }
      #current { font-size: 22px; font-weight: bold; overflow: hidden; }
      .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; flex: 1; }
      button { background: #1e1e21; border: 1px solid var(--border); color: var(--text); font-family: inherit; font-size: 16px; cursor: pointer; transition: 0.1s; }
      button:hover { border-color: var(--accent); color: var(--accent); background: #242427; }
      button.op { color: var(--accent); }
      button.eq { background: rgba(16, 185, 129, 0.1); color: var(--accent); grid-column: span 4; }
      button.ac { color: #ef4444; }
    </style>
  </head>
  <body>
    <div class="calc">
      <div class="display"><div id="history"></div><div id="current">0</div></div>
      <div class="grid">
        <button class="ac" onclick="press('AC')">AC</button><button onclick="press('(')">(</button><button onclick="press(')')">)</button><button class="op" onclick="press('/')">/</button>
        <button onclick="press('7')">7</button><button onclick="press('8')">8</button><button onclick="press('9')">9</button><button class="op" onclick="press('*')">*</button>
        <button onclick="press('4')">4</button><button onclick="press('5')">5</button><button onclick="press('6')">6</button><button class="op" onclick="press('-')">-</button>
        <button onclick="press('1')">1</button><button onclick="press('2')">2</button><button onclick="press('3')">3</button><button class="op" onclick="press('+')">+</button>
        <button onclick="press('0')">0</button><button onclick="press('.')">.</button><button onclick="press('%')">%</button><button class="op" onclick="press('DEL')">←</button>
        <button class="eq" onclick="calculate()">EXE</button>
      </div>
    </div>
    <script>
      let expression = ""; const currentEl = document.getElementById('current'); const historyEl = document.getElementById('history');
      function press(val) { if (val === 'AC') expression = ""; else if (val === 'DEL') expression = expression.slice(0, -1); else expression += val; update(); }
      function update() { currentEl.innerText = expression || "0"; }
      function calculate() {
        try {
          let sanitized = expression.replace(/(\\d+\\.?\\d*)\\s*([+-])\\s*(\\d+\\.?\\d*)%/g, (match, base, op, perc) => \`\${base} \${op} (\${base} * \${perc} / 100)\`).replace(/%/g, '/100');
          const result = new Function('return ' + sanitized)();
          historyEl.innerText = expression + " ="; expression = String(Math.round(result * 1000000) / 1000000); update();
        } catch (e) { currentEl.innerText = "SYNTAX_ERR"; setTimeout(() => update(), 1000); }
      }
    </script>
  </body>
</html>
`;

// --- SUDOKU TERMINAL CONTENT (INTÉGRALE DU CODE FOURNI) ---
const SUDOKU_TERMINAL_CONTENT = `
<!DOCTYPE html>
<html lang="en" class="antialiased">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Sudoku Pro - Sovereign Edition</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: { slate: { 850: '#151f2e' } },
                    fontFamily: { mono: ['ui-monospace', 'monospace'] },
                    animation: {
                        'penalty': 'penalty-flash 0.5s ease-in-out',
                        'shake': 'shake 0.4s both',
                        'pop-in': 'popIn 0.3s forwards',
                    },
                    keyframes: {
                        'penalty-flash': { '0%, 100%': { backgroundColor: 'transparent' }, '50%': { backgroundColor: 'rgba(239, 68, 68, 0.2)' } },
                        'shake': { '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' }, '20%, 80%': { transform: 'translate3d(2px, 0, 0)' } },
                        'popIn': { '0%': { transform: 'scale(0.8)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } }
                    }
                }
            }
        }
    </script>
    <style>
        body { background: #000; color: #00ff41; font-family: 'ui-monospace', monospace; }
        .grid-container { aspect-ratio: 1/1; max-width: 450px; margin: 0 auto; }
        .cell { aspect-ratio: 1/1; position: relative; cursor: pointer; transition: all 0.15s; }
        .cell-input { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; z-index: 10; }
        .notes-grid { display: grid; grid-template-columns: repeat(3, 1fr); height: 100%; width: 100%; font-size: 0.6rem; color: #008f11; pointer-events: none; }
        .cell-active { background: rgba(0, 255, 65, 0.2); box-shadow: inset 0 0 0 2px #00ff41; }
        .cell-highlight { background: rgba(0, 255, 65, 0.05); }
        .cell-error { color: #ff4141; background: rgba(255, 65, 65, 0.1); }
        .cell-fixed { color: #008f11; font-weight: 900; }
        .cell-filled { color: #00ff41; }
        .border-thick-r { border-right: 2px solid #00ff41; }
        .border-thick-b { border-bottom: 2px solid #00ff41; }
        .btn { transition: all 0.2s; text-transform: uppercase; font-weight: bold; border: 1px solid #008f11; padding: 4px 8px; }
        .btn:hover { background: rgba(0, 255, 65, 0.1); box-shadow: 0 0 10px rgba(0, 255, 65, 0.3); }
    </style>
</head>
<body class="p-4 flex flex-col h-screen overflow-hidden">
    <div class="max-w-md mx-auto w-full flex flex-col h-full">
        <div class="flex justify-between items-center mb-4 border-b border-[#004d00] pb-2">
            <div>
                <h1 class="text-xl font-bold tracking-tighter">SUDOKU_KERNEL</h1>
                <div id="difficulty-badge" class="text-[10px] bg-[#004d00] px-1 inline-block uppercase">MODE: EASY</div>
            </div>
            <div class="text-right">
                <div id="timer" class="text-lg">00:00</div>
                <div id="penalty-counter" class="text-[10px] text-red-500">PENALTY: 0/3</div>
            </div>
        </div>

        <div id="board-container" class="relative bg-black border-2 border-[#00ff41] grid-container grid grid-cols-9 overflow-hidden">
        </div>

        <div class="mt-4 flex flex-col gap-3">
            <div class="grid grid-cols-9 gap-1">
                <button class="num-btn btn text-sm" data-val="1">1</button>
                <button class="num-btn btn text-sm" data-val="2">2</button>
                <button class="num-btn btn text-sm" data-val="3">3</button>
                <button class="num-btn btn text-sm" data-val="4">4</button>
                <button class="num-btn btn text-sm" data-val="5">5</button>
                <button class="num-btn btn text-sm" data-val="6">6</button>
                <button class="num-btn btn text-sm" data-val="7">7</button>
                <button class="num-btn btn text-sm" data-val="8">8</button>
                <button class="num-btn btn text-sm" data-val="9">9</button>
            </div>
            
            <div class="grid grid-cols-4 gap-2">
                <button id="undo-btn" class="btn text-[10px]">UNDO</button>
                <button id="note-btn" class="btn text-[10px]">NOTE: OFF</button>
                <button id="hint-btn" class="btn text-[10px]">HINT</button>
                <button id="erase-btn" class="btn text-[10px] text-red-500">ERASE</button>
            </div>

            <div class="flex gap-2">
                <select id="level-select" class="bg-black border border-[#008f11] text-[10px] px-2 flex-1 outline-none">
                    <option value="easy">EASY</option>
                    <option value="medium">MEDIUM</option>
                    <option value="hard">HARD</option>
                    <option value="expert">EXPERT</option>
                </select>
                <button id="new-game-btn" class="btn bg-[#008f11] text-black px-4 py-1 text-[10px] font-bold">NEW_SESSION</button>
                <button id="pdf-btn" class="btn text-[10px] px-2 opacity-50">PDF</button>
            </div>
        </div>
    </div>

    <script>
        class SudokuController {
            constructor() {
                this.board = Array(81).fill(0);
                this.solution = Array(81).fill(0);
                this.initialBoard = Array(81).fill(0);
                this.notes = Array(81).fill().map(() => new Set());
                this.selected = -1;
                this.isNoteMode = false;
                this.penalties = 0;
                this.timer = 0;
                this.timerId = null;
                this.init();
            }

            init() {
                this.renderBoard();
                this.attachEvents();
                this.newGame('easy');
            }

            renderBoard() {
                const container = document.getElementById('board-container');
                container.innerHTML = '';
                for(let i=0; i<81; i++) {
                    const cell = document.createElement('div');
                    cell.className = \`cell border border-[#004d00] \${(i%9===2 || i%9===5) ? 'border-thick-r' : ''} \${(Math.floor(i/9)===2 || Math.floor(i/9)===5) ? 'border-thick-b' : ''}\`;
                    cell.dataset.index = i;
                    cell.innerHTML = '<div class="notes-grid"></div><div class="cell-input"></div>';
                    container.appendChild(cell);
                }
            }

            attachEvents() {
                document.getElementById('board-container').onclick = (e) => {
                    const cell = e.target.closest('.cell');
                    if(cell) this.selectCell(parseInt(cell.dataset.index));
                };
                document.querySelectorAll('.num-btn').forEach(b => b.onclick = () => this.inputValue(parseInt(b.dataset.val)));
                document.getElementById('new-game-btn').onclick = () => this.newGame(document.getElementById('level-select').value);
                document.getElementById('note-btn').onclick = () => this.toggleNote();
                document.getElementById('erase-btn').onclick = () => this.inputValue(0);
                document.getElementById('hint-btn').onclick = () => this.giveHint();
                document.getElementById('pdf-btn').onclick = () => window.print();
                
                window.onkeydown = (e) => {
                    if(e.key >= 1 && e.key <= 9) this.inputValue(parseInt(e.key));
                    if(e.key === 'Backspace' || e.key === 'Delete') this.inputValue(0);
                    if(e.key.toLowerCase() === 'n') this.toggleNote();
                };
            }

            newGame(level) {
                // Algorithme de génération simplifié (base fixe mélangée pour démo)
                const base = [
                    5,3,4,6,7,8,9,1,2,6,7,2,1,9,5,3,4,8,1,9,8,3,4,2,5,6,7,
                    8,5,9,7,6,1,4,2,3,4,2,6,8,5,3,7,9,1,7,1,3,9,2,4,8,5,6,
                    9,6,1,5,3,7,2,8,4,2,8,7,4,1,9,6,3,5,3,4,5,2,8,6,1,7,9
                ];
                this.solution = [...base];
                this.board = [...base];
                this.initialBoard = [...base];
                
                let holes = {easy: 35, medium: 45, hard: 55, expert: 62}[level] || 35;
                while(holes > 0) {
                    let idx = Math.floor(Math.random()*81);
                    if(this.board[idx] !== 0) { this.board[idx] = 0; this.initialBoard[idx] = 0; holes--; }
                }

                this.penalties = 0;
                this.timer = 0;
                this.selected = -1;
                this.notes = Array(81).fill().map(() => new Set());
                this.updateUI();
                this.startTimer();
                document.getElementById('difficulty-badge').innerText = \`MODE: \${level.toUpperCase()}\`;
            }

            selectCell(idx) {
                this.selected = idx;
                this.updateUI();
            }

            inputValue(val) {
                if(this.selected === -1 || this.initialBoard[this.selected] !== 0) return;
                
                if(this.isNoteMode && val !== 0) {
                    if(this.notes[this.selected].has(val)) this.notes[this.selected].delete(val);
                    else this.notes[this.selected].add(val);
                } else {
                    if(val !== 0 && val !== this.solution[this.selected]) {
                        this.penalties++;
                        document.getElementById('board-container').classList.add('animate-penalty');
                        setTimeout(() => document.getElementById('board-container').classList.remove('animate-penalty'), 500);
                        if(this.penalties >= 3) {
                            alert('SYSTEM_HALT: MAXIMUM_PENALTIES_REACHED');
                            this.newGame('easy');
                        }
                    } else {
                        this.board[this.selected] = val;
                        this.notes[this.selected].clear();
                    }
                }
                this.updateUI();
                if(!this.board.includes(0)) {
                    clearInterval(this.timerId);
                    alert('ACCESS_GRANTED: SODOKU_RESOLVED');
                }
            }

            toggleNote() {
                this.isNoteMode = !this.isNoteMode;
                const btn = document.getElementById('note-btn');
                btn.innerText = \`NOTE: \${this.isNoteMode ? 'ON' : 'OFF'}\`;
                btn.style.borderColor = this.isNoteMode ? '#00ff41' : '#008f11';
                btn.style.color = this.isNoteMode ? '#00ff41' : '#008f11';
            }

            updateUI() {
                const cells = document.querySelectorAll('.cell');
                cells.forEach((cell, i) => {
                    const input = cell.querySelector('.cell-input');
                    const notesGrid = cell.querySelector('.notes-grid');
                    
                    input.innerText = this.board[i] || '';
                    cell.className = cell.className.split(' ').filter(c => !['cell-active', 'cell-highlight', 'cell-fixed', 'cell-filled'].includes(c)).join(' ');
                    
                    if(this.initialBoard[i] !== 0) cell.classList.add('cell-fixed');
                    else if(this.board[i] !== 0) cell.classList.add('cell-filled');
                    
                    if(this.selected !== -1) {
                        const selR = Math.floor(this.selected/9), selC = this.selected%9;
                        const iR = Math.floor(i/9), iC = i%9;
                        if(i === this.selected) cell.classList.add('cell-active');
                        else if(selR === iR || selC === iC) cell.classList.add('cell-highlight');
                    }

                    notesGrid.innerHTML = '';
                    if(this.board[i] === 0) {
                        for(let n=1; n<=9; n++) {
                            const note = document.createElement('div');
                            note.className = 'flex items-center justify-center';
                            note.innerText = this.notes[i].has(n) ? n : '';
                            notesGrid.appendChild(note);
                        }
                    }
                });
                document.getElementById('penalty-counter').innerText = \`PENALTY: \${this.penalties}/3\`;
            }

            startTimer() {
                if(this.timerId) clearInterval(this.timerId);
                this.timerId = setInterval(() => {
                    this.timer++;
                    const m = Math.floor(this.timer/60).toString().padStart(2,'0');
                    const s = (this.timer%60).toString().padStart(2,'0');
                    document.getElementById('timer').innerText = \`\${m}:\${s}\`;
                }, 1000);
            }

            giveHint() {
                if(this.selected === -1 || this.board[this.selected] !== 0) return;
                this.board[this.selected] = this.solution[this.selected];
                this.notes[this.selected].clear();
                this.updateUI();
            }
        }
        document.addEventListener('DOMContentLoaded', () => new SudokuController());
    </script>
</body>
</html>
`;

// --- NEWS TERMINAL CONTENT ---
const NEWS_TERMINAL_CONTENT = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NEWS TERMINAL</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        :root { --main-color: #00ff41; --dim-color: #008f11; --border-color: #004d00; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'VT323', monospace; background-color: #000; color: var(--main-color); font-size: 16px; height: 100vh; overflow: hidden; display: flex; flex-direction: column; }
        .header { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 2px solid var(--border-color); }
        .feed-container { flex: 1; overflow-y: auto; padding: 1rem; }
        .article-card { margin-bottom: 15px; padding: 10px; border-left: 3px solid var(--border-color); background: rgba(0, 20, 0, 0.3); transition: all 0.2s; }
        .article-card:hover { border-left-color: var(--main-color); background: rgba(0, 40, 0, 0.5); }
        .meta { font-size: 0.8rem; color: var(--dim-color); margin-bottom: 5px; }
        .title { font-size: 1.2rem; text-decoration: none; color: var(--main-color); display: block; }
    </style>
</head>
<body>
    <div class="header">
        <div style="font-weight: bold;">LIVE_INTEL_STREAM</div>
        <div id="sync">SYNC: READY</div>
    </div>
    <div id="results" class="feed-container">SYNCING_NEURAL_NETWORK...</div>
    <script>
        async function fetchFeeds() {
            const results = document.getElementById('results');
            const sync = document.getElementById('sync');
            sync.innerText = "SYNC: FETCHING...";
            try {
                const res = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss');
                const data = await res.json();
                if(data.status === 'ok') {
                    results.innerHTML = data.items.map(a => \`
                        <div class="article-card">
                            <div class="meta">[\${new Date(a.pubDate).toLocaleTimeString()}] WIRE_SERVICE</div>
                            <a href="\${a.link}" target="_blank" class="title">\${a.title}</a>
                        </div>\`).join('');
                }
                sync.innerText = "SYNC: LIVE";
            } catch(e) { sync.innerText = "SYNC: ERROR"; }
        }
        fetchFeeds(); setInterval(fetchFeeds, 300000);
    </script>
</body>
</html>
`;

/* =========================================
   1. SYSTEMES AUDIO ET SFX
   ========================================= */

const useSoundSystem = (muted) => {
  const audioCtxRef = useRef(null);
  const playTone = useCallback((freq, type, duration, vol = 0.1) => {
    if (muted) return;
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }, [muted]);

  return useMemo(() => ({
    boot: () => { playTone(100, 'square', 0.1); setTimeout(() => playTone(400, 'square', 0.2), 150); },
    keyPress: () => playTone(800 + Math.random()*200, 'sine', 0.05, 0.02),
    success: () => { playTone(600, 'sine', 0.1); setTimeout(() => playTone(1200, 'sine', 0.3), 100); },
    processing: () => playTone(200 + Math.random() * 50, 'triangle', 0.05, 0.01),
    hover: () => playTone(2000, 'sine', 0.01, 0.005)
  }), [playTone]);
};

/* =========================================
   2. MODULE : INITIALISATION (BOOT)
   ========================================= */

const BootSequence = ({ onComplete, sfx }) => {
    const [logs, setLogs] = useState([]);
    const [stage, setStage] = useState('POST');
    const [progress, setProgress] = useState(0);
    const completeCalled = useRef(false);

    const postLines = useMemo(() => [
        "CPU_INIT: ARMV9.2-A SVE2 ... OK",
        "MEM_CHECK: 131072MB ECC LPDDR5 ... OK",
        "KERNEL: SOVEREIGN_CORE_V5.1.4_STABLE",
        "NETWORK: SATELLITE_UPLINK_STABLE",
        "DISK_CRYPT: AES-256-GCM_MOUNTED"
    ], []);

    useEffect(() => {
        if (stage !== 'POST') return;
        let i = 0;
        const interval = setInterval(() => {
            if (i < postLines.length) {
                setLogs(prev => [...prev, postLines[i]]);
                sfx.keyPress(); i++;
            } else {
                clearInterval(interval);
                setTimeout(() => setStage('AUTH'), 500);
            }
        }, 120);
        return () => clearInterval(interval);
    }, [stage, sfx, postLines]);

    useEffect(() => {
        if (stage === 'AUTH') {
            let p = 0;
            const interval = setInterval(() => {
                p += 5; setProgress(p); sfx.processing();
                if (p >= 100) {
                    clearInterval(interval);
                    setTimeout(() => { setStage('DECRYPT'); sfx.success(); }, 400);
                }
            }, 60);
            return () => clearInterval(interval);
        }
    }, [stage, sfx]);

    useEffect(() => {
        if (stage === 'DECRYPT' && !completeCalled.current) {
            const timer = setTimeout(() => { 
                completeCalled.current = true; 
                onComplete(); 
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, [stage, onComplete]);

    return (
        <div className="h-screen w-screen bg-black flex flex-col font-mono text-emerald-500/80 p-8 overflow-hidden">
            {stage === 'POST' && (
                <div className="space-y-1">
                    <div className="text-emerald-500 font-bold mb-4 flex items-center gap-2"><Cpu size={16} /> SYSTEM_SELF_TEST</div>
                    {logs.map((line, idx) => (<div key={idx} className="text-[10px] animate-log"><span className="opacity-40 mr-2">[{idx}]</span>{line}</div>))}
                </div>
            )}
            {stage === 'AUTH' && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                    <Fingerprint size={80} className="text-emerald-500 animate-pulse" />
                    <div className="w-64 space-y-2">
                        <div className="flex justify-between text-[10px] font-bold"><span>VÉRIFICATION_IDENTITÉ</span><span>{progress}%</span></div>
                        <div className="h-1 bg-zinc-900"><div className="h-full bg-emerald-500 transition-all duration-100" style={{ width: `${progress}%` }} /></div>
                    </div>
                </div>
            )}
            {stage === 'DECRYPT' && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-white">
                    <Lock size={40} className="animate-bounce" />
                    <div className="text-sm font-bold tracking-[0.5em]">DÉCHIFFREMENT_INTERFACE</div>
                </div>
            )}
        </div>
    );
};

/* =========================================
   3. MODULE : GLOBE TOPOLOGIE (SPECTACULAR FIBONACCI)
   ========================================= */

const NetworkGlobe = React.memo(() => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height, animationFrameId;

    const DOT_COUNT = 500; const DOT_SIZE = 1.8; const CONNECTION_DISTANCE = 45;
    const ROTATION_SPEED = 0.003; const COLOR_BASE = '16, 185, 129';

    let rotation = 0; const dots = []; const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < DOT_COUNT; i++) {
        const y = 1 - (i / (DOT_COUNT - 1)) * 2; const radius = Math.sqrt(1 - y * y); const theta = phi * i;
        dots.push({ 
            x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius, 
            active: Math.random() > 0.93, pulsePhase: Math.random() * Math.PI * 2 
        });
    }

    const resize = () => { 
        if (!canvas.parentElement) return;
        width = canvas.width = canvas.parentElement.clientWidth; 
        height = canvas.height = canvas.parentElement.clientHeight; 
    };
    resize(); window.addEventListener('resize', resize);

    const project = (x, y, z, r) => {
        const scale = 380 / (380 + z); const px = x * scale * r + width / 2; const py = y * scale * r + height / 2;
        return { x: px, y: py, scale, z };
    };

    const draw = () => {
        ctx.clearRect(0, 0, width, height); rotation += ROTATION_SPEED;
        const radius = Math.min(width, height) * 0.4; const time = Date.now() * 0.002;

        const projected = dots.map(dot => {
            const xRot = dot.x * Math.cos(rotation) - dot.z * Math.sin(rotation);
            const zRot = dot.z * Math.cos(rotation) + dot.x * Math.sin(rotation);
            return { ...project(xRot, dot.y, zRot * 1.1, radius), original: dot };
        });

        // Lignes de connexion
        ctx.lineWidth = 0.5;
        for (let i = 0; i < projected.length; i++) {
            const dA = projected[i]; if (dA.z < 0) continue;
            for (let j = i + 1; j < projected.length; j++) {
                const dB = projected[j]; if (dB.z < 0) continue;
                const dist = Math.hypot(dA.x - dB.x, dA.y - dB.y);
                if (dist < CONNECTION_DISTANCE * dA.scale) {
                    const alpha = (1 - dist / (CONNECTION_DISTANCE * dA.scale)) * 0.4 * dA.scale;
                    ctx.strokeStyle = `rgba(${COLOR_BASE}, ${alpha})`;
                    ctx.beginPath(); ctx.moveTo(dA.x, dA.y); ctx.lineTo(dB.x, dB.y); ctx.stroke();
                }
            }
        }

        // Points
        projected.forEach(dot => {
            const alpha = Math.max(0.05, (dot.z + radius) / (2 * radius));
            const size = DOT_SIZE * dot.scale;
            ctx.fillStyle = dot.original.active && Math.sin(time + dot.original.pulsePhase) > 0.8 ? '#fff' : `rgba(${COLOR_BASE}, ${alpha})`;
            ctx.beginPath(); ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2); ctx.fill();
        });

        animationFrameId = requestAnimationFrame(draw);
    };
    draw(); return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationFrameId); };
  }, []);
  return <canvas ref={canvasRef} className="w-full h-full" />;
});

/* =========================================
   4. CONTRÔLEUR PRINCIPAL (WINDOWS & DRAG)
   ========================================= */

const useMarketEngine = () => {
  const [data, setData] = useState([{ id: 'BTC', price: 92451.20, change: 1.2 }, { id: 'ETH', price: 2645.15, change: -0.4 }, { id: 'SOL', price: 198.42, change: 4.7 }]);
  useEffect(() => {
    const interval = setInterval(() => { setData(prev => prev.map(a => ({ ...a, price: a.price * (1 + (Math.random()-0.5)*0.002), change: a.change + (Math.random()-0.5)*0.1 }))); }, 1000);
    return () => clearInterval(interval);
  }, []);
  return data;
};

const Window = ({ title, icon: Icon, children, className = "", onClose, id, initialPos }) => {
  const [pos, setPos] = useState(initialPos || null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (!pos) return; setIsDragging(true);
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };

  useEffect(() => {
    const handleMouseMove = (e) => { 
        if (isDragging) setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y }); 
    };
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) { 
        document.addEventListener('mousemove', handleMouseMove); 
        document.addEventListener('mouseup', handleMouseUp); 
    }
    return () => { 
        document.removeEventListener('mousemove', handleMouseMove); 
        document.removeEventListener('mouseup', handleMouseUp); 
    };
  }, [isDragging]);

  const style = pos ? { left: `${pos.x}px`, top: `${pos.y}px`, position: 'absolute', zIndex: isDragging ? 100 : 50 } : {};

  return (
    <div style={style} className={`flex flex-col ${THEME.surface} border ${THEME.border} rounded overflow-hidden shadow-2xl ${className}`}>
      <div onMouseDown={handleMouseDown} className={`px-3 py-1.5 border-b ${THEME.border} flex items-center justify-between bg-zinc-900/50 ${pos ? 'cursor-move select-none active:bg-zinc-800' : ''}`}>
        <div className="flex items-center gap-2 pointer-events-none">
          {Icon && <Icon size={12} className="text-zinc-500" />}
          <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">{title}</span>
        </div>
        {onClose && <button onClick={() => onClose(id)} className="text-zinc-600 hover:text-red-500 transition-colors pointer-events-auto">✕</button>}
      </div>
      <div className="flex-1 overflow-hidden relative">
        {isDragging && <div className="absolute inset-0 z-[200] bg-transparent" />}
        {children}
      </div>
    </div>
  );
};

export default function App() {
  const [booted, setBooted] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [history, setHistory] = useState(["SOUVEREIGN_OS_ESTABLISHED", "TYPE 'HELP' FOR COMMANDS"]);
  const [input, setInput] = useState("");
  const marketData = useMarketEngine();
  const sfx = useSoundSystem(false);

  const [openWindows, setOpenWindows] = useState({ terminal: true, market: true, network: true, newsTerminal: false, calcTerminal: false, sudokuTerminal: false });

  const toggleWindow = useCallback((id) => { 
    setOpenWindows(p => ({ ...p, [id]: !p[id] })); 
    sfx.hover(); 
  }, [sfx]);

  const onBootComplete = useCallback(() => {
    setBooted(true);
  }, []);

  const handleCommand = (e) => {
    if (e.key !== 'Enter') return;
    const cmd = input.trim().toUpperCase(); setInput("");
    setHistory(p => [...p, "> " + cmd]);
    if (cmd === 'HELP') setHistory(p => [...p, "NEWS, CALC, SODOKU, SUDOKU, CLEAR, REBOOT"]);
    if (cmd === 'NEWS') toggleWindow('newsTerminal');
    if (cmd === 'CALC') toggleWindow('calcTerminal');
    if (cmd === 'SUDOKU' || cmd === 'SODOKU') toggleWindow('sudokuTerminal');
    if (cmd === 'CLEAR') setHistory([]);
    if (cmd === 'REBOOT') window.location.reload();
  };

  if (!showTerminal) return (
    <div className="h-screen w-screen bg-black flex items-center justify-center font-mono cursor-pointer" onClick={() => { setShowTerminal(true); sfx.boot(); }}>
      <GlobalStyles />
      <div className="text-center space-y-4">
        <Shield className="mx-auto text-emerald-500 animate-pulse" size={48} />
        <div className="text-zinc-500 text-sm tracking-[1.2em] uppercase">Leonce Sovereign Terminal</div>
        <div className="text-[10px] text-zinc-700 uppercase">Initialize Secure Uplink</div>
      </div>
    </div>
  );

  if (!booted) return <><GlobalStyles /><BootSequence sfx={sfx} onComplete={onBootComplete} /></>;

  return (
    <div className="h-screen w-screen bg-[#0a0a0c] flex flex-col font-mono overflow-hidden">
      <GlobalStyles />
      <div className="h-10 border-b border-[#242427] flex items-center justify-between px-4 shrink-0 bg-zinc-950/80 backdrop-blur">
        <div className="flex items-center gap-4">
          <Shield className="text-emerald-500" size={16} />
          <span className="font-bold text-sm text-zinc-200 uppercase tracking-tighter">Sovereign_OS v5.1</span>
          <div className="h-4 w-[1px] bg-zinc-800 mx-1" />
          <div className="flex gap-4">
             <button onClick={() => toggleWindow('newsTerminal')} className="text-[10px] text-zinc-500 hover:text-emerald-400 font-bold uppercase transition-colors">News</button>
             <button onClick={() => toggleWindow('calcTerminal')} className="text-[10px] text-zinc-500 hover:text-emerald-400 font-bold uppercase transition-colors">Calc</button>
             <button onClick={() => toggleWindow('sudokuTerminal')} className="text-[10px] text-zinc-500 hover:text-emerald-400 font-bold uppercase transition-colors">Sudoku</button>
          </div>
        </div>
        <div className="flex gap-6 text-[10px] items-center">
          <div className="flex gap-4 border-r border-zinc-800 pr-4">
            {marketData.map(a => <div key={a.id} className="flex gap-2"><span className="text-zinc-500">{a.id}</span><span className={a.change >= 0 ? 'text-emerald-400' : 'text-red-400'}>{a.price.toFixed(2)}</span></div>)}
          </div>
          <span className="text-zinc-600 font-bold uppercase">{new Date().toLocaleTimeString()} UTC</span>
        </div>
      </div>

      <div className="flex-1 p-2 grid grid-cols-12 grid-rows-6 gap-2 data-grid relative">
        <Window title="CONSOLE_MAÎTRE" icon={Terminal} className="col-span-12 md:col-span-8 row-span-3">
            <div className="flex flex-col h-full p-2">
              <div className="flex-1 overflow-auto no-scrollbar space-y-1 text-zinc-500 text-[11px]">
                {history.map((line, i) => <div key={i} className="flex gap-2"><span className="opacity-20">[{new Date().toLocaleTimeString()}]</span><span className={line.startsWith('>') ? 'text-emerald-500' : ''}>{line}</span></div>)}
              </div>
              <div className="flex items-center gap-2 border-t border-zinc-800 pt-2 mt-2">
                <ChevronRight size={14} className="text-emerald-500" />
                <input autoFocus className="bg-transparent outline-none flex-1 text-zinc-200 text-[11px] uppercase" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleCommand} placeholder="SYSTEM_CMD..." />
              </div>
            </div>
        </Window>

        <Window title="TOPOLOGIE_GLOBAL" icon={Globe} className="col-span-12 md:col-span-4 row-span-3"><NetworkGlobe /></Window>

        {openWindows.newsTerminal && (
          <Window title="NEWS_INTEL" icon={Newspaper} className="w-[600px] h-[500px]" onClose={toggleWindow} id="newsTerminal" initialPos={{x: 60, y: 120}}>
            <iframe srcDoc={NEWS_TERMINAL_CONTENT} className="w-full h-full border-none" title="News" />
          </Window>
        )}
        {openWindows.calcTerminal && (
          <Window title="FINANCIAL_CALC" icon={Calculator} className="w-[350px] h-[480px]" onClose={toggleWindow} id="calcTerminal" initialPos={{x: 420, y: 180}}>
            <iframe srcDoc={CALC_TERMINAL_CONTENT} className="w-full h-full border-none" title="Calc" />
          </Window>
        )}
        {openWindows.sudokuTerminal && (
          <Window title="SUDOKU_KERNEL" icon={Grid3X3} className="w-[500px] h-[700px]" onClose={toggleWindow} id="sudokuTerminal" initialPos={{x: 650, y: 60}}>
            <iframe srcDoc={SUDOKU_TERMINAL_CONTENT} className="w-full h-full border-none" title="Sudoku" />
          </Window>
        )}

        <Window title="INDICATEURS_ALPHA" icon={Zap} className="col-span-12 md:col-span-12 row-span-3">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-3 h-full uppercase p-2">
                {[{ n: 'REVERSION_L2', c: 84 }, { n: 'MOMENTUM_BTC', c: 62 }, { n: 'GAP_LIQUIDITÉ', c: 91 }, { n: 'SENTIMENT_AI', c: 75 }].map(sig => (
                  <div key={sig.n} className="bg-zinc-900/50 border border-zinc-800/50 p-4 rounded flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-zinc-500">{sig.n}</span>
                    <div className="flex justify-between items-end"><span className="text-2xl font-bold text-zinc-200">{sig.c}%</span><ArrowUpRight className="text-emerald-500" size={24} /></div>
                  </div>
                ))}
           </div>
        </Window>
      </div>

      <div className="h-6 border-t border-[#242427] bg-zinc-950 flex items-center overflow-hidden italic text-[9px] text-zinc-600 px-4">
        <div className="animate-ticker">
           <span>INTEL_LIVE: ALERTE_BALEINE: +1200 BTC BINANCE /// MARKET_SENTIMENT: GREED (64.2) /// SYSTEM_LOAD: 12% ///</span>
           <span>INTEL_LIVE: ALERTE_BALEINE: +1200 BTC BINANCE /// MARKET_SENTIMENT: GREED (64.2) /// SYSTEM_LOAD: 12% ///</span>
        </div>
      </div>
      <div className="scanline" />
    </div>
  );
}
