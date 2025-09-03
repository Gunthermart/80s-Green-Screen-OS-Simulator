import React from 'react';

interface TutorialModalProps {
  onDismiss: () => void;
  t: { [key: string]: string };
}

const TutorialModal: React.FC<TutorialModalProps> = ({ onDismiss, t }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
    >
      <div className="bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full text-center animate-fade-scale-in">
        <h2 id="tutorial-title" className="text-3xl font-bold mb-6 text-white">{t.howToPlay}</h2>
        
        <ul className="space-y-4 text-left text-lg text-gray-300 mb-8">
          <li className="flex items-center gap-4">
            <span className="text-3xl">👋</span>
            <span>{t.tutorialPan}</span>
          </li>
          <li className="flex items-center gap-4">
            <span className="text-3xl">🔍</span>
            <span>{t.tutorialZoom}</span>
          </li>
          <li className="flex items-center gap-4">
            <span className="text-3xl">📍</span>
            <span>{t.tutorialGuess}</span>
          </li>
        </ul>

        <button
          onClick={onDismiss}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors"
        >
          {t.tutorialDismiss}
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

export default TutorialModal;
