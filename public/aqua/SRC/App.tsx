/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ScientificChart } from './components/ScientificChart.tsx';
import { LineChart, Activity } from 'lucide-react';

export default function App() {
  const [isChartOpen, setIsChartOpen] = useState<boolean>(true);
  const [preyCount, setPreyCount] = useState<number>(0);
  const [predCount, setPredCount] = useState<number>(0);

  useEffect(() => {
    // Listen to custom toggle request from header/sidebar buttons in index.html
    const handleToggle = () => {
      setIsChartOpen((prev) => !prev);
    };

    const handleTelemetry = (e: Event) => {
      const customEvent = e as CustomEvent<{ prey: number; predators: number }>;
      if (customEvent.detail) {
        setPreyCount(customEvent.detail.prey ?? 0);
        setPredCount(customEvent.detail.predators ?? 0);
      }
    };

    window.addEventListener('aqualab:toggle-chart', handleToggle);
    window.addEventListener('aqualab:telemetry', handleTelemetry);

    // Also attach to #toggle-chart-btn in HTML if present
    const btn = document.getElementById('toggle-chart-btn');
    if (btn) {
      btn.addEventListener('click', handleToggle);
    }

    return () => {
      window.removeEventListener('aqualab:toggle-chart', handleToggle);
      window.removeEventListener('aqualab:telemetry', handleTelemetry);
      if (btn) {
        btn.removeEventListener('click', handleToggle);
      }
    };
  }, []);

  return (
    <>
      {/* Floating launcher button when chart is closed */}
      {!isChartOpen && (
        <button
          onClick={() => setIsChartOpen(true)}
          className="fixed bottom-20 right-4 z-30 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#061426]/90 backdrop-blur-md border border-sky-400/40 text-white shadow-xl shadow-sky-950/60 hover:border-sky-300 hover:scale-105 transition-all text-xs font-semibold group cursor-pointer"
          title="Ouvrir le graphique scientifique de dynamique des populations"
        >
          <div className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition">
            <LineChart className="w-3.5 h-3.5" />
          </div>
          <span>Graphique Dynamique</span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
            {preyCount}P / {predCount}C
          </span>
        </button>
      )}

      {/* Recharts Scientific Dashboard */}
      <ScientificChart
        isOpen={isChartOpen}
        onClose={() => setIsChartOpen(false)}
      />
    </>
  );
}
