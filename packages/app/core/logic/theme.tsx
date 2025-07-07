import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setColorsMode } from '@design/colors';
import { setPageStylesMode } from '@design/layout';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'simplipass_theme_mode';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      setModeState(stored as ThemeMode);
    }
  }, []);

  useEffect(() => {
    setColorsMode(mode);
    setPageStylesMode(mode);
  }, [mode]);

  const setMode = (mode: ThemeMode) => {
    setModeState(mode);
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  };

  const toggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeProvider');
  return ctx;
}; 