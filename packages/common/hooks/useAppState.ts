/**
 * useAppState Hook - Layer 1: UI Layer
 * 
 * React hook that reads the current app state without triggering initialization.
 * Used by components that need to access app state after initialization is complete.
 */

import { useState, useEffect } from 'react';
import { auth } from '../core/adapters/auth.adapter';
import { storage } from '../core/adapters/platform.storage.adapter';
import { getLocalVault } from '../core/services/vault';
import { getUserSecretKey } from '../core/services/secret';

export interface AppState {
  isInitialized: boolean;
  isAuthenticated: boolean;
  hasLocalData: boolean;
  shouldShowLogin: boolean;
  shouldShowReEnterPassword: boolean;
  shouldRenderApp: boolean;
  error: string | null;
}

export interface UseAppStateReturn {
  // State
  state: AppState;
  user: any | null;
  vault: any | null;
  
  // Actions
  refreshState: () => Promise<void>;
  clearError: () => void;
}

export const useAppState = (): UseAppStateReturn => {
  // Step 1: Initialize UI state
  const [state, setState] = useState<AppState>({
    isInitialized: false,
    isAuthenticated: false,
    hasLocalData: false,
    shouldShowLogin: false,
    shouldShowReEnterPassword: false,
    shouldRenderApp: false,
    error: null,
  });

  const [user, setUser] = useState<any | null>(null);
  const [vault, setVault] = useState<any | null>(null);

  // Step 2: Refresh app state
  const refreshState = async (): Promise<void> => {
    try {
      console.log('[useAppState] Reading current app state...');
      
      // Step 2.1: Check authentication status
      const isAuthenticated = await auth.isAuthenticated();
      
      if (!isAuthenticated) {
        setState({
          isInitialized: true,
          isAuthenticated: false,
          hasLocalData: false,
          shouldShowLogin: true,
          shouldShowReEnterPassword: false,
          shouldRenderApp: false,
          error: null,
        });
        setUser(null);
        setVault(null);
        return;
      }

      // Step 2.2: Load data from secure storage
      const [userSecretKey, userData, vaultData] = await Promise.all([
        getUserSecretKey(),
        storage.getUserFromSecureLocalStorage(),
        getLocalVault(),
      ]);

      const hasLocalData = userSecretKey && userData && vaultData && vaultData.length > 0;

      if (hasLocalData) {
        setState({
          isInitialized: true,
          isAuthenticated: true,
          hasLocalData: true,
          shouldShowLogin: false,
          shouldShowReEnterPassword: false,
          shouldRenderApp: true,
          error: null,
        });
        setUser(userData);
        setVault(vaultData);
      } else {
        setState({
          isInitialized: true,
          isAuthenticated: true,
          hasLocalData: false,
          shouldShowLogin: false,
          shouldShowReEnterPassword: true,
          shouldRenderApp: false,
          error: null,
        });
        setUser(null);
        setVault(null);
      }
      
      console.log('[useAppState] State read successfully');
      
    } catch (error) {
      console.error('[useAppState] Failed to read state:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to read app state';
      
      setState({
        isInitialized: true,
        isAuthenticated: false,
        hasLocalData: false,
        shouldShowLogin: true,
        shouldShowReEnterPassword: false,
        shouldRenderApp: false,
        error: errorMessage,
      });
    }
  };

  // Step 3: Clear error state
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  // Step 4: Read current state on mount
  useEffect(() => {
    refreshState();
  }, []);

  return {
    // State
    state,
    user,
    vault,
    
    // Actions
    refreshState,
    clearError,
  };
}; 