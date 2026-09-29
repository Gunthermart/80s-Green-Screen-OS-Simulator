import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Pause, 
  Play, 
  Trash2, 
  Download, 
  Maximize2, 
  Minimize2, 
  X, 
  Waves, 
  Skull, 
  Fish, 
  Sparkles,
  BarChart2,
  Sliders
} from 'lucide-react';

export interface TelemetryPoint {
  time: string;
  seconds: number;
  prey: number;
  predators: number;
  total: number;
  births: number;
  deaths: number;
  superPredator: number;
}

interface ScientificChartProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScientificChart: React.FC<ScientificChartProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<TelemetryPoint[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(true);
  const [chartType, setChartType] = useState<'area' | 'line'>('area');
  const [timeWindow, setTimeWindow] = useState<'30' | '60' | '120' | 'all'>('60');
  const [showPrey, setShowPrey] = useState<boolean>(true);
  const [showPredators, setShowPredators] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const startTimeRef = useRef<number>(Date.now());

  // Listen to telemetry events from aquarium-engine.js or poll window.AQUALAB
  useEffect(() => {
    const handleTelemetry = (e: Event) => {
      if (!isRecording) return;
      const customEvent = e as CustomEvent<{
        prey: number;
        predators: number;
        births?: number;
        deaths?: number;
        superPredator?: boolean;
      }>;
      const detail = customEvent.detail;
      if (!detail) return;

      const elapsedSec = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const mins = Math.floor(elapsedSec / 60);
      const secs = elapsedSec % 60;
      const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

      const newPoint: TelemetryPoint = {
        time: timeStr,
        seconds: elapsedSec,
        prey: detail.prey ?? 0,
        predators: detail.predators ?? 0,
        total: (detail.prey ?? 0) + (detail.predators ?? 0),
        births: detail.births ?? 0,
        deaths: detail.deaths ?? 0,
        superPredator: detail.superPredator ? 1 : 0
      };

      setData((prev) => {
        const next = [...prev, newPoint];
        // Keep at most 300 points in memory to ensure 60fps performance
        if (next.length > 300) return next.slice(next.length - 300);
        return next;
      });
    };

    window.addEventListener('aqualab:telemetry', handleTelemetry);

    // Also a fallback interval in case aquarium-engine hasn't dispatched
    const interval = setInterval(() => {
      if (!isRecording) return;
      const win = window as any;
      if (win.AQUALAB && typeof win.AQUALAB.getStats === 'function') {
        const stats = win.AQUALAB.getStats();
        const elapsedSec = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const mins = Math.floor(elapsedSec / 60);
        const secs = elapsedSec % 60;
        const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        const newPoint: TelemetryPoint = {
          time: timeStr,
          seconds: elapsedSec,
          prey: stats.prey ?? 0,
          predators: stats.predators ?? 0,
          total: (stats.prey ?? 0) + (stats.predators ?? 0),
          births: stats.births ?? 0,
          deaths: stats.deaths ?? 0,
          superPredator: stats.superPredatorActive ? 1 : 0
        };

        setData((prev) => {
          // Avoid duplicate timestamp
          if (prev.length > 0 && prev[prev.length - 1].seconds === elapsedSec) {
            return prev;
          }
          const next = [...prev, newPoint];
          if (next.length > 300) return next.slice(next.length - 300);
          return next;
        });
      }
    }, 1000);

    return () => {
      window.removeEventListener('aqualab:telemetry', handleTelemetry);
      clearInterval(interval);
    };
  }, [isRecording]);

  // Filtered dataset according to selected time window
  const filteredData = useMemo(() => {
    if (timeWindow === 'all' || data.length === 0) return data;
    const windowSeconds = parseInt(timeWindow, 10);
    const lastSecond = data[data.length - 1].seconds;
    return data.filter((d) => d.seconds >= lastSecond - windowSeconds);
  }, [data, timeWindow]);

  // Key metrics calculation
  const metrics = useMemo(() => {
    if (data.length === 0) {
      return {
        currentPrey: 0,
        currentPred: 0,
        ratio: '0.0',
        minPrey: 0,
        maxPrey: 0,
        minPred: 0,
        maxPred: 0,
        preyTrend: 0,
        ecosystemState: 'Initialisation...'
      };
    }
    const current = data[data.length - 1];
    const prev5 = data[Math.max(0, data.length - 6)];
    const preyDiff = current.prey - (prev5?.prey ?? current.prey);

    const allPreys = data.map((d) => d.prey);
    const allPreds = data.map((d) => d.predators);

    const minPrey = Math.min(...allPreys);
    const maxPrey = Math.max(...allPreys);
    const minPred = Math.min(...allPreds);
    const maxPred = Math.max(...allPreds);

    const ratio = current.predators > 0 ? (current.prey / current.predators).toFixed(1) : '∞';

    let ecosystemState = 'Équilibre dynamique';
    if (current.prey > 180) {
      ecosystemState = 'Surpopulation proies (Pression épidémique)';
    } else if (current.predators > 15) {
      ecosystemState = 'Surpression prédatrice intense';
    } else if (current.prey < 20) {
      ecosystemState = 'Risque d\'effondrement trophique';
    } else if (preyDiff > 10) {
      ecosystemState = 'Expansion démographique rapide';
    } else if (preyDiff < -10) {
      ecosystemState = 'Forte prédation en cours';
    }

    return {
      currentPrey: current.prey,
      currentPred: current.predators,
      ratio,
      minPrey,
      maxPrey,
      minPred,
      maxPred,
      preyTrend: preyDiff,
      ecosystemState
    };
  }, [data]);

  // Export CSV
  const handleExportCSV = () => {
    if (data.length === 0) return;
    const header = 'Temps (s),Horodatage,Proies,Prédateurs,Total,Naissances,Morts,SuperPrédateur\n';
    const rows = data
      .map(
        (d) =>
          `${d.seconds},"${d.time}",${d.prey},${d.predators},${d.total},${d.births},${d.deaths},${d.superPredator}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aqualab-lotka-volterra-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Clear data
  const handleClear = () => {
    setData([]);
    startTimeRef.current = Date.now();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-40 transition-all duration-300 ease-out font-sans ${
        isExpanded
          ? 'inset-3 md:inset-6 max-w-none'
          : 'bottom-20 right-4 w-[95vw] md:w-[620px] max-h-[82vh]'
      }`}
      style={{
        pointerEvents: 'auto'
      }}
    >
      <div className="relative flex flex-col h-full bg-[#061426]/90 backdrop-blur-2xl border border-sky-500/25 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden text-slate-100">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-sky-500/20 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  Dynamique des Populations
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    Lotka-Volterra
                  </span>
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {isRecording ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                    Flux télémétrique en direct (1 Hz)
                  </span>
                ) : (
                  <span className="text-amber-400">Acquisition en pause</span>
                )}
              </p>
            </div>
          </div>

          {/* Window control buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsRecording(!isRecording)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition"
              title={isRecording ? 'Mettre en pause' : 'Reprendre l\'enregistrement'}
            >
              {isRecording ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-rose-400 transition"
              title="Effacer l'historique"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleExportCSV}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-sky-400 transition"
              title="Exporter les données (CSV)"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition hidden sm:block"
              title={isExpanded ? 'Réduire' : 'Agrandir'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/30 border border-slate-700 text-slate-400 hover:text-rose-300 transition"
              title="Fermer le panneau"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Real-time KPI summary badges */}
        <div className="grid grid-cols-4 gap-2 p-3 bg-slate-950/40 border-b border-sky-500/15 text-xs">
          <div className="bg-sky-500/10 border border-sky-500/25 rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-sky-400">
              <span className="flex items-center gap-1 font-medium text-[11px]">
                <Fish className="w-3.5 h-3.5" /> Proies
              </span>
              {metrics.preyTrend >= 0 ? (
                <TrendingUp className="w-3 h-3 text-emerald-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-rose-400" />
              )}
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-white">{metrics.currentPrey}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                [{metrics.minPrey}-{metrics.maxPrey}]
              </span>
            </div>
          </div>

          <div className="bg-rose-500/10 border border-rose-500/25 rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-rose-400">
              <span className="flex items-center gap-1 font-medium text-[11px]">
                <Skull className="w-3.5 h-3.5" /> Prédateurs
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-white">{metrics.currentPred}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                [{metrics.minPred}-{metrics.maxPred}]
              </span>
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/25 rounded-xl p-2.5 flex flex-col justify-between">
            <span className="text-purple-300 font-medium text-[11px]">Ratio Proie/Préd.</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-purple-200">{metrics.ratio}</span>
              <span className="text-[10px] text-slate-400">: 1</span>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-2.5 flex flex-col justify-between col-span-1">
            <span className="text-emerald-300 font-medium text-[11px] truncate">Statut Écologique</span>
            <div className="mt-1">
              <span className="text-[10.5px] leading-tight font-medium text-emerald-100 line-clamp-2">
                {metrics.ecosystemState}
              </span>
            </div>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-900/30 border-b border-sky-500/10 text-xs">
          {/* Curve Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPrey(!showPrey)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition flex items-center gap-1.5 border ${
                showPrey
                  ? 'bg-sky-500/20 text-sky-300 border-sky-400/50 shadow-sm shadow-sky-500/20'
                  : 'bg-slate-800/50 text-slate-500 border-slate-700/50 opacity-60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              Courbe Proies ({metrics.currentPrey})
            </button>
            <button
              onClick={() => setShowPredators(!showPredators)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition flex items-center gap-1.5 border ${
                showPredators
                  ? 'bg-rose-500/20 text-rose-300 border-rose-400/50 shadow-sm shadow-rose-500/20'
                  : 'bg-slate-800/50 text-slate-500 border-slate-700/50 opacity-60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Courbe Prédateurs ({metrics.currentPred})
            </button>
          </div>

          {/* Time window selection & Chart type toggle */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-[11px]">
              <button
                onClick={() => setTimeWindow('30')}
                className={`px-2 py-0.5 rounded ${timeWindow === '30' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400'}`}
              >
                30s
              </button>
              <button
                onClick={() => setTimeWindow('60')}
                className={`px-2 py-0.5 rounded ${timeWindow === '60' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400'}`}
              >
                60s
              </button>
              <button
                onClick={() => setTimeWindow('120')}
                className={`px-2 py-0.5 rounded ${timeWindow === '120' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400'}`}
              >
                2m
              </button>
              <button
                onClick={() => setTimeWindow('all')}
                className={`px-2 py-0.5 rounded ${timeWindow === 'all' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400'}`}
              >
                Tout
              </button>
            </div>

            <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-[11px]">
              <button
                onClick={() => setChartType('area')}
                className={`px-2 py-0.5 rounded ${chartType === 'area' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400'}`}
                title="Aires remplies"
              >
                Aire
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`px-2 py-0.5 rounded ${chartType === 'line' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400'}`}
                title="Lignes épurées"
              >
                Ligne
              </button>
            </div>
          </div>
        </div>

        {/* Recharts Chart Canvas */}
        <div className={`p-3 relative ${isExpanded ? 'h-[calc(100vh-280px)] min-h-[360px]' : 'h-64'}`}>
          {filteredData.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
              <Activity className="w-8 h-8 text-sky-500/40 animate-pulse" />
              <p className="text-xs">Collecte des premières données démographiques en cours...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={filteredData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="preyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="predGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(56, 189, 248, 0.08)" vertical={false} />
                  <XAxis
                    dataKey="time"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(56, 189, 248, 0.15)' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(56, 189, 248, 0.15)' }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine
                    y={200}
                    stroke="#eab308"
                    strokeDasharray="4 4"
                    label={{ value: 'Seuil Surpopulation', fill: '#eab308', fontSize: 9, position: 'insideTopRight' }}
                  />
                  {showPrey && (
                    <Area
                      type="monotone"
                      dataKey="prey"
                      name="Proies"
                      stroke="#38bdf8"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#preyGradient)"
                      isAnimationActive={false}
                    />
                  )}
                  {showPredators && (
                    <Area
                      type="monotone"
                      dataKey="predators"
                      name="Prédateurs"
                      stroke="#f43f5e"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#predGradient)"
                      isAnimationActive={false}
                    />
                  )}
                </AreaChart>
              ) : (
                <LineChart data={filteredData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(56, 189, 248, 0.08)" vertical={false} />
                  <XAxis
                    dataKey="time"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(56, 189, 248, 0.15)' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(56, 189, 248, 0.15)' }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine
                    y={200}
                    stroke="#eab308"
                    strokeDasharray="4 4"
                    label={{ value: 'Capacité Biologique', fill: '#eab308', fontSize: 9, position: 'insideTopRight' }}
                  />
                  {showPrey && (
                    <Line
                      type="monotone"
                      dataKey="prey"
                      name="Proies"
                      stroke="#38bdf8"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: '#38bdf8', stroke: '#fff', strokeWidth: 1.5 }}
                      isAnimationActive={false}
                    />
                  )}
                  {showPredators && (
                    <Line
                      type="monotone"
                      dataKey="predators"
                      name="Prédateurs"
                      stroke="#f43f5e"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: '#f43f5e', stroke: '#fff', strokeWidth: 1.5 }}
                      isAnimationActive={false}
                    />
                  )}
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </div>

        {/* Footer informative caption */}
        <div className="px-3.5 py-2 bg-slate-950/60 border-t border-sky-500/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span>Points enregistrés: <strong className="text-slate-200">{data.length}</strong></span>
            <span>Échantillonnage: <strong className="text-slate-200">1.0s</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Équation différentielle:</span>
            <span className="text-sky-300 font-bold">dx/dt = αx - βxy | dy/dt = δxy - γy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom Glassmorphic Dark Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const preyItem = payload.find((p: any) => p.dataKey === 'prey');
    const predItem = payload.find((p: any) => p.dataKey === 'predators');
    const preyVal = preyItem ? preyItem.value : null;
    const predVal = predItem ? predItem.value : null;

    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-sky-500/30 rounded-xl p-2.5 shadow-xl text-xs font-mono min-w-[140px]">
        <div className="text-[10px] text-slate-400 pb-1.5 mb-1.5 border-b border-slate-700/60 flex justify-between">
          <span>Horodatage:</span>
          <span className="text-sky-300 font-bold">{label}</span>
        </div>
        {preyVal !== null && (
          <div className="flex items-center justify-between gap-3 text-sky-400 py-0.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400" /> Proies:
            </span>
            <span className="font-bold text-white text-sm">{preyVal}</span>
          </div>
        )}
        {predVal !== null && (
          <div className="flex items-center justify-between gap-3 text-rose-400 py-0.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Prédateurs:
            </span>
            <span className="font-bold text-white text-sm">{predVal}</span>
          </div>
        )}
        {preyVal !== null && predVal !== null && predVal > 0 && (
          <div className="pt-1 mt-1 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between">
            <span>Ratio Proie/Préd:</span>
            <span className="text-purple-300 font-semibold">{(preyVal / predVal).toFixed(2)}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};
