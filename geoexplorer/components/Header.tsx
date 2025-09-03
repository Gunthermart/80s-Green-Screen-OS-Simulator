import React from 'react';
import GlobeIcon from './icons/GlobeIcon';

interface HeaderProps {
  round: number;
  maxRounds: number;
  score: number;
  t: { [key: string]: string };
}

const Header: React.FC<HeaderProps> = ({ round, maxRounds, score, t }) => {
  return (
    <header className="w-full max-w-7xl mx-auto p-4 flex justify-between items-center bg-gray-900/50 backdrop-blur-sm rounded-b-lg">
      <div className="flex items-center gap-2">
        <GlobeIcon className="w-6 h-6 text-indigo-400" />
        <h1 className="text-xl font-bold tracking-tight">GeoExplorer AI</h1>
      </div>
      <div className="flex items-center gap-6 text-lg">
        <div className="text-gray-400">
          {t.round}: <span className="font-bold text-white">{round} / {maxRounds}</span>
        </div>
        <div className="text-gray-400">
          {t.score}: <span className="font-bold text-white">{score.toLocaleString()}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
