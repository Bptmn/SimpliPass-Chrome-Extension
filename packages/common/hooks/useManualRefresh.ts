/**
 * useManualRefresh Hook - Layer 1: UI Layer
 * 
 * Provides manual refresh functionality for UI components.
 * Allows users to manually refresh data.
 */

import { useState } from 'react';
import { useRefreshData } from './useRefreshData';
import { refreshUserInfo } from '../core/services/userService';
import { auth } from '../core/adapters/auth.adapter';

export const useManualRefresh = () => {
  // Step 1: Initialize UI state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshData } = useRefreshData();

  // Step 2: Refresh all data (user + vault)
  const refreshAllData = async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      console.log('[useManualRefresh] Starting manual refresh...');

      // Step 2.1: Get current user ID through auth adapter
      const currentUser = auth.getCurrentUser();
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      // Step 2.2: Refresh user info
      const refreshedUser = await refreshUserInfo(currentUser.uid);
      console.log('[useManualRefresh] User info refreshed:', refreshedUser ? 'success' : 'failed');

      // Step 2.3: Refresh vault data
      await refreshData();
      console.log('[useManualRefresh] Vault data refreshed');

      console.log('[useManualRefresh] Manual refresh completed successfully');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Manual refresh failed';
      setError(errorMessage);
      console.error('[useManualRefresh] Manual refresh failed:', err);
      throw err;
    } finally {
      setIsRefreshing(false);
    }
  };

  // Step 3: Refresh user data only
  const refreshUserOnly = async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      console.log('[useManualRefresh] Starting user-only refresh...');

      const currentUser = auth.getCurrentUser();
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      const refreshedUser = await refreshUserInfo(currentUser.uid);
      console.log('[useManualRefresh] User info refreshed:', refreshedUser ? 'success' : 'failed');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'User refresh failed';
      setError(errorMessage);
      console.error('[useManualRefresh] User refresh failed:', err);
      throw err;
    } finally {
      setIsRefreshing(false);
    }
  };

  // Step 4: Refresh vault data only
  const refreshVaultOnly = async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      console.log('[useManualRefresh] Starting vault-only refresh...');

      await refreshData();
      console.log('[useManualRefresh] Vault data refreshed');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Vault refresh failed';
      setError(errorMessage);
      console.error('[useManualRefresh] Vault refresh failed:', err);
      throw err;
    } finally {
      setIsRefreshing(false);
    }
  };

  // Step 5: Clear error state
  const clearError = () => {
    setError(null);
  };

  return {
    refreshAllData,
    refreshUserOnly,
    refreshVaultOnly,
    isRefreshing,
    error,
    clearError,
  };
}; 