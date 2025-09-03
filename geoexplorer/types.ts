export type Language = 'en' | 'fr' | 'de' | 'es';
export type Difficulty = 'easy' | 'medium' | 'hard';

export enum GameState {
  START,
  LOADING,
  PLAYING,
  RESULT,
  GAME_OVER
}

export interface Location {
  name: string;
  country: string;
  lat: number;
  lng: number;
}

export interface Point {
  lat: number;
  lng: number;
}

export type Action =
  | { type: 'START_GAME'; payload: { difficulty: Difficulty; locations: Location[] } }
  | { type: 'LOAD_ROUND_START' }
  | { type: 'LOAD_ROUND_SUCCESS'; payload: { location: Location; description: string } }
  | { type: 'LOAD_ROUND_ERROR'; payload: { error: string } }
  | { type: 'SET_GUESS'; payload: Point }
  | { type: 'SUBMIT_GUESS' }
  | { type: 'NEXT_ROUND' }
  | { type: 'END_GAME' }
  | { type: 'RESET_GAME' }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'SET_TUTORIAL_VISIBILITY', payload: boolean };
