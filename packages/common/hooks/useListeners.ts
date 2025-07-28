/**
 * useListeners.ts - Authentication and Database Listeners Hook
 * 
 * This hook manages the authentication state and database listeners for the application.
 * It handles user authentication, secret key validation, and database synchronization.
 * Provides a centralized way to manage user state across the application.
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
  recheckUserInitialization: () => Promise<void>;
}

export const useListeners = (): UseListenersReturn => {
  // Initialize listener state
  const [user, setUser] = useState<User | null>(null);
  const [isUserFullyInitialized, setIsUserFullyInitialized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [listenersError, setListenersError] = useState<string | null>(null);

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

  /**
   * Re-checks user initialization status after secret key is stored
   * This is called after successful password re-entry to update the app state
   */
  const recheckUserInitialization = useCallback(async () => {
    try {
      console.log('[useListener] Re-checking user initialization status...');
      console.log('[useListener] Current state before recheck:', {
        user: !!user,
        isUserFullyInitialized,
        isListening
      });
      
      const currentUser = auth.getCurrentUser();
      if (!currentUser) {
        console.log('[useListener] No authenticated user found during recheck');
        return;
      }

      // Re-initialize user data to check if secret key is now available
      const { user: authUser, hasSecretKey } = await initializeUserData(currentUser.uid);
      
      console.log('[useListener] Re-initialization result:', {
        user: !!authUser,
        hasSecretKey,
        previousIsUserFullyInitialized: isUserFullyInitialized
      });
      
      setUser(authUser);
      setIsUserFullyInitialized(hasSecretKey);
      
      // Start listeners if user is now fully initialized
      if (hasSecretKey && !isListening) {
        console.log('[useListener] User now fully initialized, starting listeners...');
        await startListeners(currentUser.uid);
      }
      
      console.log('[useListener] User initialization recheck complete:', { hasSecretKey });
      console.log('[useListener] State after recheck:', {
        user: !!authUser,
        isUserFullyInitialized: hasSecretKey,
        isListening: hasSecretKey && !isListening ? 'will be true' : isListening
      });
    } catch (err) {
      console.error('[useListener] Error during user initialization recheck:', err);
    }
  }, [isListening, startListeners, user, isUserFullyInitialized]);

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
    recheckUserInitialization,
  };
}; 