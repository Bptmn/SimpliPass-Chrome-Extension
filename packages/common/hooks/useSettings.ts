/**
 * useSettings Hook - Layer 1: UI Layer
 * 
 * Provides settings management functionality.
 * Handles settings like dark mode, lock timeout, etc.
 */

import { useState, useEffect, useCallback } from 'react';
import { storage } from '@common/core/adapters/platform.storage.adapter';

export interface Settings {
  darkMode: boolean;
  lockTimeout: number; // in minutes
  autoLock: boolean;
  biometricEnabled: boolean;
}

export interface UseSettingsReturn {
  // State
  settings: Settings;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  toggleDarkMode: () => Promise<void>;
  setLockTimeout: (timeout: number) => Promise<void>;
  toggleAutoLock: () => Promise<void>;
  toggleBiometric: () => Promise<void>;
  clearError: () => void;
}

const DEFAULT_SETTINGS: Settings = {
  darkMode: false,
  lockTimeout: 15,
  autoLock: true,
  biometricEnabled: false,
};

export const useSettings = (): UseSettingsReturn => {
  // Step 1: Initialize state
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Step 2: Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const vault = await storage.getVaultFromSecureLocalStorage();
        if (vault?.settings) {
          setSettings({ ...DEFAULT_SETTINGS, ...vault.settings });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load settings';
        setError(errorMessage);
        console.error('[useSettings] Failed to load settings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Step 3: Update settings function
  const updateSettings = useCallback(async (updates: Partial<Settings>) => {
    try {
      setError(null);
      const newSettings = { ...settings, ...updates };
      
      const vault = await storage.getVaultFromSecureLocalStorage();
      await storage.updateVaultInSecureLocalStorage({
        ...vault,
        settings: newSettings,
      });
      setSettings(newSettings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      setError(errorMessage);
      console.error('[useSettings] Failed to update settings:', err);
    }
  }, [settings]);

  // Step 4: Specific setting toggles
  const toggleDarkMode = useCallback(async () => {
    await updateSettings({ darkMode: !settings.darkMode });
  }, [settings.darkMode, updateSettings]);

  const setLockTimeout = useCallback(async (timeout: number) => {
    await updateSettings({ lockTimeout: timeout });
  }, [updateSettings]);

  const toggleAutoLock = useCallback(async () => {
    await updateSettings({ autoLock: !settings.autoLock });
  }, [settings.autoLock, updateSettings]);

  const toggleBiometric = useCallback(async () => {
    await updateSettings({ biometricEnabled: !settings.biometricEnabled });
  }, [settings.biometricEnabled, updateSettings]);

  // Step 5: Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    toggleDarkMode,
    setLockTimeout,
    toggleAutoLock,
    toggleBiometric,
    clearError,
  };
}; 