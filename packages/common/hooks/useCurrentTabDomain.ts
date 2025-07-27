/**
 * useCurrentTabDomain Hook - Layer 1: UI Layer
 * 
 * Provides current tab domain functionality for Chrome extension.
 * Retrieves current domain from chrome.tabs.
 */

import { useState, useEffect, useCallback } from 'react';

export interface UseCurrentTabDomainReturn {
  // State
  currentDomain: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  refreshDomain: () => Promise<void>;
  clearError: () => void;
}

export const useCurrentTabDomain = (): UseCurrentTabDomainReturn => {
  // Step 1: Initialize state
  const [currentDomain, setCurrentDomain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Step 2: Get current tab domain
  const getCurrentTabDomain = useCallback(async (): Promise<string | null> => {
    try {
      // Check if we're in a Chrome extension environment
      if (typeof chrome === 'undefined' || !chrome.tabs) {
        console.warn('[useCurrentTabDomain] Not in Chrome extension environment');
        return null;
      }

      // Get current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab?.url) {
        console.warn('[useCurrentTabDomain] No active tab or URL found');
        return null;
      }

      // Extract domain from URL
      const url = new URL(tab.url);
      const domain = url.hostname;
      
      console.log('[useCurrentTabDomain] Current domain:', domain);
      return domain;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get current tab domain';
      console.error('[useCurrentTabDomain] Failed to get current tab domain:', err);
      throw new Error(errorMessage);
    }
  }, []);

  // Step 3: Load domain on mount
  useEffect(() => {
    const loadDomain = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const domain = await getCurrentTabDomain();
        setCurrentDomain(domain);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load current domain';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadDomain();
  }, [getCurrentTabDomain]);

  // Step 4: Refresh domain function
  const refreshDomain = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const domain = await getCurrentTabDomain();
      setCurrentDomain(domain);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh domain';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentTabDomain]);

  // Step 5: Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    currentDomain,
    isLoading,
    error,
    refreshDomain,
    clearError,
  };
}; 