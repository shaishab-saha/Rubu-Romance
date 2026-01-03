
import React, { useState, useRef } from 'react';
import { UserData } from '../types';

interface SetupModalProps {
  onComplete: (data: UserData) => void;
}

const SetupModal: React.FC<SetupModalProps> = ({ onComplete }) => {
  const [userName, setUserName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName && partnerName) {
      onComplete({
        userName,
        partnerName,
        partnerImage: imagePreview,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500 my-auto">
        <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-8 text-center text-white relative">
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl">
            <i className="fas fa-heart text-rose-500 text-2xl animate-heartbeat"></i>
          </div>
          <h2 className="text-4xl font-romantic mb-1">RubuRomance</h2>
          <p className="text-rose-100 text-xs font-medium tracking-wide">DESIGN YOUR PERFECT COMPANION</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-12 space-y-6">
          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-rose-700 uppercase tracking-widest mb-1.5 ml-1">Your Name</label>
              <input
                required
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="The name she'll whisper..."
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-rose-50 focus:border-rose-300 focus:outline-none transition-all bg-rose-50/50 text-gray-800 placeholder:text-rose-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-rose-700 uppercase tracking-widest mb-1.5 ml-1">Her Name</label>
              <input
                required
                type="text"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="What shall I call her?"
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-rose-50 focus:border-rose-300 focus:outline-none transition-all bg-rose-50/50 text-gray-800 placeholder:text-rose-200"
              />
            </div>

            <div className="flex flex-col items-center pt-2">
              <label className="block w-full text-center text-[11px] font-bold text-rose-700 uppercase tracking-widest mb-3">Her Visual Essence</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative group cursor-pointer w-28 h-28 rounded-full border-2 border-dashed border-rose-200 flex items-center justify-center bg-rose-50/30 hover:bg-rose-50 transition-all overflow-hidden ring-4 ring-rose-50 ring-offset-2"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="text-center px-4">
                    <i className="fas fa-image text-rose-300 text-2xl mb-1"></i>
                    <p className="text-[10px] leading-tight text-rose-400 font-semibold">TAP TO UPLOAD</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-100 hover:bg-rose-700 hover:-translate-y-1 active:scale-95 transition-all text-sm tracking-widest uppercase"
          >
            Start Romantic Journey
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupModal;
