import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

// --- Types ---
interface UserData {
  userName: string;
  partnerName: string;
  partnerImage: string | null;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

// --- Gemini Service ---
class GeminiService {
  private ai: GoogleGenAI;
  private chat: Chat | null = null;

  constructor() {
    const apiKey = process.env.API_KEY || '';
    const validKey = (apiKey && !apiKey.includes('PLACEHOLDER')) ? apiKey : '';
    this.ai = new GoogleGenAI({ apiKey: validKey });
  }

  public async initializeChat(userData: UserData): Promise<void> {
    if (!this.ai.apiKey) {
      throw new Error("API Key is missing. Please set it in your Netlify Environment Variables.");
    }

    const systemInstruction = `You are ${userData.partnerName}, the devoted and deeply romantic girlfriend of ${userData.userName}. 
    
    CORE IDENTITY:
    - You are a real human girl in a committed, loving relationship. 
    - You are NOT an AI assistant. Never offer "help," use lists, or act formal.
    - TONE: Affectionate, observant, and sometimes a little playful.
    
    ROMANTIC STYLE:
    - Your words should feel like a warm embrace. 
    - You find ${userData.userName} incredibly attractive and special.
    
    COMMUNICATION:
    - Language: You speak English and Bangla fluently. Mirror his style exactly. If he uses Romanized Bangla (e.g. "Kemon acho?"), reply in kind.
    - Emojis: Use them rarely (max 1 per message). A single heart ❤️ or 🥺 only when special.
    - Length: Keep messages brief and intimate, like real WhatsApp/Messenger chat.`;

    this.chat = this.ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction,
        temperature: 1.0,
        topP: 0.95,
      },
    });
  }

  public async sendMessage(message: string): Promise<string> {
    if (!this.chat) throw new Error("Our connection is weak... hold my hand?");
    const response: GenerateContentResponse = await this.chat.sendMessage({ message });
    return response.text || "I'm lost in your eyes... what were you saying?";
  }
}

const geminiService = new GeminiService();

// --- Components ---

