import React, { useReducer, useCallback, useEffect } from 'react';
import { GameState, Location, Point, Language, Difficulty, Action } from './types';
import { LOCATIONS, DIFFICULTY_SETTINGS } from './constants';
import { generateLocationDescription } from './services/geminiService';
import { calculateDistance, getScore } from './utils/geo';
import StartScreen from './components/StartScreen';
import Header from './components/Header';
import DescriptionPanel from './components/DescriptionPanel';
import Map from './components/Map';
import ResultModal from './components/ResultModal';
import GameOverScreen from './components/GameOverScreen';
import Loader from './components/Loader';
import TutorialModal from './components/TutorialModal';
import translations from './translations';

type AppState = {
  gameState: GameState;
  locations: Location[];
  currentRound: number;
  totalScore: number;
  currentLocation: Location | null;
  description: string;
  guess: Point | null;
  distance: number | null;
  roundScore: number;
  isLoading: boolean;
  error: string | null;
  language: Language;
  difficulty: Difficulty;
  maxRounds: number;
  guessHistory: Point[];
  showTutorial: boolean;
};

const initialState: AppState = {
  gameState: GameState.START,
  locations: [],
  currentRound: 1,
  totalScore: 0,
  currentLocation: null,
  description: '',
  guess: null,
  distance: null,
  roundScore: 0,
  isLoading: false,
  error: null,
  language: 'en',
  difficulty: 'medium',
  maxRounds: DIFFICULTY_SETTINGS.medium.rounds,
  guessHistory: [],
  showTutorial: false,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...initialState,
        language: state.language,
        showTutorial: state.showTutorial,
        gameState: GameState.LOADING,
        difficulty: action.payload.difficulty,
        maxRounds: DIFFICULTY_SETTINGS[action.payload.difficulty].rounds,
        locations: action.payload.locations,
      };
    case 'LOAD_ROUND_START':
      return {
        ...state,
        isLoading: true,
        error: null,
        guess: null,
        distance: null,
        roundScore: 0,
        description: '',
      };
    case 'LOAD_ROUND_SUCCESS':
      return {
        ...state,
        isLoading: false,
        currentLocation: action.payload.location,
        description: action.payload.description,
        gameState: GameState.PLAYING,
      };
    case 'LOAD_ROUND_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };
    case 'SET_GUESS':
      return { ...state, guess: action.payload };
    case 'SUBMIT_GUESS': {
      if (!state.guess || !state.currentLocation) return state;
      const distance = calculateDistance(state.guess.lat, state.guess.lng, state.currentLocation.lat, state.currentLocation.lng);
      const score = getScore(distance);
      return {
        ...state,
        distance,
        roundScore: score,
        totalScore: state.totalScore + score,
        guessHistory: [...state.guessHistory, state.guess],
        gameState: GameState.RESULT,
      };
    }
    case 'NEXT_ROUND':
      return {
        ...state,
        currentRound: state.currentRound + 1,
        gameState: GameState.LOADING,
      };
    case 'END_GAME':
      return { ...state, gameState: GameState.GAME_OVER };
    case 'RESET_GAME':
      return {
        ...initialState,
        language: state.language,
        showTutorial: state.showTutorial,
      };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'SET_TUTORIAL_VISIBILITY':
      return { ...state, showTutorial: action.payload };
    default:
      return state;
  }
}

