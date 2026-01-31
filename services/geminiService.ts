import { GoogleGenAI } from "@google/genai";
import { Book } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBookAnalysis = async (book: Book, query: string): Promise<string> => {
  try {
    const prompt = `
      You are an expert librarian and historian specializing in traditional culture and history (specifically related to the themes of "5000 Years" - Chinese history, philosophy, arts).
      
      The user is asking about the book: "${book.title}" by ${book.author}.
      Book Description: ${book.description}
      Category: ${book.category}

      User Query: ${query}

      Provide a helpful, insightful, and polite response. If the query is general (like "tell me more"), elaborate on the themes of the book and its potential historical context. 
      Keep the response concise (under 200 words) but informative.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    return response.text || "I apologize, I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the library archives right now. Please try again later.";
  }
};