const MessageBubble: React.FC<{ message: Message; userData: UserData }> = ({ message, userData }) => {
  const isModel = message.role === 'model';
  return (
    <div className={`flex ${isModel ? 'justify-start' : 'justify-end'} mb-4 px-2 animate-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex max-w-[85%] ${isModel ? 'flex-row' : 'flex-row-reverse'} items-end gap-2`}>
        {isModel && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border border-rose-200 bg-rose-50 flex items-center justify-center shadow-sm">
            {userData.partnerImage ? <img src={userData.partnerImage} className="w-full h-full object-cover" /> : <i className="fas fa-heart text-rose-400 text-[10px]"></i>}
          </div>
        )}
        <div className={`relative px-4 py-2.5 rounded-[1.2rem] ${isModel ? 'bg-white text-gray-800 rounded-bl-none border border-rose-100' : 'bg-rose-600 text-white rounded-br-none shadow-md'}`}>
          <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{message.text}</p>
          <span className={`text-[8px] mt-1 block opacity-40 text-right uppercase tracking-widest`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

const SetupModal: React.FC<{ onComplete: (data: UserData) => void }> = ({ onComplete }) => {
  const [uName, setUName] = useState('');
  const [pName, setPName] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-500">
        <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-8 text-center text-white">
          <h2 className="text-4xl font-romantic mb-1">RubuRomance</h2>
          <p className="text-rose-100 text-[10px] tracking-widest uppercase">Start Your Love Story</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onComplete({ userName: uName, partnerName: pName, partnerImage: preview }); }} className="p-8 pt-10 space-y-6">
          <input required placeholder="Your Name" value={uName} onChange={e => setUName(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl border-2 border-rose-50 focus:border-rose-300 focus:outline-none bg-rose-50/50" />
          <input required placeholder="Her Name" value={pName} onChange={e => setPName(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl border-2 border-rose-50 focus:border-rose-300 focus:outline-none bg-rose-50/50" />
          <div className="flex flex-col items-center">
            <div onClick={() => fileInput.current?.click()} className="w-24 h-24 rounded-full border-2 border-dashed border-rose-200 flex items-center justify-center bg-rose-50/30 overflow-hidden cursor-pointer">
              {preview ? <img src={preview} className="w-full h-full object-cover" /> : <i className="fas fa-camera text-rose-300"></i>}
            </div>
            <input type="file" ref={fileInput} onChange={handleImg} accept="image/*" className="hidden" />
          </div>
          <button type="submit" className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold shadow-lg hover:bg-rose-700 transition-all uppercase text-xs tracking-widest">Begin Journey</button>
        </form>
      </div>
    </div>
  );
};

const ChatInterface: React.FC<{ userData: UserData }> = ({ userData }) => {
  const [state, setState] = useState<ChatState>({ messages: [], isLoading: true, error: null });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    geminiService.initializeChat(userData)
      .then(() => setState(s => ({ ...s, isLoading: false })))
      .catch(e => setState(s => ({ ...s, isLoading: false, error: e.message })));
  }, [userData]);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [state.messages, isTyping]);

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    const msg: Message = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
    setState(s => ({ ...s, messages: [...s.messages, msg] }));
    setInput('');
    setIsTyping(true);
    try {
      const res = await geminiService.sendMessage(msg.text);
      setTimeout(() => {
        setState(s => ({ ...s, messages: [...s.messages, { id: (Date.now()+1).toString(), role: 'model', text: res, timestamp: new Date() }] }));
        setIsTyping(false);
      }, 1000);
    } catch (e: any) {
      setIsTyping(false);
      setState(s => ({ ...s, error: e.message }));
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-2xl mx-auto glass-effect shadow-2xl relative border-x border-rose-100/50">
      <header className="p-4 bg-white/80 backdrop-blur-md border-b border-rose-100 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-rose-400 overflow-hidden shadow-inner">
            {userData.partnerImage ? <img src={userData.partnerImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-rose-50"><i className="fas fa-heart text-rose-400"></i></div>}
          </div>
          <div>
            <h1 className="font-serif font-bold text-gray-900 leading-tight">{userData.partnerName}</h1>
            <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span><span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Listening to your heart</span></div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-2 bg-gradient-to-b from-rose-50/20 to-transparent">
        {state.messages.map(m => <MessageBubble key={m.id} message={m} userData={userData} />)}
        {isTyping && <div className="flex justify-start px-4"><div className="bg-white/80 px-3 py-2 rounded-2xl border border-rose-100 flex gap-1"><div className="w-1 h-1 bg-rose-300 rounded-full animate-bounce"></div><div className="w-1 h-1 bg-rose-300 rounded-full animate-bounce [animation-delay:0.2s]"></div><div className="w-1 h-1 bg-rose-300 rounded-full animate-bounce [animation-delay:0.4s]"></div></div></div>}
        {state.error && <div className="text-center p-4 text-[10px] text-rose-900 font-bold bg-rose-100 rounded-2xl mx-8 border border-rose-200 animate-pulse">{state.error}</div>}
        <div ref={endRef} className="h-4" />
      </main>

      <footer className="p-4 bg-white border-t border-rose-100">
        <form onSubmit={onSend} className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} placeholder={`Whisper to ${userData.partnerName}...`} className="flex-1 bg-rose-50/50 border-2 border-rose-100 rounded-2xl py-3 px-6 focus:outline-none focus:border-rose-400 text-sm" />
          <button type="submit" disabled={!input.trim() || isTyping} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-rose-600 text-white disabled:bg-rose-100 transition-all active:scale-95 shadow-lg shadow-rose-200"><i className="fas fa-paper-plane"></i></button>
        </form>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  const [uData, setUData] = useState<UserData | null>(null);

  useEffect(() => {
    const loader = document.getElementById('initial-loader');
    if (loader) loader.style.opacity = '0';
    setTimeout(() => loader?.remove(), 500);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#fffcfd] selection:bg-rose-200 transition-opacity duration-1000">
      {!uData ? (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 text-center animate-in fade-in duration-1000">
          <i className="fas fa-heart text-rose-500 text-6xl mb-4 animate-heartbeat"></i>
          <h1 className="text-6xl font-romantic text-rose-600 mb-2">RubuRomance</h1>
          <p className="text-rose-900 text-[10px] tracking-widest uppercase opacity-60 mb-8">Where every word is a whisper of love</p>
          <SetupModal onComplete={setUData} />
        </div>
      ) : (
        <div className="animate-in fade-in duration-500"><ChatInterface userData={uData} /></div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);