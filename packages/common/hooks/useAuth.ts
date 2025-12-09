/**
 * useAuth Hook - Layer 1: UI Layer
 * 
 * Provides authentication state management:
 * - Current user state
 * - Authentication status
 * - Logout functionality
 * - Error handling for auth operations
 * 
 * Business logic is delegated to authService.
 */

import { useState, useCallback } from 'react';
import { authService } from '../core/services/authService';
import { getCurrentUser as getCurrentUserFromService } from '../core/services/userService';
import { User } from '@common/types/auth.types';

export interface UseAuthReturn {
  // State
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
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

  // Logout function
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // ✅ Hook calls service for business logic
      await authService.logout();

      console.log('[useAuth] Logout completed successfully');
      // ✅ Hook handles UI-specific logic
      // PopupApp will detect auth state change and render login page
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
      console.error('[useAuth] Logout failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get current user
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

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    user,
    isLoading,
    error,
    
    // Actions
    logout,
    getCurrentUser,
    clearError,
  };
};
