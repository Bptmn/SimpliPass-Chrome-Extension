import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setColorsMode } from '@common/ui/design/colors';
import { setPageStylesMode } from '@common/ui/design/layout';
import { useThemeStorage } from '@common/hooks/useThemeStorage';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode; mode?: ThemeMode }> = ({ children, mode }) => {
  const [internalMode, setInternalMode] = useState<ThemeMode>('light');
  const { getStoredTheme, setStoredTheme } = useThemeStorage();

  // If mode is provided, always use it
  const effectiveMode = mode ?? internalMode;

  useEffect(() => {
    if (mode) {
      setInternalMode(mode);
      setColorsMode(mode);
      setPageStylesMode(mode);
      return;
    }
    
    // Load stored theme
    const loadStoredTheme = async () => {
      const stored = await getStoredTheme();
      if (stored) {
        setInternalMode(stored);
      }
    };
    
    loadStoredTheme();
  }, [mode, getStoredTheme]);

  useEffect(() => {
    setColorsMode(effectiveMode);
    setPageStylesMode(effectiveMode);
  }, [effectiveMode]);

  const setMode = async (newMode: ThemeMode) => {
    setInternalMode(newMode);
    await setStoredTheme(newMode);
  };

  const toggleMode = async () => {
    const newMode = effectiveMode === 'light' ? 'dark' : 'light';
    await setMode(newMode);
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