export interface Language {
  code: string;
  name: string;
  flag: string;
  voiceCode: string; // BCP 47 language tag for SpeechSynthesis
}

export interface TranslationResult {
  original: string;
  translated: string;
  detected_language?: string;
  medical_context_note?: string; // Optional context about medical terms used
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  translation?: string;
  language: string; // The language the text is in
  timestamp: number;
  medicalNote?: string;
}

export enum AppState {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  PROCESSING = 'PROCESSING',
  SPEAKING = 'SPEAKING',
  ERROR = 'ERROR'
}