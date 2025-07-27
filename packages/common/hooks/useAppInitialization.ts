/**
 * useAppInitialization Hook - Layer 1: UI Layer
 * 
 * Handles app initialization and authentication state management.
 * Provides simple interface for components to manage app state.
 */

import { useState, useEffect } from 'react';
import { User } from '../core/types/auth.types';
import { auth } from '../core/adapters/auth.adapter';
import { 
  handleAuthStateChange, 
  loadDataAndStartListeners, 
  handleSecretKeyReEntry 
} from '../core/services/appInitialization';

export interface UseAppInitializationReturn {
  // State
  user: User | null;
  isLoading: boolean;
  isUserFullyInitialized: boolean;
  error: string | null;
  
  // Actions
  handleSecretKeyStored: () => Promise<void>;
  clearError: () => void;
}

export const useAppInitialization = (): UseAppInitializationReturn => {
  // Step 1: Initialize UI state
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserFullyInitialized, setIsUserFullyInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 2: Handle authentication state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { user: authUser, isUserFullyInitialized: fullyInitialized } = 
          await handleAuthStateChange(firebaseUser);
        
        setUser(authUser);
        setIsUserFullyInitialized(fullyInitialized);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        setError(errorMessage);
        console.error('[useAppInitialization] Auth state change error:', err);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Step 3: Load data and start listeners when user is fully initialized
  useEffect(() => {
    if (user && isUserFullyInitialized) {
      console.log('[useAppInitialization] User fully initialized, loading data...');
      
      const loadData = async () => {
        try {
          await loadDataAndStartListeners();
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
          setError(errorMessage);
          console.error('[useAppInitialization] Data loading error:', err);
        }
      };
      
      loadData();
    } else {
      console.log('[useAppInitialization] User not fully initialized yet:', { 
        user: !!user, 
        isUserFullyInitialized 
      });
    }
  }, [user, isUserFullyInitialized]);

  // Step 4: Handle secret key re-entry completion
  const handleSecretKeyStored = async (): Promise<void> => {
    try {
      console.log('[useAppInitialization] Secret key stored, checking initialization...');
      
      const { isUserFullyInitialized: fullyInitialized } = await handleSecretKeyReEntry();
      setIsUserFullyInitialized(fullyInitialized);
      
      if (fullyInitialized) {
        console.log('[useAppInitialization] User now fully initialized');
      } else {
        console.log('[useAppInitialization] User still not fully initialized');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check secret key';
      setError(errorMessage);
      console.error('[useAppInitialization] Secret key check error:', err);
    }
  };

  // Step 5: Clear error state
  const clearError = () => {
    setError(null);
  };

  return {
    // State
    user,
    isLoading,
    isUserFullyInitialized,
    error,
    
    // Actions
    handleSecretKeyStored,
    clearError,
  };
}; 