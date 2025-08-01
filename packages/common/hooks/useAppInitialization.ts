/**
 * useAppInitialization Hook - Layer 1: UI Layer
 * 
 * Handles application initialization logic only.
 * Uses Zustand store directly for all state management.
 * 
 * Responsibilities:
 * 1. Initialize platform detection
 * 2. Initialize storage
 * 3. Initialize auth provider
 * 4. Start auth listeners (which use Zustand store directly)
 * 
 * Note: Initialization happens automatically on mount
 */

import { useCallback, useEffect } from 'react';
import { auth, initializeStorage } from '@common/core/adapters';
import { initializePlatform } from '@common/core/adapters/platform.adapter';
import { authListeners } from '@common/core/services/listenerService';
import { useAppStateStore } from './useAppState';

export const useAppInitialization = (): void => {
  // Get Zustand store methods directly
  const { setInitializing } = useAppStateStore();

  // App initialization - single responsibility with singleton protection
  const initializeApp = useCallback(async (): Promise<void> => {
    // Prevent multiple initialization calls using singleton
    if (initializationState.isInitialized) {
      console.log('[useAppInitialization] App already initialized (singleton), skipping');
      return;
    }

    if (initializationState.isInitializing) {
      console.log('[useAppInitialization] App is already initializing (singleton), skipping');
      return;
    }

    try {
      console.log('[useAppInitialization] Starting application initialization');
      initializationState.isInitializing = true;
      initializationState.initializationError = null;
      
      // Update global state through Zustand
      setInitializing(true, null);
      
      // Step 1: Initialize platform detection
      await initializePlatform();
      console.log('[useAppInitialization] Platform initialized successfully');
      
      // Step 2: Initialize storage
      await initializeStorage();
      console.log('[useAppInitialization] Storage initialized successfully');
      
      // Step 3: Initialize auth provider
      await auth.initialize();
      console.log('[useAppInitialization] Auth provider initialized successfully');
      
      // Step 4: Start auth listeners (uses Zustand store directly)
      await authListeners.start();
      console.log('[useAppInitialization] Auth listeners started successfully');
      
      // Step 5: Mark initialization complete
      initializationState.isInitializing = false;
      initializationState.isInitialized = true;
      
      // Update global state through Zustand
      setInitializing(false);
      
      console.log('[useAppInitialization] Application fully initialized');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Application initialization failed';
      console.error('[useAppInitialization] Initialization failed:', error);
      initializationState.isInitializing = false;
      initializationState.initializationError = errorMessage;
      
      // Update global state through Zustand
      setInitializing(false, errorMessage);
    }
  }, [setInitializing]);

  // Initialize app on mount only if not already initialized
  useEffect(() => {
    if (!initializationState.isInitialized && !initializationState.isInitializing) {
      initializeApp();
    } else {
      console.log('[useAppInitialization] Skipping initialization - app already initialized or initializing');
    }
  }, [initializeApp]);
};

// Singleton to prevent multiple initializations
let initializationState = {
  isInitialized: false,
  isInitializing: false,
  initializationError: null as string | null,
};

// Reset function for testing and edge cases
export function resetInitializationState(): void {
  console.log('[useAppInitialization] Resetting initialization state');
  initializationState = {
    isInitialized: false,
    isInitializing: false,
    initializationError: null,
  };
} 