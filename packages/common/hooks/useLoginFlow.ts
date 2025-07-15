/**
 * useLoginFlow Hook - Layer 1: UI Layer
 * 
 * Handles login flow UI state and user interactions.
 * Provides simple, readable interface for login components.
 */

import { useState } from 'react';
import { loginUser } from '../core/services/auth';
import { initializeUserSession } from '../core/services/session';
import { initializeUserSecretKey, getUserSecretKey } from '../core/services/secret';
import { useRefreshData } from './useRefreshData';
import { refreshUserInfo } from './useUser';

export const useLoginFlow = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshData } = useRefreshData();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {

      // Step 1: Authenticate user
      const userId = await loginUser(email, password);

      // Step 2: Initialize user secret key (fetch salt, derive, store)
      await initializeUserSecretKey(password);

      // Step 3: Initialize user info (fetch user from firestore, store in local storage)
      await refreshUserInfo(userId);

      // Step 4: Initialize user session
      const userSecretKey = await getUserSecretKey();
      await initializeUserSession(userId, userSecretKey || '');

      // Step 5: Refresh data
      await refreshData();
      console.log('[useLoginFlow] Login flow completed successfully');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      console.error('[useLoginFlow] Login flow failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return { login, isLoading, error, clearError };
}; 