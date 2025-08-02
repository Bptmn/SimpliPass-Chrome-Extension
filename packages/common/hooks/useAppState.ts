/**
 * useAppState - Zustand Store for Global App State
 * 
 * Responsibilities:
 * 1. Manage global app state (initialization, user, secret key, auth availability)
 * 2. Provide simple state update methods (setInitializing, setUser, setSecretKey, setAuthIsAvailable)
 * 3. Handle state change detection (refreshSecretKey)
 * 4. Clear error (clearError)
 * 5. NO computed states - route determination handled by useAppRouter
 * 6. NO initialization logic - handled by useAppInitialization
 * 7. NO routing logic - handled by useAppRouter
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
  authIsAvailable: boolean; // ✅ NEW: Auth state is available for routing
}

// Zustand store interface
interface AppStateStore extends AppState {
  // Simple state update methods
  setInitializing: (isInitializing: boolean, error?: string | null) => void;
  setUser: (user: User | null) => void;
  setSecretKey: (hasSecretKey: boolean) => void;
  setUserAndSecretKey: (user: User | null, hasSecretKey: boolean) => void;
  setAuthIsAvailable: (authIsAvailable: boolean) => void; // ✅ NEW
  
  // Utility methods
  refreshSecretKey: () => Promise<void>;
  clearError: () => void;
}

/**
 * Zustand store for global app state
 * Simple, direct state management following Zustand best practices
 */
export const useAppStateStore = create<AppStateStore>((set, _get) => ({
  // Initial state - start with isInitializing: false, auth not available yet
  isInitializing: false, // ✅ Start as false, will be set to true when initialization starts
  initializationError: null,
  user: null,
  userSecretKeyExist: false,
  authIsAvailable: false, // ✅ NEW: Auth not available initially

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

  // ✅ NEW: Set auth availability
  setAuthIsAvailable: (authIsAvailable: boolean) => {
    console.log('[useAppState] Setting auth availability:', authIsAvailable);
    set({ authIsAvailable });
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