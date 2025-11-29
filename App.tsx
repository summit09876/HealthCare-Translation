import React, { useState, useEffect, useRef } from 'react';
import { LanguageSelector } from './components/LanguageSelector';
import { HistoryItem } from './components/HistoryItem';
import { DEFAULT_SOURCE_LANG, DEFAULT_TARGET_LANG } from './constants';
import { Language, AppState, Message, TranslationResult } from './types';
import { translateText } from './services/geminiService';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function App() {
  const [sourceLang, setSourceLang] = useState<Language>(DEFAULT_SOURCE_LANG);
  const [targetLang, setTargetLang] = useState<Language>(DEFAULT_TARGET_LANG);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [history, setHistory] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
    } else {
      setErrorMsg("Web Speech API is not supported in this browser.");
    }
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = sourceLang.voiceCode;
    }
  }, [sourceLang]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history, transcript]);

  const handleSpeak = (text: string, voiceLang: string) => {
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synthRef.current.getVoices();
    let voice = voices.find(v => v.lang === voiceLang);
    if (!voice) {
        voice = voices.find(v => v.lang.startsWith(voiceLang.split('-')[0]));
    }
    if (voice) {
        utterance.voice = voice;
    }
    utterance.lang = voiceLang;
    utterance.rate = 0.9;
    synthRef.current.speak(utterance);
  };

  const processTranslation = async (text: string) => {
    setAppState(AppState.PROCESSING);
    try {
      const result: TranslationResult = await translateText(text, sourceLang.name, targetLang.name);
      
      const newMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        text: result.original,
        translation: result.translated,
        language: targetLang.voiceCode,
        timestamp: Date.now(),
        medicalNote: result.medical_context_note
      };

      setHistory(prev => [...prev, newMessage]);
      setAppState(AppState.IDLE);
      setTranscript('');

      handleSpeak(result.translated, targetLang.voiceCode);

    } catch (err) {
      console.error(err);
      setErrorMsg("Translation failed. Please retry.");
      setAppState(AppState.ERROR);
      setTimeout(() => setAppState(AppState.IDLE), 3000);
    }
  };

  const toggleRecording = () => {
    if (appState === AppState.RECORDING) {
      recognitionRef.current?.stop();
    } else if (appState === AppState.IDLE || appState === AppState.ERROR) {
      setErrorMsg(null);
      setTranscript('');
      try {
        recognitionRef.current?.start();
        setAppState(AppState.RECORDING);
      } catch (e) {
        console.warn("Recognition start failed", e);
      }
    }
  };

  useEffect(() => {
      if(!recognitionRef.current) return;
      
      recognitionRef.current.onstart = () => {
        setAppState(AppState.RECORDING);
      };

      recognitionRef.current.onresult = (event: any) => {
        let finalTrans = '';
        let interimTrans = '';
  
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          } else {
            interimTrans += event.results[i][0].transcript;
          }
        }
  
        if (finalTrans) {
           setTranscript(finalTrans);
           recognitionRef.current.stop();
           processTranslation(finalTrans);
        } else {
          setTranscript(interimTrans);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          setAppState(AppState.IDLE);
          return;
        }
        console.error("Speech error", event.error);
        setErrorMsg("Listening error. Try again.");
        setAppState(AppState.IDLE);
      };
      
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceLang, targetLang]);

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  };

  const clearHistory = () => {
    setHistory([]);
    setTranscript('');
    setErrorMsg(null);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 bg-grid-pattern text-slate-800 font-sans overflow-hidden selection:bg-medical-200">
      
      {/* Fixed Header with Options */}
      <header className="fixed top-0 left-0 right-0 z-30 glass-nav border-b border-slate-200 shadow-sm transition-all duration-300">
        <div className="max-w-3xl mx-auto px-4 py-3">
          {/* Logo Row */}
          <div className="flex items-center justify-between mb-3">
             <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-medical-600 to-medical-700 flex items-center justify-center text-white shadow-lg shadow-medical-500/20 border border-white/20">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06l-3.22-3.22V16.5a.75.75 0 01-1.5 0V4.81L8.03 8.03a.75.75 0 01-1.06-1.06l4.5-4.5zM3 15.75a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                   </svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">MediTranslate</h1>
                  <span className="text-[10px] font-semibold text-medical-600 tracking-wider uppercase">Professional Edition</span>
                </div>
             </div>
             
             {history.length > 0 && (
               <button onClick={clearHistory} className="group p-2 flex items-center gap-1.5 text-slate-400 hover:text-red-600 transition-colors bg-white border border-slate-200 rounded-lg hover:border-red-200 shadow-sm">
                  <span className="text-[10px] font-bold uppercase hidden sm:block">Clear</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                  </svg>
               </button>
             )}
          </div>

          {/* Controls Row */}
          <div className="flex items-end justify-between gap-3 bg-slate-50/50 p-2 rounded-2xl border border-slate-200/50 backdrop-blur-sm">
            <LanguageSelector 
              label="Patient Speaks" 
              selected={sourceLang} 
              onSelect={setSourceLang} 
              disabled={appState === AppState.RECORDING || appState === AppState.PROCESSING}
            />
            
            <button 
              onClick={swapLanguages}
              className="mb-0.5 h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-medical-600 hover:border-medical-300 transition-all border border-slate-200 shadow-sm active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </button>

            <LanguageSelector 
              label="Translate To" 
              selected={targetLang} 
              onSelect={setTargetLang}
              disabled={appState === AppState.RECORDING || appState === AppState.PROCESSING}
            />
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 pt-48 pb-32 scroll-smooth hide-scrollbar" ref={chatContainerRef}>
        <div className="max-w-3xl mx-auto flex flex-col justify-end min-h-full">
          {history.length === 0 && !transcript && (
            <div className="flex flex-col items-center justify-center text-center py-20 select-none">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-slate-200 ring-1 ring-slate-100 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-tr from-medical-50 to-transparent opacity-50"></div>
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-medical-300">
                    <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                    <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                 </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-600 mb-2">Ready to Transcribe</h3>
              <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
                Tap the microphone below to begin real-time patient-provider translation.
              </p>
            </div>
          )}

          {history.map((msg) => (
            <HistoryItem key={msg.id} message={msg} onSpeak={handleSpeak} />
          ))}

          {/* Real-time Transcription Bubble */}
          {(appState === AppState.RECORDING || transcript) && (
            <div className="flex justify-end w-full animate-fade-in-up mb-4 pl-12">
              <div className="bg-white text-slate-800 rounded-2xl rounded-tr-none px-6 py-4 border border-medical-200 shadow-lg shadow-medical-100/50 relative overflow-hidden w-full max-w-full">
                <div className="absolute left-0 bottom-0 top-0 w-1 bg-gradient-to-t from-medical-400 to-medical-300"></div>
                <div className="flex items-center gap-3 mb-2 border-b border-slate-50 pb-2">
                   <div className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-medical-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-medical-500"></span>
                   </div>
                   <span className="text-xs font-bold uppercase tracking-widest text-medical-600">Listening to Patient...</span>
                </div>
                <p className="text-lg font-medium text-slate-700">{transcript}</p>
              </div>
            </div>
          )}

          {/* Processing Indicator */}
          {appState === AppState.PROCESSING && (
             <div className="flex justify-start w-full mt-4 animate-fade-in-up pr-12">
               <div className="bg-white px-6 py-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-md flex items-center gap-4">
                 <div className="relative">
                   <div className="w-8 h-8 border-2 border-medical-100 border-t-medical-500 rounded-full animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-2 h-2 bg-medical-500 rounded-full"></div>
                   </div>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">Translating</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide">Analyzing Medical Terms</span>
                 </div>
               </div>
             </div>
          )}
          
          {errorMsg && (
            <div className="w-full flex justify-center mt-6 mb-2 animate-fade-in-up">
               <div className="bg-red-50 text-red-700 px-5 py-3 rounded-xl border border-red-100 text-sm font-semibold shadow-sm flex items-center gap-3 max-w-sm">
                 <div className="p-1 bg-red-100 rounded-full text-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                 </div>
                 {errorMsg}
               </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 pb-8 pt-12 flex justify-center items-end z-20 pointer-events-none bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent">
        <div className="pointer-events-auto transition-transform hover:scale-105 active:scale-95">
          <button
            onClick={toggleRecording}
            disabled={appState === AppState.PROCESSING}
            className={`
              relative w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-2xl
              ${appState === AppState.RECORDING 
                ? 'bg-rose-500 shadow-rose-500/40 rounded-3xl scale-110' 
                : 'bg-gradient-to-b from-medical-500 to-medical-700 shadow-medical-600/30'}
              ${appState === AppState.PROCESSING ? 'opacity-80 grayscale cursor-not-allowed scale-95' : ''}
              border-4 border-white
            `}
          >
            {appState === AppState.RECORDING && (
              <span className="absolute inset-0 rounded-3xl bg-rose-500 animate-ping opacity-20"></span>
            )}
            
            {appState === AppState.RECORDING ? (
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white relative z-10">
                <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9 text-white relative z-10 drop-shadow-md">
                <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}