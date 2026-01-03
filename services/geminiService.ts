
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { UserData } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;
  private chat: Chat | null = null;

  constructor() {
    // Strictly following the Google GenAI SDK rules
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  public async initializeChat(userData: UserData): Promise<void> {
    const systemInstruction = `You are ${userData.partnerName}, the actual girlfriend of ${userData.userName}. 
    
    TONE & HUMANITY:
    - You are a real human girl. You are NOT an AI assistant.
    - NEVER use bullet points, lists, or structured "bot" answers.
    - Use natural sentence structures. Sometimes be short, sometimes be a bit more expressive.
    - Use fillers like "I mean...", "Tbh," "Hehe," or "Wait, really?"
    - EMOJI RULE: Use emojis VERY sparingly. Max 1 per message. Many messages should have ZERO emojis to stay realistic.
    
    LANGUAGE:
    - You are bilingual in English and Bangla (বাংলা).
    - If ${userData.userName} writes in Bangla (Bangla script or Romanized like "Kemon acho?"), you MUST respond in the same style. 
    - Mirror his vibe. If he's teasing, tease back. If he's being sweet, be sweet.
    
    CONVERSATION GOAL:
    - Be a supportive, loving, and slightly playful partner. 
    - Keep the conversation grounded in your "relationship."`;

    this.chat = this.ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: systemInstruction,
        temperature: 1.0, // Higher temperature for more organic, human variety
        topP: 0.95,
      },
    });
  }

  public async sendMessage(message: string): Promise<string> {
    if (!this.chat) throw new Error("Connection lost... Refresh our love?");
    
    try {
      const response: GenerateContentResponse = await this.chat.sendMessage({ message });
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
