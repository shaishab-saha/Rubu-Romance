import React, { useState, useRef, useEffect } from 'react';
import { UserData, Message, ChatState } from '../types.ts';
import MessageBubble from './MessageBubble.tsx';
import { geminiService } from '../services/geminiService.ts';

interface ChatInterfaceProps {
  userData: UserData;
}

const ROMANTIC_EMOJIS = [
  '❤️', '💖', '✨', '🥺', '🙈', '🌹', '🦋', '🥰', '😘', '💕', '🧸', '💌', '🌸', '💫', '🫂'
];

const ChatInterface: React.FC<ChatInterfaceProps> = ({ userData }) => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: true,
    error: null,
  });
  const [inputValue, setInputValue] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const init = async () => {
      try {
        await geminiService.initializeChat(userData);
        setChatState(prev => ({
          ...prev,
          messages: [],
          isLoading: false
        }));
      } catch (err: any) {
        setChatState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: err.message || "Something went wrong with our connection..." 
        }));
      }
    };
    init();
  }, [userData]);

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));
    setInputValue('');
    setShowEmojiPicker(false);
    setIsTyping(true);

    try {
      const response = await geminiService.sendMessage(userMessage.text);
      
      // Artificial delay to make it feel like she's actually typing a response
      const typingSpeed = Math.min(Math.max(response.length * 20, 1000), 3000);
      
      setTimeout(() => {
        const modelMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: response,
          timestamp: new Date()
        };
        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, modelMessage],
        }));
        setIsTyping(false);
      }, typingSpeed);

    } catch (err: any) {
      setIsTyping(false);
      setChatState(prev => ({
        ...prev,
        error: err.message || "I missed that, love. Can you repeat it?"
      }));
    }
  };

  const addEmoji = (emoji: string) => {
    setInputValue(prev => prev + emoji);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-2xl mx-auto glass-effect shadow-2xl relative border-x border-rose-100/50">
      <header className="p-4 bg-white/80 backdrop-blur-md border-b border-rose-100 flex items-center justify-between sticky top-0 z-20 shadow-[0_4px_20px_rgba(251,113,133,0.1)]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full border-2 border-rose-400 overflow-hidden bg-rose-50 flex items-center justify-center shadow-inner ring-2 ring-rose-100">
            {userData.partnerImage ? (
              <img src={userData.partnerImage} alt={userData.partnerName} className="w-full h-full object-cover" />
            ) : (
              <i className="fas fa-heart text-rose-500 animate-pulse"></i>
            )}
          </div>
          <div>
            <h1 className="font-serif font-bold text-gray-900 text-lg sm:text-xl leading-tight">{userData.partnerName}</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Listening to your heart</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <button className="text-rose-300 hover:text-rose-500 transition-colors p-2 text-lg active:scale-90">
            <i className="fas fa-video"></i>
          </button>
          <button className="text-rose-300 hover:text-rose-500 transition-colors p-2 text-lg active:scale-90">
            <i className="fas fa-phone"></i>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 relative scroll-smooth bg-gradient-to-b from-rose-50/20 to-transparent">
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.02] overflow-hidden select-none">
          <i className="fas fa-heart text-[350px] text-rose-600"></i>
        </div>
        
        {chatState.messages.length === 0 && !isTyping && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 animate-in fade-in zoom-in duration-700">
            <div className="w-20 h-20 bg-rose-100/50 rounded-full flex items-center justify-center text-rose-400 shadow-inner">
              <i className="fas fa-sparkles text-3xl"></i>
            </div>
            <div className="space-y-2">
              <p className="text-rose-900/60 font-serif italic text-lg">"{userData.partnerName} is waiting to hear from you..."</p>
              <p className="text-rose-300 text-[10px] uppercase tracking-[0.2em] font-bold">Start your story here</p>
            </div>
          </div>
        )}

        {chatState.messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} userData={userData} />
        ))}
        
        {isTyping && (
          <div className="flex justify-start mb-6 px-4 animate-in fade-in duration-300">
            <div className="bg-white/80 px-4 py-3 rounded-2xl rounded-bl-none border border-rose-100 shadow-sm flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce [animation-duration:0.6s]"></div>
              <div className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        
        {chatState.error && (
          <div className="text-center p-4 text-xs text-rose-900 font-bold bg-rose-100/80 backdrop-blur-sm rounded-2xl mx-8 mt-4 border border-rose-200 animate-in shake duration-500">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {chatState.error}
          </div>
        )}
        
        <div ref={messagesEndRef} className="h-4" />
      </main>

      {showEmojiPicker && (
        <div className="absolute bottom-[90px] left-4 right-4 bg-white/95 backdrop-blur-xl border border-rose-100 rounded-[2.5rem] p-5 shadow-[0_10px_40px_rgba(251,113,133,0.2)] z-30 animate-in slide-in-from-bottom-5 duration-300">
          <div className="grid grid-cols-5 sm:grid-cols-8 gap-3">
            {ROMANTIC_EMOJIS.map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => addEmoji(emoji)}
                className="text-3xl hover:scale-125 active:scale-90 transition-transform p-2 grayscale-[0.2] hover:grayscale-0"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      <footer className="p-4 sm:p-6 bg-white border-t border-rose-100 z-20">
        <form onSubmit={handleSend} className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`transition-all p-1 active:scale-90 ${showEmojiPicker ? 'text-rose-600' : 'text-rose-300 hover:text-rose-500'}`}
            >
              <i className="fas fa-heart-circle-plus text-2xl sm:text-3xl"></i>
            </button>
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setShowEmojiPicker(false)}
                placeholder={`Whisper to ${userData.partnerName}...`}
                className="w-full bg-rose-50/30 border-2 border-rose-100 rounded-[1.8rem] py-3.5 px-6 pr-12 focus:outline-none focus:border-rose-400 focus:bg-white transition-all text-[15px] sm:text-base text-gray-900 font-medium placeholder:text-rose-200"
              />
              <button 
                type="button" 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-200 hover:text-rose-400 transition-colors"
              >
                <i className={`${showEmojiPicker ? 'fas fa-times' : 'far fa-face-smile-wink'} text-xl`}></i>
              </button>
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className={`
                w-12 h-12 flex items-center justify-center rounded-[1.2rem] transition-all shadow-lg
                ${!inputValue.trim() || isTyping 
                  ? 'bg-rose-50 text-rose-100 shadow-none cursor-not-allowed' 
                  : 'bg-rose-600 text-white hover:bg-rose-700 active:scale-95 shadow-rose-200 hover:shadow-rose-300'
                }
              `}
            >
              <i className="fas fa-paper-plane text-base"></i>
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
};

export default ChatInterface;