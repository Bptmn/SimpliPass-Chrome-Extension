/**
 * useAppInitialization Hook - Executed at the entry point of the app
 * 
 * Simple and clean application initialization:
 * 1. Initialize platform detection
 * 2. Initialize storage
 * 3. Initialize Firebase
 * 4. Check for current user (via auth adapter)
 * 5. Start listeners if user exists
 * 
 * Returns initialization result for router to handle navigation.
 */

import { useState, useCallback } from 'react';
import { auth, initializeStorage } from '@common/core/adapters';
import { initializePlatform } from '@common/core/adapters/platform.adapter';
import { initFirebase } from '@common/core/libraries/auth/firebase';
import { useListeners } from './useListeners';
import type { User } from '@common/core/types/auth.types';

export interface AppInitializationState {
  // Core state
  user: User | null;
  isListening: boolean;
  
  // Initialization state
  isInitialized: boolean;
  initializationError: string | null;
  listenersError: string | null;
}

export interface UseAppInitializationReturn {
  // State
  state: AppInitializationState;
  
  // Initialization actions
  initializeApp: () => Promise<void>;
}

export const useAppInitialization = (): UseAppInitializationReturn => {
  // Initialize state
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isListening, setIsListening] = useState(false);

  // Get listeners functionality
  const { startListeners, listenersError } = useListeners();

  // Global initialization function with single try-catch
  const initializeApp = useCallback(async (): Promise<void> => {
    try {
      console.log('[useAppInitialization] Starting application initialization');
      setInitializationError(null);
      
      // Step 1: Initialize platform detection
      await initializePlatform();
      console.log('[useAppInitialization] Platform initialized successfully');
      
      // Step 2: Initialize storage
      await initializeStorage();
      console.log('[useAppInitialization] Storage initialized successfully');
      
      // Step 3: Initialize Firebase // TO CHANGE TO USE ADAPTER
      await initFirebase();
      console.log('[useAppInitialization] Firebase initialized successfully');
      
      // Step 4: Check for current user (via auth adapter)
      console.log('[useAppInitialization] Checking for current user...');
      const loggedInUser = auth.getCurrentUser();
      if (!loggedInUser) {
        console.log('[useAppInitialization] No user found, stopping initialization');
        setUser(null);
        setIsInitialized(true);
        return;
      }
      
      // Step 5: Start listeners with user ID
      await startListeners(loggedInUser.uid);
      setIsListening(true);
      console.log('[useAppInitialization] Listeners started successfully for user:', loggedInUser.uid);
      
      console.log('[useAppInitialization] Application fully initialized');
      setIsInitialized(true);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Application initialization failed';
      setInitializationError(errorMessage);
      console.error('[useAppInitialization] Initialization failed:', error);
    }
  }, [startListeners]);

  // Combine state into single initialization state
  const state: AppInitializationState = {
    // Core state
    user,
    isListening,
    
    // Initialization state
    isInitialized,
    initializationError,
    listenersError,
  };

  return {
    // State
    state,
    
    // Initialization actions
    initializeApp,
  };
}; 