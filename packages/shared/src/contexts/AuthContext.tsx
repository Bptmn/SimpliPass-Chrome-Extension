import React, { createContext, useReducer, useEffect, ReactNode } from 'react';
import type { AuthState, User, LoginCredentials, MfaChallenge } from '../types';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ mfaRequired?: boolean; mfaUser?: any }>;
  confirmMfa: (challenge: MfaChallenge) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, isLoading: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'RESET':
      return { user: null, isLoading: false, error: null };
    default:
      return state;
  }
}

interface AuthProviderProps {
  children: ReactNode;
  authService: {
    login: (credentials: LoginCredentials) => Promise<{ mfaRequired?: boolean; mfaUser?: any }>;
    confirmMfa: (challenge: MfaChallenge) => Promise<void>;
    logout: () => Promise<void>;
    getCurrentUser: () => Promise<User | null>;
    onAuthStateChanged: (callback: (user: User | null) => void) => () => void;
  };
}

export function AuthProvider({ children, authService }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      dispatch({ type: 'SET_USER', payload: user });
    });

    return unsubscribe;
  }, [authService]);

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const result = await authService.login(credentials);
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Login failed' });
      throw error;
    }
  };

  const confirmMfa = async (challenge: MfaChallenge) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      await authService.confirmMfa(challenge);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'MFA confirmation failed' });
      throw error;
    }
  };

  const logout = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await authService.logout();
      dispatch({ type: 'RESET' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Logout failed' });
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    confirmMfa,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}