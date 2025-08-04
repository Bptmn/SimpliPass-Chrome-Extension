/**
 * useAppInitialization Hook - Layer 1: UI Layer
 * 
 * Handles application initialization logic only.
 * Uses Zustand store directly for all state management.
 * 
 * Responsibilities:
 * 1. Initialize auth provider
 * 2. Set platform type in global state
 * 3. Initialize storage
 * 4. Start auth listeners (which use Zustand store directly)
 * 5. Mark initialization complete via Zustand
 * 
 * Note: Initialization happens automatically on mount
 */

import { useCallback, useEffect } from 'react';
import { initializationService } from '@common/core/services/initializationService';
import { useAppStateStore, type Platform } from './useAppState';

interface UseAppInitializationProps {
  platform: Platform;
}

export const useAppInitialization = ({ platform }: UseAppInitializationProps): void => {
  // Get Zustand store methods directly
  const { setInitializing: _setInitializing } = useAppStateStore();

  // App initialization - delegate to service layer
  const initializeApp = useCallback(async (): Promise<void> => {
    try {
      await initializationService.initializeApp(platform);
    } catch (error) {
      // Error is already handled by the service and exposed to UI state
      console.error('[useAppInitialization] Initialization failed:', error);
    }
  }, [platform]);

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
  initializationService.resetInitializationState();
} 