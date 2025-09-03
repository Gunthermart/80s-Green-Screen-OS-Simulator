import React, { useMemo, useState, useEffect } from 'react';
import { Location, Point } from '../types';
import PinIcon from './icons/PinIcon';

interface ResultModalProps {
  location: Location;
  distance: number;
  score: number;
  onNextRound: () => void;
  isLastRound: boolean;
  t: { [key: string]: string };
  guess: Point | null;
}

const useAnimatedCounter = (endValue: number, duration: number = 800) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(Math.floor(easedProgress * endValue));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, [endValue, duration]);

  return count;
};

const ResultMap: React.FC<{ actual: Location; guess: Point | null }> = ({ actual, guess }) => {
  const actualPos = useMemo(() => {
    const y = ((-actual.lat + 90) / 180) * 100;
    const x = ((actual.lng + 180) / 360) * 100;
    return { x, y };
  }, [actual]);
  
  const guessPos = useMemo(() => {
    if (!guess) return null;
    const y = ((-guess.lat + 90) / 180) * 100;
    const x = ((guess.lng + 180) / 360) * 100;
    return { x, y };
  }, [guess]);

  return (
    <div className="w-full h-48 bg-gray-700 rounded-lg relative overflow-hidden mb-4">
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg" 
        className="w-full h-full object-cover" 
        alt="Result Map" 
      />
      {actualPos && guessPos && (
        <svg className="absolute top-0 left-0 w-full h-full" style={{ pointerEvents: 'none' }}>
            <line
                x1={`${guessPos.x}%`}
                y1={`${guessPos.y}%`}
                x2={`${actualPos.x}%`}
                y2={`${actualPos.y}%`}
                stroke="white"
                strokeWidth="2"
                strokeDasharray="5 5"
            />
        </svg>
      )}
      <div 
        className="absolute transform -translate-x-1/2 -translate-y-full"
        style={{ left: `${actualPos.x}%`, top: `${actualPos.y}%` }}
        title={`Actual Location: ${actual.name}`}
      >
         <PinIcon className="w-6 h-6 text-green-400 drop-shadow-lg" />
      </div>
      {guessPos && (
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-full"
          style={{ left: `${guessPos.x}%`, top: `${guessPos.y}%` }}
          title="Your Guess"
        >
          <PinIcon className="w-6 h-6 text-red-500 drop-shadow-lg" />
        </div>
      )}
    </div>
  );
};

const ResultModal: React.FC<ResultModalProps> = ({
  location,
  distance,
  score,
  onNextRound,
  isLastRound,
  t,
  guess,
}) => {
  const animatedScore = useAnimatedCounter(score);
  const formattedDistance = Math.round(distance).toLocaleString();

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-title"
    >
      <div className="bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full text-center animate-fade-scale-in">
        <h2 id="result-title" className="text-3xl font-bold mb-2 text-white">{t.roundComplete}</h2>
        <p className="text-gray-400 mb-4">{t.correctLocationWas}</p>
        <p className="text-2xl font-semibold text-indigo-300 mb-4">{location.name}, {location.country}</p>
        
        <ResultMap actual={location} guess={guess} />
        
        <p className="text-lg text-gray-300 mb-6">{t.distanceAway.replace('{distance}', formattedDistance)}</p>

        <div className="bg-gray-700 p-4 rounded-lg mb-8">
            <p className="text-sm text-gray-400 uppercase tracking-wider">{t.roundScore}</p>
            <p className="text-5xl font-bold text-white tracking-tighter">{animatedScore.toLocaleString()}</p>
        </div>

        <button
          onClick={onNextRound}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors"
        >
          {isLastRound ? t.finishGame : t.nextRound}
        </button>
      </div>
       <style>{`
        @keyframes fade-scale-in {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fade-scale-in {
          animation: fade-scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default ResultModal;
