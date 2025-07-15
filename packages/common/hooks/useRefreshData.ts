/**
 * useRefreshData Hook - Layer 1: UI Layer
 * 
 * Provides simple interface for data refresh operations.
 * Handles UI state and abstracts complexity from components.
 */

import { useCallback, useRef } from 'react';
import { useCredentialsStore } from '../core/states/credentials.state';
import { useBankCardsStore } from '../core/states/bankCards';
import { useSecureNotesStore } from '../core/states/secureNotes';
import { getAllItemsFromDatabase } from '../core/services/items';
import { setDataInStates } from '../core/services/states';
import { setLocalVault } from '../core/services/vault';

export const useRefreshData = () => {
  const credentials = useCredentialsStore(state => state.credentials);
  const bankCards = useBankCardsStore(state => state.bankCards);
  const secureNotes = useSecureNotesStore(state => state.secureNotes);
  const isLoading = useCredentialsStore(state => state.isLoading);
  const isRefreshingRef = useRef(false);
  const hasAttemptedRefreshRef = useRef(false);

  const refreshData = useCallback(async () => {
    // Prevent multiple simultaneous refreshes
    if (isRefreshingRef.current) {
      console.log('[useRefreshData] Refresh already in progress, skipping');
      return;
    }

    // If we've already attempted to refresh and have empty data, don't try again
    if (hasAttemptedRefreshRef.current && credentials.length === 0 && bankCards.length === 0 && secureNotes.length === 0) {
      console.log('[useRefreshData] Already attempted refresh with empty data, skipping');
      return;
    }

    try {
      isRefreshingRef.current = true;
      hasAttemptedRefreshRef.current = true;
      
      // Check if we have data in memory
      if (credentials.length === 0 && bankCards.length === 0 && secureNotes.length === 0 && !isLoading) {
        console.log('[useRefreshData] No data in memory, fetching from Firestore...');
        
        try {
          // Get all items from Database
          console.log('[useRefreshData] Calling getAllItems to fetch and decrypt user items...');
          const allItems = await getAllItemsFromDatabase();
          console.log(`[useRefreshData] getAllItems returned ${allItems.length} items`, allItems);
          
          // Separate items by type
          const filteredCredentials = allItems.filter(item => item.itemType === 'credential');
          const filteredBankCards = allItems.filter(item => item.itemType === 'bankCard');
          const filteredSecureNotes = allItems.filter(item => item.itemType === 'secureNote');
          
          // Set data in states (even if empty arrays)
          await setDataInStates({
            credentials: filteredCredentials,
            bankCards: filteredBankCards,
            secureNotes: filteredSecureNotes,
          });
          
          // Store in local vault (even if empty)
          try {
            await setLocalVault([...filteredCredentials, ...filteredBankCards, ...filteredSecureNotes]);
          } catch (vaultError) {
            console.warn('[useRefreshData] Failed to store local vault, continuing:', vaultError);
          }
          
          console.log(`[useRefreshData] Data refreshed successfully: ${filteredCredentials.length} credentials, ${filteredBankCards.length} bank cards, ${filteredSecureNotes.length} secure notes`);
        } catch (decryptionError) {
          // If decryption fails (expected for new users or password changes), just continue with empty data
          console.error('[useRefreshData] Decryption failed, continuing with empty data:', decryptionError);
          if (typeof window !== 'undefined' && window.alert) {
            window.alert('Warning: Failed to decrypt your data. Your vault appears empty. Please check your credentials or contact support if this persists.');
          }
          // Set empty data in states
          await setDataInStates({
            credentials: [],
            bankCards: [],
            secureNotes: [],
          });
          
          // Store empty vault
          try {
            await setLocalVault([]);
          } catch (vaultError) {
            console.warn('[useRefreshData] Failed to store empty local vault, continuing:', vaultError);
          }
          
          console.log('[useRefreshData] Set empty data and continued login flow (decryption failure path)');
        }
      } else {
        console.log('[useRefreshData] Data already in memory, skipping refresh');
        // Reset the flag if we have data, so future refreshes can work
        if (credentials.length > 0 || bankCards.length > 0 || secureNotes.length > 0) {
          hasAttemptedRefreshRef.current = false;
        }
      }
    } catch (error) {
      console.error('[useRefreshData] Failed to refresh data:', error);
      // Don't throw the error - just log it and continue
      // This allows the login flow to complete even if data refresh fails
    } finally {
      isRefreshingRef.current = false;
    }
  }, [credentials.length, bankCards.length, secureNotes.length, isLoading]);

  return { 
    refreshData, 
    refresh: refreshData, // Alias for backward compatibility
    isLoading 
  };
}; 