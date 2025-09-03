import { GoogleGenAI } from "@google/genai";
import { Location, Language, Difficulty } from '../types';
import { languages } from '../translations';
import { DIFFICULTY_SETTINGS } from "../constants";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateLocationDescription(location: Location, languageCode: Language, difficulty: Difficulty): Promise<string> {
  const languageName = languages.find(l => l.code === languageCode)?.name || 'English';
  const difficultyHint = DIFFICULTY_SETTINGS[difficulty].promptHint;
  
  const systemInstruction = `You are a virtual tour guide for a geography guessing game. Your task is to describe a location in a vivid, immersive, first-person paragraph. Do NOT reveal the name of the city, country, or any specific, world-famous landmarks. Regardless of difficulty, always include one relatively straightforward clue (like the general climate, continent, or a very common type of vegetation).`;

  const contents = `Describe this location in ${languageName}: ${location.name}, ${location.country}. Adhere to this difficulty guideline: ${difficultyHint}.`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
        }
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating content from Gemini:", error);
    throw new Error("Failed to communicate with the AI model. Please check your API key and network connection.");
  }
}
