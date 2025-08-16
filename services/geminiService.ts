import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const PROMPT_SCENE_DESCRIBER = 'Describe detalladamente los objetos, personas y la escena que se ven en esta imagen, proporcionando contexto relevante para una persona con discapacidad visual.';

const generateContentFromImage = async (prompt: string, imageBase64: string): Promise<string> => {
  try {
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64,
      },
    };

    const textPart = {
      text: prompt,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating content from Gemini:", error);
    throw new Error("No se pudo obtener una respuesta del asistente de IA.");
  }
};

export const describeSceneFromImage = async (imageBase64: string): Promise<string> => {
  return generateContentFromImage(PROMPT_SCENE_DESCRIBER, imageBase64);
};