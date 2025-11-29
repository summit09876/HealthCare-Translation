import React from 'react';
import { Message } from '../types';

interface HistoryItemProps {
  message: Message;
  onSpeak: (text: string, langCode: string) => void;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({ message, onSpeak }) => {
  return (
    <div className="flex flex-col gap-3 mb-8 w-full animate-fade-in-up">
      
      {/* 1. Original Text (Right Side - Patient) */}
      <div className="flex justify-end w-full pl-10">
        <div className="flex flex-col items-end">
          <div className="bg-gradient-to-br from-medical-600 to-medical-700 text-white rounded-2xl rounded-tr-sm px-5 py-3 shadow-md shadow-medical-900/5 relative max-w-full">
            <p className="text-[15px] leading-relaxed font-medium">{message.text}</p>
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-1 mr-1">
             Patient • {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* 2. Translated Text (Left Side - Provider/System) */}
      {message.translation && (
        <div className="flex justify-start w-full pr-8">
          <div className="flex flex-col items-start w-full">
            <div className="w-full bg-white text-slate-800 rounded-2xl rounded-tl-sm p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 relative group overflow-hidden">
              
              {/* Decorative side accent */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-clinical-500"></div>

              <div className="flex justify-between items-start mb-2 pl-2">
                 <span className="text-[10px] font-bold text-clinical-600 uppercase tracking-widest flex items-center gap-1">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                   </svg>
                   Translation
                 </span>
                 <button
                  onClick={() => onSpeak(message.translation!, message.language)}
                  className="text-medical-600 hover:text-medical-800 hover:bg-medical-50 p-1.5 rounded-full transition-all"
                  aria-label="Play translation"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <p className="text-lg leading-relaxed font-semibold text-slate-900 pl-2">
                {message.translation}
              </p>
              
              {message.medicalNote && (
                <div className="mt-4 ml-2 flex items-start gap-3 bg-amber-50 p-3 rounded-lg border border-amber-100">
                   <div className="mt-0.5 bg-amber-100 p-1 rounded-full text-amber-600">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                     </svg>
                   </div>
                   <div className="flex-1">
                     <p className="text-[10px] font-bold text-amber-700 uppercase mb-0.5">Medical Note</p>
                     <p className="text-xs text-amber-800/90 leading-snug font-medium">
                       {message.medicalNote}
                     </p>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};