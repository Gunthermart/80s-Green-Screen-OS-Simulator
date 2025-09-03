import { Location, Difficulty } from './types';

export const DIFFICULTY_SETTINGS: Record<Difficulty, { rounds: number; promptHint: string }> = {
  easy: {
    rounds: 3,
    promptHint: 'Provide a few clear, distinct clues, and you can hint at the general region or climate.'
  },
  medium: {
    rounds: 5,
    promptHint: 'Focus on the details: the architecture, the language on non-descript signs, the type of cars, the weather, the surrounding nature, and the general atmosphere.'
  },
  hard: {
    rounds: 7,
    promptHint: 'Provide only subtle, challenging clues. Focus on obscure details like soil color, specific non-famous building materials, or the feeling of the air. Do not mention common architectural styles, obvious climate types, or easily identifiable scripts unless they are very generic.'
  }
};

export const LOCATIONS: Location[] = [
  { name: "Eiffel Tower", country: "France", lat: 48.8584, lng: 2.2945 },
  { name: "Statue of Liberty", country: "USA", lat: 40.6892, lng: -74.0445 },
  { name: "Colosseum", country: "Italy", lat: 41.8902, lng: 12.4922 },
  { name: "Sydney Opera House", country: "Australia", lat: -33.8568, lng: 151.2153 },
  { name: "Pyramids of Giza", country: "Egypt", lat: 29.9792, lng: 31.1342 },
  { name: "Taj Mahal", country: "India", lat: 27.1751, lng: 78.0421 },
  { name: "Machu Picchu", country: "Peru", lat: -13.1631, lng: -72.5450 },
  { name: "Great Wall of China", country: "China", lat: 40.4319, lng: 116.5704 },
  { name: "Christ the Redeemer", country: "Brazil", lat: -22.9519, lng: -43.2105 },
  { name: "Mount Fuji", country: "Japan", lat: 35.3606, lng: 138.7274 },
  { name: "Red Square", country: "Russia", lat: 55.7539, lng: 37.6208 },
  { name: "Burj Khalifa", country: "UAE", lat: 25.1972, lng: 55.2744 },
  { name: "Niagara Falls", country: "Canada", lat: 43.0962, lng: -79.0377 },
  { name: "Santorini", country: "Greece", lat: 36.3932, lng: 25.4615 },
  { name: "Angkor Wat", country: "Cambodia", lat: 13.4125, lng: 103.8667 },
  { name: "Serengeti National Park", country: "Tanzania", lat: -2.3333, lng: 34.8333 },
  { name: "Venice Canals", country: "Italy", lat: 45.4408, lng: 12.3155 },
  { name: "Shibuya Crossing", country: "Japan", lat: 35.6595, lng: 139.7005 },
  { name: "Golden Gate Bridge", country: "USA", lat: 37.8199, lng: -122.4783 },
  { name: "Galápagos Islands", country: "Ecuador", lat: -0.9538, lng: -90.9656 }
];