/**
 * useAuth Hook - Layer 1: UI Layer
 * 
 * Provides comprehensive authentication functionality including:
 * - Login with email/password
 * - Logout with cleanup
 * - Account management (get current user, session management)
 * - Centralized auth state management
 * 
 * IMPORTANT: This hook now receives state from useAppInitialization
 * instead of calling useListeners directly to prevent redundant actions.
 */

import { useState, useCallback } from 'react';
import { auth } from '../core/adapters/auth.adapter';
import { storage } from '../core/adapters/platform.storage.adapter';
import { getCurrentUser as getCurrentUserFromService } from '../core/services/userService';
import { databaseListeners, authListeners } from '../core/services/listenerService';
import { User } from '../core/types/auth.types';

export interface UseAuthReturn {
  // State
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
  clearError: () => void;
}

export interface UseAuthProps {
  user: User | null;
}

export const useAuth = ({ user }: UseAuthProps): UseAuthReturn => {
  // Initialize UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Authenticate user (includes secret key initialization)
      await auth.login(email, password);

      console.log('[useAuth] Login flow completed successfully');
      
      // 2. Login complete - PopupApp will detect auth state change and render home page

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      console.error('[useAuth] Login flow failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 1. Sign out from Firebase and Cognito
      await auth.signOut();

      // 2. Stop all listeners
      databaseListeners.stop();
      authListeners.stop();

      // 3. Clear all secure local storage (vault, user, secret key)
      await storage.clearAllSecureLocalStorage();

      console.log('[useAuth] Logout completed successfully');
      // 4. PopupApp will detect auth state change and render login page
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
      console.error('[useAuth] Logout failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get current user function
  const getCurrentUser = useCallback(async (): Promise<User | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const currentUser = await getCurrentUserFromService();
      return currentUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get current user';
      setError(errorMessage);
      console.error('[useAuth] Failed to get current user:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    user,
    isLoading,
    error,
    
    // Actions
    login,
    logout,
    getCurrentUser,
    clearError,
  };
}; 