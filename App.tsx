
import React, { useState } from 'react';
import SetupModal from './components/SetupModal';
import ChatInterface from './components/ChatInterface';
import { UserData } from './types';

const App: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);

  const handleSetupComplete = (data: UserData) => {
    setUserData(data);
  };

  return (
    <div className="min-h-[100dvh] relative overflow-hidden bg-[#fffcfd] selection:bg-rose-200 selection:text-rose-900">
      {/* Background Aesthetic Layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-rose-200/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[80%] h-[80%] bg-pink-100/30 rounded-full blur-[120px]"></div>
      </div>

      {!userData ? (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 relative z-10">
          <div className="text-center mb-8 space-y-4 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-1000">
            <div className="inline-block p-4 bg-white rounded-3xl shadow-soft mb-2">
              <i className="fas fa-heart text-rose-500 text-5xl animate-heartbeat"></i>
            </div>
            <h1 className="text-6xl sm:text-7xl font-romantic text-rose-600 drop-shadow-sm">RubuRomance</h1>
            <p className="text-rose-900 font-medium text-sm tracking-wide opacity-80 max-w-xs mx-auto">
              WHERE EVERY WORD IS A WHISPER OF LOVE
            </p>
          </div>
          <SetupModal onComplete={handleSetupComplete} />
        </div>
      ) : (
        <div className="relative z-10 animate-in fade-in duration-1000">
          <ChatInterface userData={userData} />
        </div>
      )}

      {/* Floating Petals / Hearts */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-[1]">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i}
            className="absolute text-rose-400/20 text-xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `bounce ${4 + Math.random() * 4}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: 0.2 + Math.random() * 0.3
            }}
          >
            <i className={`fas ${i % 2 === 0 ? 'fa-heart' : 'fa-certificate'}`}></i>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
