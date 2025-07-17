import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setColorsMode } from '@common/ui/design/colors';
import { setPageStylesMode } from '@common/ui/design/layout';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'simplipass_theme_mode';

export const ThemeProvider: React.FC<{ children: ReactNode; mode?: ThemeMode }> = ({ children, mode }) => {
  const [internalMode, setInternalMode] = useState<ThemeMode>('light');

  // If mode is provided, always use it
  const effectiveMode = mode ?? internalMode;

  useEffect(() => {
    if (mode) {
      setInternalMode(mode);
      setColorsMode(mode);
      setPageStylesMode(mode);
      return;
    }
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      setInternalMode(stored as ThemeMode);
    }
  }, [mode]);

  useEffect(() => {
    setColorsMode(effectiveMode);
    setPageStylesMode(effectiveMode);
  }, [effectiveMode]);

  const setMode = (newMode: ThemeMode) => {
    setInternalMode(newMode);
    localStorage.setItem(THEME_STORAGE_KEY, newMode);
  };

  const toggleMode = () => {
    setMode(effectiveMode === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ mode: effectiveMode, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeProvider');
  return ctx;
}; 