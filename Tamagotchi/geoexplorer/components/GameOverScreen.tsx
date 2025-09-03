import React from 'react';

interface GameOverScreenProps {
  score: number;
  onPlayAgain: () => void;
  t: { [key: string]: string };
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onPlayAgain, t }) => {
  return (
    <div className="text-center p-8 bg-gray-800 rounded-lg shadow-2xl flex flex-col items-center">
      <h1 className="text-4xl font-bold text-white mb-2">{t.gameOver}</h1>
      <p className="text-lg text-gray-400 mb-4">{t.finalScoreIs}</p>
      <p className="text-7xl font-black text-indigo-400 mb-8 tracking-tight">
        {score.toLocaleString()}
      </p>
      <button
        onClick={onPlayAgain}
        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-lg text-xl transition-transform transform hover:scale-105 duration-300 shadow-lg"
      >
        {t.playAgain}
      </button>
    </div>
  );
};

export default GameOverScreen;
