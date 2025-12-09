// useSettings.ts
// This hook manages settings page business logic:
// - User data loading
// - Logout functionality
// - Listener management
// - Error handling

import { useState, useCallback } from 'react';
import { getCurrentUser } from '@common/core/services/userService';
import { databaseListeners, authListeners } from '@common/core/services/listenerService';
import { auth } from '@common/core/adapters/auth.adapter';
import type { User } from '@common/types/auth.types';

export const useSettings = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Load current user data
  const loadCurrentUser = useCallback(async () => {
    try {
      setUserLoading(true);
      setError(null);
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error('[useSettings] Failed to load user:', err);
      setError('Failed to load user data');
    } finally {
      setUserLoading(false);
    }
  }, []);

  // Step 2: Handle logout with proper cleanup
  const signOut = useCallback(async () => {
    try {
      setError(null);
      // Step 2.1: Sign out from Firebase and Cognito
      await auth.signOut();
      
      // Step 2.2: Stop all listeners
      databaseListeners.stop();
      authListeners.stop();
    } catch (err) {
      console.error('[useSettings] Logout error:', err);
      setError('Erreur lors de la déconnexion.');
      throw err;
    }
  }, []);

  // Step 3: Stop database listeners
  const stopDatabaseListeners = useCallback(() => {
    databaseListeners.stop();
  }, []);

  // Step 4: Stop auth listeners
  const stopAuthListeners = useCallback(() => {
    authListeners.stop();
  }, []);

  return {
    user,
    userLoading,
    error,
    loadCurrentUser,
    signOut,
    stopDatabaseListeners,
    stopAuthListeners,
  };
}; 