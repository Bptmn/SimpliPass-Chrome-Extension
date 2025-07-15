/**
 * Authentication State Management
 * 
 * Centralized state management for authentication using Zustand.
 * Follows the single source of truth principle - all UI data comes from this state.
 */

import { create } from 'zustand';
import { UserSession } from '../types/auth.types';

interface AuthState {
  session: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  userSecretKey: string | null;
  
  // Actions
  setSession: (session: UserSession) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
  setUserSecretKey: (key: string | null) => void;
  clearUserSecretKey: () => void;
}

export const useAuthStore = create<AuthState>((set, _get) => ({
  session: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  userSecretKey: null,
  
  setSession: (session) => set({ session }),
  setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearAuth: () => set({ 
    session: null, 
    isAuthenticated: false, 
    error: null,
    userSecretKey: null,
  }),
  setUserSecretKey: (key) => set({ userSecretKey: key }),
  clearUserSecretKey: () => set({ userSecretKey: null }),
}));

// Note: useUser is now exported from useUser.ts and uses useUserStore 