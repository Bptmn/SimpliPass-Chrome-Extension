/**
 * useUser Hook - Layer 1: UI Layer
 * 
 * Provides simple access to user data from secure storage.
 * Handles UI state management for user data.
 */

import { useState, useEffect } from 'react';
import { User } from '../core/types/auth.types';
import { getCurrentUser } from '../core/services/userService';

export const useUser = () => {
  // Step 1: Initialize UI state
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Step 2: Load user data
  const loadUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userData = await getCurrentUser();
      setUser(userData);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user data';
      setError(errorMessage);
      console.error('[useUser] Failed to load user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Load user data on mount
  useEffect(() => {
    loadUser();
  }, []);

  // Step 4: Refresh user data
  const refreshUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get current user ID from auth adapter (if needed)
      // For now, we'll refresh the current user from storage
      await loadUser();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh user data';
      setError(errorMessage);
      console.error('[useUser] Failed to refresh user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 5: Clear user state
  const clearUser = () => {
    setUser(null);
    setError(null);
  };

  return {
    user,
    isLoading,
    error,
    refreshUser,
    clearUser,
  };
}; 