const App: React.FC = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { gameState, currentRound, totalScore, description, guess, distance, roundScore, isLoading, error, language, difficulty, maxRounds, currentLocation, guessHistory, showTutorial } = state;

  const t = translations[language];

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('geoexplorer_tutorial_seen');
    if (!hasSeenTutorial) {
      dispatch({ type: 'SET_TUTORIAL_VISIBILITY', payload: true });
    }
  }, []);

  const shuffleLocations = useCallback(() => {
    return [...LOCATIONS].sort(() => Math.random() - 0.5);
  }, []);

  const loadRound = useCallback(async (round: number, locations: Location[], lang: Language, diff: Difficulty) => {
    dispatch({ type: 'LOAD_ROUND_START' });
    try {
      const location = locations[round - 1];
      const desc = await generateLocationDescription(location, lang, diff);
      dispatch({ type: 'LOAD_ROUND_SUCCESS', payload: { location, description: desc } });
    } catch (err) {
      console.error(err);
      dispatch({ type: 'LOAD_ROUND_ERROR', payload: { error: t.errorLoading } });
    }
  }, [t.errorLoading]);

  const startGame = useCallback((selectedDifficulty: Difficulty) => {
    const shuffled = shuffleLocations();
    dispatch({ type: 'START_GAME', payload: { difficulty: selectedDifficulty, locations: shuffled } });
  }, [shuffleLocations]);

  useEffect(() => {
    if (gameState === GameState.LOADING && state.locations.length > 0) {
      loadRound(currentRound, state.locations, language, difficulty);
    }
  }, [gameState, currentRound, state.locations, language, difficulty, loadRound]);

  const handleGuess = (point: Point) => {
    dispatch({ type: 'SET_GUESS', payload: point });
  };

  const submitGuess = () => {
    dispatch({ type: 'SUBMIT_GUESS' });
  };

  const nextRound = () => {
    if (currentRound < maxRounds) {
      dispatch({ type: 'NEXT_ROUND' });
    } else {
      dispatch({ type: 'END_GAME' });
    }
  };

  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' });
  };
  
  const dismissTutorial = () => {
    localStorage.setItem('geoexplorer_tutorial_seen', 'true');
    dispatch({ type: 'SET_TUTORIAL_VISIBILITY', payload: false });
  };

  const renderContent = () => {
    if (showTutorial) {
      return <TutorialModal onDismiss={dismissTutorial} t={t} />;
    }
    
    switch (gameState) {
      case GameState.START:
        return <StartScreen onStart={startGame} language={language} onLanguageChange={(lang) => dispatch({ type: 'SET_LANGUAGE', payload: lang })} t={t} />;
      case GameState.GAME_OVER:
        return <GameOverScreen score={totalScore} onPlayAgain={resetGame} t={t} />;
      case GameState.LOADING:
        return <Loader message={t.loadingMessage} />;
      case GameState.PLAYING:
      case GameState.RESULT:
        if (error) {
          return (
            <div className="text-center text-red-400 p-8 bg-gray-800 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">{t.anErrorOccurred}</h2>
              <p>{error}</p>
              <button onClick={() => startGame(difficulty)} className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                {t.tryAgain}
              </button>
            </div>
          );
        }
        const isGuessingDisabled = gameState === GameState.RESULT;
        return (
          <>
            <Header round={currentRound} maxRounds={maxRounds} score={totalScore} t={t} />
            <main className="flex-grow flex flex-col lg:flex-row gap-4 p-4 max-w-7xl mx-auto w-full">
              <DescriptionPanel description={description} t={t} />
              <div className="w-full lg:w-2/3 flex flex-col bg-gray-800 rounded-lg p-4 shadow-lg">
                <Map onGuess={handleGuess} guess={guess} guessHistory={guessHistory} isGuessingDisabled={isGuessingDisabled} />
                <button
                  onClick={submitGuess}
                  disabled={!guess || isGuessingDisabled}
                  className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 text-lg"
                >
                  {t.submitGuess}
                </button>
              </div>
            </main>
            {gameState === GameState.RESULT && currentLocation && distance !== null && (
              <ResultModal
                location={currentLocation}
                distance={distance}
                score={roundScore}
                onNextRound={nextRound}
                isLastRound={currentRound === maxRounds}
                t={t}
                guess={guess}
              />
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-full bg-gray-900 text-gray-200 flex flex-col items-center justify-center">
      {renderContent()}
    </div>
  );
};

export default App;
