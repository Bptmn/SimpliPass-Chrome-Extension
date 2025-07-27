import { useState, useCallback } from 'react';
import { auth } from '../core/adapters/auth.adapter';
import { storage } from '../core/adapters/platform.storage.adapter';
import { firestoreListeners } from '@common/core/services/firestoreListeners';

/**
 * useLogoutFlow Hook - Layer 1: UI Layer
 *
 * Logs out user from all providers and clears all local/session data.
 * PopupApp will handle routing based on auth state changes.
 */
export const useLogoutFlow = () => {
  // Step 1: Initialize UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 2: Handle logout process
  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Step 2.1: Sign out from Firebase and Cognito
      await auth.signOut();

      // Step 2.2: Stop all listeners
      await firestoreListeners.stopListeners();

      // Step 2.3: Clear all secure local storage (vault, user, secret key)
      await storage.clearAllSecureLocalStorage();

      console.log('[useLogoutFlow] Logout completed successfully');
      // Step 2.4: PopupApp will detect auth state change and render login page
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
      console.error('[useLogoutFlow] Logout failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { logout, isLoading, error };
}; 