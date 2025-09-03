import React, { useState } from 'react';
import GlobeIcon from './icons/GlobeIcon';
import { Language, Difficulty } from '../types';
import { languages } from '../translations';

interface StartScreenProps {
  onStart: (difficulty: Difficulty) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  t: { [key: string]: string };
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, language, onLanguageChange, t }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  
  return (
    <div className="text-center p-8 flex flex-col items-center">
      <div className="mb-6">
        <GlobeIcon className="w-24 h-24 text-indigo-400" />
      </div>
      <h1 className="text-5xl font-black tracking-tighter text-white mb-2">{t.title}</h1>
      <p className="text-lg text-gray-400 max-w-lg mx-auto mb-8">
        {t.description}
      </p>

      <div className="mb-8 w-full max-w-sm">
        <h2 className="text-lg font-semibold text-gray-400 mb-3">{t.selectDifficulty}</h2>
        <div className="flex justify-center gap-3 bg-gray-800 p-2 rounded-xl">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map(level => (
            <button
              key={level}
              onClick={() => setSelectedDifficulty(level)}
              className={`w-full capitalize px-4 py-2 rounded-lg font-bold transition-all duration-300 text-base ${
                selectedDifficulty === level
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-transparent text-gray-300 hover:bg-gray-700'
              }`}
            >
              {t[level]}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onStart(selectedDifficulty)}
        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-lg text-xl transition-transform transform hover:scale-105 duration-300 shadow-lg"
      >
        {t.startGame}
      </button>

      <div className="mt-12 flex items-center justify-center gap-4 flex-wrap">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
              language === lang.code
                ? 'bg-indigo-500 text-white shadow-md'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span>{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StartScreen;