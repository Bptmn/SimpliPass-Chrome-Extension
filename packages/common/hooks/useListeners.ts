/**
 * useListeners Hook - Layer 1: UI Layer
 * 
 * Handles authentication and database listeners.
 * Provides centralized listener management for auth state changes and database updates.
 */

import { useEffect, useCallback, useState } from 'react';
import { auth } from '../core/adapters/auth.adapter';
import { databaseListeners } from '../core/services/listenerService';
import { initializeUserData } from '../core/services/userService';
import { User } from '../core/types/auth.types';

export interface UseListenersReturn {
  // State
  user: User | null;
  isUserFullyInitialized: boolean;
  isListening: boolean;
  listenersError: string | null;
  
  // Actions
  startListeners: (userId: string) => Promise<void>;
  stopListeners: () => Promise<void>;
  clearListenersError: () => void;
}

export const useListeners = (): UseListenersReturn => {
  // Initialize listener state
  const [user, setUser] = useState<User | null>(null);
  const [isUserFullyInitialized, setIsUserFullyInitialized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [listenersError, setListenersError] = useState<string | null>(null);

  // Handle authentication state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      try {
        setListenersError(null);
        
        if (firebaseUser) {
          console.log('[useListener] User authenticated:', firebaseUser.uid);
          
          // Initialize user data
          const { user: authUser, hasSecretKey } = await initializeUserData(firebaseUser.uid);
          
          setUser(authUser);
          setIsUserFullyInitialized(hasSecretKey);
          
          // Start listeners if user is fully initialized
          if (hasSecretKey) {
            console.log('[useListener] User fully initialized, starting listeners...');
            await startListeners(firebaseUser.uid);
          }
        } else {
          console.log('[useListener] User signed out');
          setUser(null);
          setIsUserFullyInitialized(false);
          
          // Stop listeners when user signs out
          await stopListeners();
        }
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        setListenersError(errorMessage);
        console.error('[useListener] Auth state change error:', err);
      }
    });

    return () => unsubscribe();
  }, []);

  // Start database listeners
  const startListeners = useCallback(async (userId: string) => {
    try {
      console.log('[useListener] Starting database listeners for user:', userId);
      setListenersError(null);
      
      await databaseListeners.startListeners(userId);
      setIsListening(true);
      
      console.log('[useListener] Database listeners started successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start listeners';
      setListenersError(errorMessage);
      console.error('[useListener] Failed to start listeners:', err);
    }
  }, []);

  // Stop database listeners
  const stopListeners = useCallback(async () => {
    try {
      console.log('[useListener] Stopping database listeners...');
      setListenersError(null);
      
      await databaseListeners.stopListeners();
      setIsListening(false);
      
      console.log('[useListener] Database listeners stopped successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop listeners';
      setListenersError(errorMessage);
      console.error('[useListener] Failed to stop listeners:', err);
    }
  }, []);

  // Clear listeners error
  const clearListenersError = useCallback(() => {
    setListenersError(null);
  }, []);

  return {
    // State
    user,
    isUserFullyInitialized,
    isListening,
    listenersError,
    
    // Actions
    startListeners,
    stopListeners,
    clearListenersError,
  };
}; 