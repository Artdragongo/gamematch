import React, { createContext, useContext, useState, useEffect } from 'react';

/* Light palette — matches every color already used across the site. */
const LIGHT = {
  bg: '#F8FAFC', surface: '#FFFFFF', surface2: '#F1F5F9', surface3: '#E2E8F0',
  border: '#E5E9F0', borderMid: '#D6DDE8',
  text: '#0F172A', text2: '#334155', text3: '#64748B', text4: '#94A3B8',
  primary: '#3B82F6', primaryHover: '#2563EB', primaryLight: '#EFF6FF', primaryMid: '#BFDBFE',
  indigo: '#6366F1', indigoLight: '#EEF2FF', indigoMid: '#C7D2FE',
  green: '#16A34A', greenLight: '#F0FDF4', greenBorder: '#BBF7D0',
  red: '#DC2626', redLight: '#FEF2F2', redBorder: '#FECACA',
  orange: '#EA580C', orangeLight: '#FFF7ED',
  purple: '#9333EA', purpleLight: '#F3E8FF',
  shadow: '0 6px 20px rgba(59,130,246,0.09), 0 2px 6px rgba(15,23,42,0.04)',
  shadowLg: '0 24px 56px rgba(59,130,246,0.15), 0 8px 20px rgba(15,23,42,0.07)',
};

/* Dark palette — deep navy rather than pure black (easier on the eyes),
   accent colors lightened slightly for contrast against dark surfaces. */
const DARK = {
  bg: '#0B1220', surface: '#151E2E', surface2: '#1C2739', surface3: '#26334A',
  border: '#263449', borderMid: '#334357',
  text: '#F1F5F9', text2: '#CBD5E1', text3: '#94A3B8', text4: '#64748B',
  primary: '#60A5FA', primaryHover: '#3B82F6', primaryLight: '#1E3A5F', primaryMid: '#2C4A73',
  indigo: '#818CF8', indigoLight: '#28264F', indigoMid: '#3A3670',
  green: '#4ADE80', greenLight: '#14291C', greenBorder: '#1E4029',
  red: '#F87171', redLight: '#2E1515', redBorder: '#4A1F1F',
  orange: '#FB923C', orangeLight: '#2E2109',
  purple: '#C084FC', purpleLight: '#2A1D42',
  shadow: '0 6px 20px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.2)',
  shadowLg: '0 24px 56px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.3)',
};

const ThemeContext = createContext(null);

function getInitialTheme() {
  try {
    const saved = localStorage.getItem('gm_theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {}
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('gm_theme', theme); } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  const C = theme === 'dark' ? DARK : LIGHT;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, C }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
