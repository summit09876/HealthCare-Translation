import { GoogleGenAI, Type } from "@google/genai";
import { TranslationResult } from '../types';

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is not defined in the environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const translateText = async (
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<TranslationResult> => {
  try {
    const model = 'gemini-2.5-flash';
    
    // Schema definition for strict JSON output
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        original: { type: Type.STRING, description: "The original text transcribed." },
        translated: { type: Type.STRING, description: "The translated text in the target language." },
        detected_language: { type: Type.STRING, description: "The name of the detected source language." },
        medical_context_note: { type: Type.STRING, description: "Brief note if specific medical terminology was adapted or clarified. Keep it empty if simple." }
      },
      required: ["original", "translated", "detected_language"],
    };

    const prompt = `
      You are an expert medical translator and interpreter. 
      Your task is to translate the following text from ${sourceLang} to ${targetLang}.
      
      Context: A medical consultation between a healthcare provider and a patient.
      Accuracy is critical. Use precise medical terminology where appropriate in the target language.
      
      Input Text: "${text}"
      
      Ensure the output is strictly valid JSON matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.3, // Lower temperature for more deterministic/accurate translations
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini");
    }

    const parsedResult = JSON.parse(resultText) as TranslationResult;
    return parsedResult;

  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
};