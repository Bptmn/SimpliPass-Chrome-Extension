import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { UserSession } from '../types/auth.types';

interface AuthState {
  // Session state
  session: UserSession | null;
  userSecretKey: string | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSession: (session: UserSession | null) => void;
  setUserSecretKey: (key: string | null) => void;
  clearUserSecretKey: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      // ===== Data =====
      session: null,
      userSecretKey: null,
      
      // ===== UI State =====
      isLoading: false,
      error: null,

      // ===== Actions =====
      setSession: (session) => set({ session }),
      
      setUserSecretKey: (key) => set({ userSecretKey: key }),
      
      clearUserSecretKey: () => set({ userSecretKey: null }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
      
      clearAuth: () => set({ 
        session: null, 
        userSecretKey: null, 
        error: null 
      }),
    }),
    {
      name: 'auth-store',
    }
  )
); 