/**
 * useRefreshData Hook - Layer 1: UI Layer
 * 
 * Provides simple interface for data refresh operations.
 * Handles UI state and abstracts complexity from components.
 */

import { useCallback, useRef } from 'react';
import { getAllItemsFromDatabase } from '../core/services/items';
import { setLocalVault } from '../core/services/vault';

export const useRefreshData = () => {
  // Step 1: Initialize UI state
  const isRefreshingRef = useRef(false);

  // Step 2: Handle data refresh
  const refreshData = useCallback(async () => {
    // Step 2.1: Prevent multiple simultaneous refreshes
    if (isRefreshingRef.current) {
      console.log('[useRefreshData] Refresh already in progress, skipping');
      return;
    }

    try {
      isRefreshingRef.current = true;
      
      console.log('[useRefreshData] Fetching items from database...');
      // Step 2.2: Fetch items from database
      const fetchedItems = await getAllItemsFromDatabase();
      console.log(`[useRefreshData] Retrieved ${fetchedItems.length} items from database`);
      
      // Step 2.3: Store in local vault
      await setLocalVault(fetchedItems);
      console.log('[useRefreshData] Successfully stored items in local vault');
      
    } catch (error) {
      console.error('[useRefreshData] Failed to refresh data:', error);
      throw error;
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  return { 
    refreshData, 
    refresh: refreshData, // Alias for backward compatibility
    isLoading: isRefreshingRef.current
  };
}; 