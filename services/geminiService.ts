import { GoogleGenAI, Type } from "@google/genai";
import { Song } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using Flash for low latency responses
const MODEL_NAME = "gemini-2.5-flash"; 

export const getMusicSuggestions = async (vibe: string): Promise<Song[]> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Generate a playlist of 3 songs that match this vibe: "${vibe}". 
      Make up a reason why it fits. 
      The coverUrl should be a placeholder from picsum (e.g. https://picsum.photos/seed/xyz/300/300).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              artist: { type: Type.STRING },
              coverUrl: { type: Type.STRING },
              reason: { type: Type.STRING },
            },
            required: ["title", "artist", "reason"],
          },
        },
      },
    });

    const data = JSON.parse(response.text || "[]");
    
    // Map response to our internal Song type with some defaults
    return data.map((item: any) => ({
      id: crypto.randomUUID(),
      title: item.title,
      artist: item.artist,
      coverUrl: `https://picsum.photos/seed/${item.title.replace(/\s/g, '')}/300/300`, 
      duration: 180 + Math.floor(Math.random() * 60), 
      suggestedBy: 'Gemini',
      reason: item.reason
    }));

  } catch (error) {
    console.error("Gemini Music Error:", error);
    return [];
  }
};

export const searchSongs = async (query: string): Promise<Song[]> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Search for 5 real songs matching the query: "${query}". 
      Return JSON with title, artist.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              artist: { type: Type.STRING },
            },
            required: ["title", "artist"],
          },
        },
      },
    });

    const data = JSON.parse(response.text || "[]");
    return data.map((item: any) => ({
      id: crypto.randomUUID(),
      title: item.title,
      artist: item.artist,
      coverUrl: `https://picsum.photos/seed/${item.title.replace(/\s/g, '') + item.artist}/300/300`,
      duration: 180 + Math.floor(Math.random() * 120),
      suggestedBy: 'User'
    }));
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return [];
  }
};

export const getConversationStarters = async (context: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `We are on a video call. The current context/topic is: "${context}".
      Give me 3 fun, short conversation starter questions to keep the vibe going.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return ["What's everyone's highlight of the week?", "If you could travel anywhere right now, where would it be?", "Seen any good movies lately?"];
  }
};