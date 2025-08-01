/**
 * useAppState - Zustand Store for Global App State
 * 
 * Follows Zustand best practices:
 * - Simple, direct state management
 * - No unnecessary wrappers
 * - Clear separation of concerns
 * - Only global states that impact routing
 * 
 * Responsibilities:
 * 1. Manage global app state (initialization, user, secret key)
 * 2. Provide simple state update methods
 * 3. Handle state change detection
 * 
 * NO computed states - route determination handled by useAppRouter
 * NO initialization logic - handled by useAppInitialization
 * NO routing logic - handled by useAppRouter
 */

import { create } from 'zustand';
import { checkUserSecretKey } from '@common/core/services/userService';
import type { User } from '@common/core/types/auth.types';

// Global app state interface - only core states that impact routing
export interface AppState {
  // Core states that impact routing
  isInitializing: boolean;
  initializationError: string | null;
  user: User | null;
  userSecretKeyExist: boolean;
}

// Zustand store interface
interface AppStateStore extends AppState {
  // Simple state update methods
  setInitializing: (isInitializing: boolean, error?: string | null) => void;
  setUser: (user: User | null) => void;
  setSecretKey: (hasSecretKey: boolean) => void;
  setUserAndSecretKey: (user: User | null, hasSecretKey: boolean) => void;
  
  // Utility methods
  refreshSecretKey: () => Promise<void>;
  clearError: () => void;
}

/**
 * Zustand store for global app state
 * Simple, direct state management following Zustand best practices
 */
export const useAppStateStore = create<AppStateStore>((set, _get) => ({
  // Initial state
  isInitializing: true,
  initializationError: null,
  user: null,
  userSecretKeyExist: false,

  // Simple state update methods
  setInitializing: (isInitializing: boolean, error?: string | null) => {
    console.log('[useAppState] Setting initialization state:', { isInitializing, error });
    set({ isInitializing, initializationError: error ?? null });
  },

  setUser: (user: User | null) => {
    console.log('[useAppState] Setting user:', { userId: user?.id });
    set({ user });
  },

  setSecretKey: (hasSecretKey: boolean) => {
    console.log('[useAppState] Setting secret key:', hasSecretKey);
    set({ userSecretKeyExist: hasSecretKey });
  },

  setUserAndSecretKey: (user: User | null, hasSecretKey: boolean) => {
    console.log('[useAppState] Setting user and secret key:', { 
      userId: user?.id, 
      hasSecretKey 
    });
    set({ user, userSecretKeyExist: hasSecretKey });
  },

  // Utility methods
  refreshSecretKey: async () => {
    try {
      console.log('[useAppState] Refreshing secret key state...');
      const hasKey = await checkUserSecretKey();
      console.log('[useAppState] Refreshed secret key state:', hasKey);
      set({ userSecretKeyExist: hasKey });
    } catch (error) {
      console.error('[useAppState] Error refreshing secret key state:', error);
      set({ userSecretKeyExist: false });
    }
  },

  clearError: () => {
    console.log('[useAppState] Clearing initialization error');
    set({ initializationError: null });
  },
}));

// Export types for useAppRouter 