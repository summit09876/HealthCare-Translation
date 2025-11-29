import { Language } from './types';

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', voiceCode: 'en-US' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', voiceCode: 'es-ES' },
  { code: 'fr', name: 'French', flag: '🇫🇷', voiceCode: 'fr-FR' },
  { code: 'de', name: 'German', flag: '🇩🇪', voiceCode: 'de-DE' },
  { code: 'zh', name: 'Chinese (Mandarin)', flag: '🇨🇳', voiceCode: 'zh-CN' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', voiceCode: 'hi-IN' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', voiceCode: 'ar-SA' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹', voiceCode: 'pt-BR' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', voiceCode: 'ja-JP' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', voiceCode: 'ru-RU' },
];

export const DEFAULT_SOURCE_LANG = LANGUAGES[0]; // English
export const DEFAULT_TARGET_LANG = LANGUAGES[1]; // Spanish

export const PLACEHOLDER_TEXTS = {
  IDLE: "Tap the microphone to start speaking...",
  RECORDING: "Listening... (Tap to stop)",
  PROCESSING: "Translating medical terminology...",
  ERROR: "Something went wrong. Please try again."
};