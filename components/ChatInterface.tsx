
import React, { useState, useRef, useEffect } from 'react';
import { UserData, Message, ChatState } from '../types';
import MessageBubble from './MessageBubble';
import { geminiService } from '../services/geminiService';

interface ChatInterfaceProps {
  userData: UserData;
}

const ROMANTIC_EMOJIS = [
  '❤️', '💖', '✨', '🥺', '🙈', '🌹', '🦋', '💍', 
  '🥰', '😘', '💕', '🧸', '💌', '🌸', '💫', '🫂'
];

const ChatInterface: React.FC<ChatInterfaceProps> = ({ userData }) => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: true,
    error: null,
  });
  const [inputValue, setInputValue] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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
      } catch (err) {
        setChatState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: "I can't seem to reach you... Try refreshing?" 
        }));
      }
    };
    init();
  }, [userData]);

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || chatState.isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true
    }));
    setInputValue('');
    setShowEmojiPicker(false);

    try {
      const response = await geminiService.sendMessage(inputValue);
      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response,
        timestamp: new Date()
      };
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, modelMessage],
        isLoading: false
      }));
    } catch (err) {
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: "Sorry love, I lost my connection for a moment. Can you repeat that?"
      }));
    }
  };

  const addEmoji = (emoji: string) => {
    setInputValue(prev => prev + emoji);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-2xl mx-auto glass-effect shadow-2xl relative border-x border-rose-100/50">
      {/* Header */}
      <header className="p-4 bg-white border-b border-rose-100 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full border-2 border-rose-500 overflow-hidden bg-rose-50 flex items-center justify-center shadow-inner">
            {userData.partnerImage ? (
              <img src={userData.partnerImage} alt={userData.partnerName} className="w-full h-full object-cover" />
            ) : (
              <i className="fas fa-heart text-rose-500"></i>
            )}
          </div>
          <div>
            <h1 className="font-serif font-bold text-gray-900 text-lg sm:text-xl leading-tight">{userData.partnerName}</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Listening...</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <button className="text-rose-400 hover:text-rose-600 transition-colors p-2 text-lg active:scale-90">
            <i className="fas fa-video"></i>
          </button>
          <button className="text-rose-400 hover:text-rose-600 transition-colors p-2 text-lg active:scale-90">
            <i className="fas fa-phone"></i>
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 relative scroll-smooth bg-rose-50/5">
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] overflow-hidden">
          <i className="fas fa-heart text-[300px] text-rose-600"></i>
        </div>
        
        {chatState.messages.length === 0 && !chatState.isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 animate-in fade-in duration-700">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-rose-400">
              <i className="fas fa-envelope-open-text text-2xl"></i>
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium">Say something to {userData.partnerName}...</p>
              <p className="text-rose-300 text-[11px] uppercase tracking-widest mt-1">Her heart is waiting</p>
            </div>
          </div>
        )}

        {chatState.messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} userData={userData} />
        ))}
        
        {chatState.isLoading && (
          <div className="flex justify-start mb-6 px-4">
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-rose-100 shadow-sm flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-pulse"></div>
              <div className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-pulse [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-pulse [animation-delay:0.4s]"></div>
              <span className="text-[10px] text-rose-300 ml-2 font-bold uppercase tracking-tighter">Thinking...</span>
            </div>
          </div>
        )}
        
        {chatState.error && (
          <div className="text-center p-3 text-xs text-rose-800 font-bold bg-rose-100 rounded-xl mx-8 mt-4">
            {chatState.error}
          </div>
        )}
        
        <div ref={messagesEndRef} className="h-4" />
      </main>

      {/* Emoji Quick Select */}
      {showEmojiPicker && (
        <div className="absolute bottom-[85px] left-4 right-4 bg-white/95 backdrop-blur-md border border-rose-100 rounded-[2rem] p-4 shadow-2xl z-30 animate-in slide-in-from-bottom-5 duration-300">
          <div className="grid grid-cols-8 gap-1">
            {ROMANTIC_EMOJIS.map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => addEmoji(emoji)}
                className="text-2xl hover:scale-125 active:scale-90 transition-transform p-1.5"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <footer className="p-3 sm:p-5 bg-white border-t border-rose-100 z-20">
        <form onSubmit={handleSend} className="flex flex-col gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              type="button" 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`transition-all p-1 active:scale-90 ${showEmojiPicker ? 'text-rose-600' : 'text-rose-400 hover:text-rose-600'}`}
            >
              <i className="fas fa-heart-circle-plus text-xl sm:text-2xl"></i>
            </button>
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setShowEmojiPicker(false)}
                placeholder={`Tell ${userData.partnerName} anything...`}
                className="w-full bg-white border-2 border-rose-100 rounded-[1.5rem] py-3.5 px-5 pr-12 focus:outline-none focus:border-rose-400 transition-all text-[15px] sm:text-base text-gray-900 font-medium placeholder:text-rose-200"
              />
              <button 
                type="button" 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-300 hover:text-rose-500 transition-colors p-1"
              >
                <i className={`${showEmojiPicker ? 'fas fa-times' : 'far fa-face-smile-beam'} text-lg sm:text-xl`}></i>
              </button>
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || chatState.isLoading}
              className={`
                w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-lg
                ${!inputValue.trim() || chatState.isLoading 
                  ? 'bg-rose-50 text-rose-100 shadow-none cursor-not-allowed' 
                  : 'bg-rose-600 text-white hover:bg-rose-700 active:scale-95 shadow-rose-200'
                }
              `}
            >
              <i className="fas fa-paper-plane text-sm sm:text-base"></i>
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
};

export default ChatInterface;
