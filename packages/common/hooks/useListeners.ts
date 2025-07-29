/**
 * useListeners.ts - Authentication and Database Listeners Hook
 * 
 * This hook manages the authentication state and database listeners for the application.
 * It handles user authentication, secret key validation, and database synchronization.
 * 
 * IMPORTANT: This hook should only be called from useAppInitialization to ensure
 * proper initialization flow and prevent multiple instances.
 */

import { useState, useCallback, useEffect } from 'react';
import { auth } from '@common/core/adapters/auth.adapter';
import { databaseListeners } from '@common/core/services/listenerService';
import { initializeUserData } from '../core/services/userService';
import type { User } from '@common/core/types/auth.types';

// Return type for the useListeners hook
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

// Module-level flag to prevent multiple instances
let isHookInitialized = false;

export const useListeners = (): UseListenersReturn => {
  // Initialize listener state
  const [user, setUser] = useState<User | null>(null);
  const [isUserFullyInitialized, setIsUserFullyInitialized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [listenersError, setListenersError] = useState<string | null>(null);

  // Start database listeners
  const startListeners = useCallback(async (userId: string) => {
    try {
      // Check if listeners are already active to prevent duplicate starts
      if (databaseListeners.isListening()) {
        console.log('[useListeners] Listeners already active, skipping start');
        setIsListening(true);
        return;
      }
      
      console.log('[useListeners] Starting database listeners for user:', userId);
      setListenersError(null);
      
      await databaseListeners.startListeners(userId);
      setIsListening(true);
      
      console.log('[useListeners] Database listeners started successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start listeners';
      setListenersError(errorMessage);
      console.error('[useListeners] Failed to start listeners:', err);
    }
  }, []);

  // Stop database listeners
  const stopListeners = useCallback(async () => {
    try {
      console.log('[useListeners] Stopping database listeners...');
      setListenersError(null);
      
      await databaseListeners.stopListeners();
      setIsListening(false);
      
      console.log('[useListeners] Database listeners stopped successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop listeners';
      setListenersError(errorMessage);
      console.error('[useListeners] Failed to stop listeners:', err);
    }
  }, []);

  // Clear listeners error
  const clearListenersError = useCallback(() => {
    setListenersError(null);
  }, []);

  // Handle authentication state changes
  useEffect(() => {
    // Prevent multiple instances
    if (isHookInitialized) {
      console.warn('[useListeners] Hook already initialized. This hook should only be called from useAppInitialization.');
      return;
    }

    isHookInitialized = true;
    console.log('[useListeners] Initializing hook');

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      try {
        setListenersError(null);
        
        if (firebaseUser) {
          // Initialize user data
          const { user: authUser, hasSecretKey } = await initializeUserData(firebaseUser.uid);
          
          setUser(authUser);
          setIsUserFullyInitialized(hasSecretKey);
          
          // Start listeners if user is fully initialized
          if (hasSecretKey && !databaseListeners.isListening()) {
            console.log('[useListeners] User fully initialized, starting listeners...');
            await startListeners(firebaseUser.uid);
          } else if (hasSecretKey && databaseListeners.isListening()) {
            // Sync local state with actual listener state
            setIsListening(true);
          }
        } else {
          setUser(null);
          setIsUserFullyInitialized(false);
          
          // Stop listeners when user signs out
          await stopListeners();
        }
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        setListenersError(errorMessage);
        console.error('[useListeners] Auth state change error:', err);
      }
    });

    return () => {
      unsubscribe();
      // Reset flag on cleanup
      isHookInitialized = false;
    };
  }, [startListeners, stopListeners]);

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