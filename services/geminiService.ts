
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratorParams } from "../types";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateGreetings = async (params: GeneratorParams): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Create a set of 5 unique New Year greetings for the transition from 2025 to 2026.
    Target Audience: ${params.audience}
    Desired Tone: ${params.tone}
    Themes: ${params.themes.join(', ')}

    Return a JSON object containing a "category" title and an array of 5 "greetings". 
    Each greeting should include the "text" and a "context" describing its intended use (e.g. "Heartfelt SMS", "Social Media Post").
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.85,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            greetings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  context: { type: Type.STRING }
                },
                required: ["text", "context"]
              }
            }
          },
          required: ["category", "greetings"]
        }
      }
    });

    return response.text || "{}";
  } catch (error) {
    console.error("Gemini Text Error:", error);
    throw new Error("Neural synthesis interrupted. Check your connection.");
  }
};

/**
 * Generates an image with exponential backoff to handle quota limits (429)
 */
export const generateGreetingImage = async (
  text: string, 
  themes: string[], 
  tone: string, 
  retryCount = 0
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `A premium, atmospheric, and highly aesthetic background for a 2026 New Year greeting. 
  Themes: ${themes.join(', ')}. 
  Style: ${tone}. 
  Visual vibe: Ethereal, clean, cinematic lighting, professional digital art. 
  NO TEXT IN THE IMAGE. 
  The image should capture the feeling of a new era or a visionary future.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("Neural art engine returned no data.");
  } catch (error: any) {
    // Handle Quota/Rate Limit Errors with Exponential Backoff
    if (error?.status === 'RESOURCE_EXHAUSTED' || error?.message?.includes('429')) {
      if (retryCount < 2) {
        const backoff = Math.pow(3, retryCount) * 2000; // Staggered retries: 2s, 6s
        await delay(backoff);
        return generateGreetingImage(text, themes, tone, retryCount + 1);
      }
    }
    throw error;
  }
};
