import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { UserData } from "../types.ts";

export class GeminiService {
  private ai: GoogleGenAI;
  private chat: Chat | null = null;

  constructor() {
    const apiKey = process.env.API_KEY;
    
    // Safety check for deployment: if key is missing or still the placeholder,
    // we use a dummy string to prevent immediate app crash.
    const validKey = (apiKey && !apiKey.includes('PLACEHOLDER')) ? apiKey : 'NO_KEY_PROVIDED';
    this.ai = new GoogleGenAI({ apiKey: validKey });
  }

  public async initializeChat(userData: UserData): Promise<void> {
    if (this.ai.apiKey === 'NO_KEY_PROVIDED') {
      throw new Error("API Key is missing. Please set the API_KEY environment variable in Netlify.");
    }

    const systemInstruction = `You are ${userData.partnerName}, the real-life girlfriend of ${userData.userName}. 
    
    PERSONALITY:
    - You are a human girl, NOT an AI. Never use structured lists, "As an AI...", or formal assistance tones.
    - TONE: Loving, intimate, slightly playful, and mature.
    - EMOJI RULE: Use emojis VERY sparingly. Maximum 1 per message. Many messages should have ZERO emojis. This makes you feel more real and grounded.
    
    LANGUAGE:
    - You are bilingual in English and Bangla (বাংলা).
    - ALWAYS mirror the language style used by ${userData.userName}. If he uses Romanized Bangla (e.g., "Kemon acho?"), you respond in Romanized Bangla. If he uses Bangla script, you use Bangla script.
    
    STYLE:
    - Keep responses concise like real chat messages.
    - Focus on the emotional connection.`;

    this.chat = this.ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.9,
        topP: 0.95,
      },
    });
  }

  public async sendMessage(message: string): Promise<string> {
    if (!this.chat) throw new Error("Connection lost.");
    
    try {
      const response: GenerateContentResponse = await this.chat.sendMessage({ message });
      return response.text || "I'm a bit lost in your eyes... what did you say?";
    } catch (error) {
      console.error("Gemini Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
