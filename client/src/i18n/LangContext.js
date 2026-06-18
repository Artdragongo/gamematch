import React, { createContext, useContext, useState, useCallback } from 'react';
import { translations } from './translations';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem('gm_lang') || 'en'; } catch { return 'en'; }
  });

  const setLang = useCallback((l) => {
    setLangState(l);
    try { localStorage.setItem('gm_lang', l); } catch {}
  }, []);

  const t = translations[lang] || translations.en;

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be inside LangProvider');
  return ctx;
}
