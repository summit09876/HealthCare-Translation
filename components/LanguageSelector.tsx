import React from 'react';
import { LANGUAGES } from '../constants';
import { Language } from '../types';

interface LanguageSelectorProps {
  label: string;
  selected: Language;
  onSelect: (lang: Language) => void;
  disabled?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  label,
  selected,
  onSelect,
  disabled
}) => {
  return (
    <div className="flex flex-col w-full max-w-[45%]">
      <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5 ml-1 truncate flex items-center gap-1">
        {label}
      </label>
      <div className="relative group">
        <select
          value={selected.code}
          onChange={(e) => {
            const lang = LANGUAGES.find(l => l.code === e.target.value);
            if (lang) onSelect(lang);
          }}
          disabled={disabled}
          className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-3 pl-3 pr-8 rounded-xl text-sm font-semibold shadow-sm focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-all disabled:opacity-60 disabled:bg-slate-50 truncate hover:border-medical-300"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-medical-600 group-hover:text-medical-500 transition-colors">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
};