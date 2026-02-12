
import { GoogleGenAI } from "@google/genai";

export const generateWorkshopImage = async (tags: string[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  const prompt = `A high-end luxury furniture piece for Lava Interior. Features: ${tags.join(', ')}. White and gold aesthetic with deep green accents, professional studio lighting, 8k resolution, elegant interior background.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
};
