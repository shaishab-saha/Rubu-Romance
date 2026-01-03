
import React from 'react';
import { Message, UserData } from '../types';

interface MessageBubbleProps {
  message: Message;
  userData: UserData;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, userData }) => {
  const isModel = message.role === 'model';
  
  return (
    <div className={`flex ${isModel ? 'justify-start' : 'justify-end'} mb-4 px-1 sm:px-2 animate-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex max-w-[92%] sm:max-w-[85%] ${isModel ? 'flex-row' : 'flex-row-reverse'} items-end gap-2`}>
        {isModel && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border border-rose-200 bg-rose-50 flex items-center justify-center shadow-sm">
            {userData.partnerImage ? (
              <img src={userData.partnerImage} alt={userData.partnerName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-rose-500 text-[10px] font-bold uppercase tracking-tighter">{userData.partnerName.substring(0, 2)}</span>
            )}
          </div>
        )}
        
        <div className={`
          relative px-4 py-2.5 rounded-[1.2rem] shadow-sm
          ${isModel 
            ? 'bg-white text-gray-800 rounded-bl-none border border-rose-100' 
            : 'bg-rose-600 text-white rounded-br-none shadow-md font-medium'
          }
        `}>
          <p className="text-[14px] sm:text-[15px] leading-relaxed whitespace-pre-wrap">
            {message.text}
          </p>
          <span className={`text-[8px] mt-1.5 block font-bold tracking-widest uppercase opacity-40 text-right ${isModel ? 'text-gray-400' : 'text-rose-100'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
