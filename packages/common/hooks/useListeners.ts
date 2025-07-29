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
import { databaseListeners, authListeners } from '@common/core/services/listenerService';
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

  // Start listeners (calls both start functions from listenerService)
  const startListeners = useCallback(async (userId: string) => {
    try {
      // Check if listeners are already active to prevent duplicate starts
      if (databaseListeners.isActive() || authListeners.isActive()) {
        console.log('[useListeners] Listeners already active, skipping start');
        setIsListening(true);
        return;
      }
      
      console.log('[useListeners] Starting all listeners for user:', userId);
      setListenersError(null);
      
      // Start auth listeners first
      authListeners.start();
      
      // Then start database listeners
      await databaseListeners.start(userId);
      
      setIsListening(true);
      console.log('[useListeners] All listeners started successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start listeners';
      setListenersError(errorMessage);
      console.error('[useListeners] Failed to start listeners:', err);
    }
  }, []);

  // Stop listeners (calls both stop functions from listenerService)
  const stopListeners = useCallback(async () => {
    try {
      console.log('[useListeners] Stopping all listeners...');
      setListenersError(null);
      
      // Stop both database and auth listeners
      databaseListeners.stop();
      authListeners.stop();
      
      setIsListening(false);
      console.log('[useListeners] All listeners stopped successfully');
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

    // Set up auth state change callback
    authListeners.setAuthStateChangeCallback(async (authUser: User | null, hasSecretKey: boolean) => {
      try {
        setListenersError(null);
        
        if (authUser && hasSecretKey) {
          setUser(authUser);
          setIsUserFullyInitialized(true);
          
          // Start listeners if not already listening
          if (!databaseListeners.isActive() && !authListeners.isActive()) {
            console.log('[useListeners] User fully initialized, starting listeners...');
            await startListeners(authUser.id);
          } else {
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