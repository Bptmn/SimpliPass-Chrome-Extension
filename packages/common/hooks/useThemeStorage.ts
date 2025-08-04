// useThemeStorage.ts
// This hook manages theme storage business logic:
// - Theme persistence
// - Theme retrieval
// - Theme updates

import { useCallback } from 'react';
import type { ThemeMode } from '@common/ui/design/theme';

const THEME_STORAGE_KEY = 'simplipass_theme_mode';

export const useThemeStorage = () => {
  // Step 1: Get stored theme
  const getStoredTheme = useCallback(async (): Promise<ThemeMode | null> => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'dark' || stored === 'light') {
          return stored as ThemeMode;
        }
      }
      return null;
    } catch (error) {
      console.error('[useThemeStorage] Error getting stored theme:', error);
      return null;
    }
  }, []);

  // Step 2: Set stored theme
  const setStoredTheme = useCallback(async (theme: ThemeMode): Promise<void> => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
      }
    } catch (error) {
      console.error('[useThemeStorage] Error setting stored theme:', error);
    }
  }, []);

  // Step 3: Remove stored theme
  const removeStoredTheme = useCallback(async (): Promise<void> => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(THEME_STORAGE_KEY);
      }
    } catch (error) {
      console.error('[useThemeStorage] Error removing stored theme:', error);
    }
  }, []);

  return {
    getStoredTheme,
    setStoredTheme,
    removeStoredTheme,
  };
}; 