/**
 * useManualRefresh Hook - Layer 1: UI Layer
 * 
 * Provides manual refresh functionality for UI components.
 * Allows users to manually refresh data.
 */

import { useState } from 'react';
import { refreshUserInfo, getCurrentUserAsync } from '@common/core/services/userService';
import { itemsService } from '@common/core/services/itemsService';
import { useAppStateStore } from './useAppState';

export const useManualRefresh = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user: _user } = useAppStateStore();

  const refreshAllData = async () => {
    setIsRefreshing(true);
    setError(null);
    
    try {
      // Step 1: Get current user ID through auth adapter
      const currentUser = await getCurrentUserAsync();
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }
      
      const userId = currentUser.uid;
      console.log('[useManualRefresh] Refreshing all data for user:', userId);
      
      // Step 2: Refresh user info
      const refreshedUser = await refreshUserInfo(userId);
      if (!refreshedUser) {
        throw new Error('Failed to refresh user info');
      }
      
      // Step 3: Refresh items
      await itemsService.fetchAndStoreItems(userId);
      
      console.log('[useManualRefresh] All data refreshed successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh data';
      console.error('[useManualRefresh] Refresh failed:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsRefreshing(false);
    }
  };

  const refreshUserOnly = async () => {
    setIsRefreshing(true);
    setError(null);
    
    try {
      const currentUser = await getCurrentUserAsync();
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }
      
      const userId = currentUser.uid;
      console.log('[useManualRefresh] Refreshing user info for user:', userId);
      
      const refreshedUser = await refreshUserInfo(userId);
      if (!refreshedUser) {
        throw new Error('Failed to refresh user info');
      }
      
      console.log('[useManualRefresh] User info refreshed successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh user info';
      console.error('[useManualRefresh] User refresh failed:', errorMessage);
      setError(errorMessage);
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

      await refreshAllData();
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