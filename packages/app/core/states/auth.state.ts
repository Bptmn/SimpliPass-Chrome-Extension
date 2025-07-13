/**
 * Authentication State Management
 * 
 * Centralized state management for authentication using Zustand.
 * Follows the single source of truth principle - all UI data comes from this state.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User, UserSession, AuthState } from '../types/shared.types';

interface AuthStore extends AuthState {
  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: UserSession | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Complex Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
  
  // Computed State
  isLoggedIn: () => boolean;
  hasValidSession: () => boolean;
  getSessionTimeRemaining: () => number;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // ===== Basic Actions =====

        setUser: (user: User | null) => {
          set({ user });
        },

        setSession: (session: UserSession | null) => {
          set({ session });
        },

        setAuthenticated: (isAuthenticated: boolean) => {
          set({ isAuthenticated });
        },

        setLoading: (isLoading: boolean) => {
          set({ isLoading });
        },

        setError: (error: string | null) => {
          set({ error });
        },

        // ===== Complex Actions =====

        login: async (email: string, password: string) => {
          const { setLoading, setError, setUser, setSession, setAuthenticated } = get();
          
          try {
            setLoading(true);
            setError(null);

            // Import auth logic dynamically to avoid circular dependencies
            const { loginUser } = await import('../logic/auth');
            const result = await loginUser({ email, password, rememberEmail: false });

            if (result.user && result.session) {
              setUser(result.user);
              setSession(result.session);
              setAuthenticated(true);
            } else {
              setError('Login failed');
            }
          } catch (error) {
            setError(error instanceof Error ? error.message : 'Login failed');
          } finally {
            setLoading(false);
          }
        },

        logout: async () => {
          const { setLoading, setError, setUser, setSession, setAuthenticated } = get();
          
          try {
            setLoading(true);
            setError(null);

            // Import auth logic dynamically to avoid circular dependencies
            const { logoutUser } = await import('../logic/auth');
            await logoutUser();

            // Clear all state
            setUser(null);
            setSession(null);
            setAuthenticated(false);
          } catch (error) {
            setError(error instanceof Error ? error.message : 'Logout failed');
          } finally {
            setLoading(false);
          }
        },

        refreshSession: async () => {
          const { setLoading, setError, setSession, setAuthenticated } = get();
          
          try {
            setLoading(true);
            setError(null);

            // Import auth logic dynamically to avoid circular dependencies
            const { validateSession } = await import('../logic/session');
            const result = await validateSession();

            if (result.success) {
              // Create a UserSession from SessionData
              const sessionData = result.data;
              if (sessionData) {
                const userSession = {
                  userId: 'current-user', // This should come from the actual user context
                  userSecretKey: sessionData.userSecretKey,
                  sessionId: sessionData.createdAt.toString(),
                  createdAt: new Date(sessionData.createdAt),
                  expiresAt: new Date(sessionData.expiresAt),
                  isActive: true,
                };
                setSession(userSession);
                setAuthenticated(true);
              }
            } else {
              setError(result.error || 'Session refresh failed');
              setAuthenticated(false);
            }
          } catch (error) {
            setError(error instanceof Error ? error.message : 'Session refresh failed');
            setAuthenticated(false);
          } finally {
            setLoading(false);
          }
        },

        clearError: () => {
          set({ error: null });
        },

        // ===== Computed State =====

        isLoggedIn: () => {
          const { user, isAuthenticated } = get();
          return !!user && isAuthenticated;
        },

        hasValidSession: () => {
          const { session } = get();
          if (!session) return false;
          
          const now = Date.now();
          return session.isActive && session.expiresAt.getTime() > now;
        },

        getSessionTimeRemaining: () => {
          const { session } = get();
          if (!session || !session.isActive) return 0;
          
          const now = Date.now();
          const remaining = session.expiresAt.getTime() - now;
          return Math.max(0, remaining);
        },
      }),
      {
        name: 'simplipass-auth-storage',
        // Only persist non-sensitive data
        partialize: (state) => ({
          user: state.user ? {
            id: state.user.id,
            email: state.user.email,
            createdAt: state.user.createdAt,
            lastLoginAt: state.user.lastLoginAt,
            isActive: state.user.isActive,
          } : null,
          session: state.session ? {
            userId: state.session.userId,
            sessionId: state.session.sessionId,
            createdAt: state.session.createdAt,
            expiresAt: state.session.expiresAt,
            isActive: state.session.isActive,
          } : null,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
);

// ===== Selectors =====

export const useUser = () => useAuthStore((state) => state.user);
export const useSession = () => useAuthStore((state) => state.session);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useIsLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);

export const useIsLoggedIn = () => useAuthStore((state) => state.isLoggedIn());
export const useHasValidSession = () => useAuthStore((state) => state.hasValidSession());
export const useSessionTimeRemaining = () => useAuthStore((state) => state.getSessionTimeRemaining());

// ===== Actions =====

export const useAuthActions = () => useAuthStore((state) => ({
  login: state.login,
  logout: state.logout,
  refreshSession: state.refreshSession,
  clearError: state.clearError,
})); 