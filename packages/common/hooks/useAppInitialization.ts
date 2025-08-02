/**
 * useAppInitialization Hook - Layer 1: UI Layer
 * 
 * Handles application initialization logic only.
 * Uses Zustand store directly for all state management.
 * 
 * Responsibilities:
 * 1. Initialize auth provider
 * 2. Initialize platform detection
 * 3. Initialize storage
 * 4. Start auth listeners (which use Zustand store directly)
 * 5. Mark initialization complete via Zustand
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

  // App initialization - single responsibility with Zustand state management
  const initializeApp = useCallback(async (): Promise<void> => {
    // Prevent multiple initialization calls using Zustand state
    const currentState = useAppStateStore.getState();
    if (currentState.isInitializing) {
      console.log('[useAppInitialization] App is already initializing, skipping');
      return;
    }

    try {
      console.log('[useAppInitialization] Starting application initialization');
      
      // Step 1: Update global state through Zustand - start initialization
      setInitializing(true, null);

      // Step 2: Initialize auth provider
      await auth.initialize();
      console.log('[useAppInitialization] Auth provider initialized successfully');
      
      // Step 3: Initialize platform detection
      await initializePlatform();
      console.log('[useAppInitialization] Platform initialized successfully');
      
      // Step 4: Initialize storage
      await initializeStorage();
      console.log('[useAppInitialization] Storage initialized successfully');
      
      // Step 5: Start auth listeners (they will handle auth state naturally)
      await authListeners.start();
      console.log('[useAppInitialization] Auth listeners started successfully');
      
      // Step 6: Mark initialization complete via Zustand
      setInitializing(false);
      
      console.log('[useAppInitialization] Application fully initialized');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Application initialization failed';
      console.error('[useAppInitialization] Initialization failed:', error);
      
      // Update global state through Zustand
      setInitializing(false, errorMessage);
    }
  }, [setInitializing]);

  // Initialize app on mount only if not already initializing
  useEffect(() => {
    const currentState = useAppStateStore.getState();
    if (!currentState.isInitializing) {
      initializeApp();
    } else {
      console.log('[useAppInitialization] Skipping initialization - app already initializing');
    }
  }, [initializeApp]);
};

// Reset function for testing and edge cases
export function resetInitializationState(): void {
  console.log('[useAppInitialization] Resetting initialization state');
  useAppStateStore.getState().setInitializing(false, null);
} 