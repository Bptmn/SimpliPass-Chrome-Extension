import { useState, useEffect, useCallback } from 'react';
import { useItems } from './useItems';
import { loadUserProfile } from '@common/core/services/user';
import { fetchAndStoreItems } from '@common/core/services/items';
import { 
  shouldShowLoading,
  getItemCounts
} from '@common/utils/homePage';
import { CredentialDecrypted, BankCardDecrypted, SecureNoteDecrypted, User } from '@common/core/types/types';

/**
 * Hook for HomePage component UI state management
 * Handles UI state and data loading only
 * User interactions should be handled in the component
 */
export const useHomePage = (pageState?: { url?: string }) => {
  // Step 1: Use centralized items hook for data
  const { 
    items, 
    credentials, 
    bankCards, 
    secureNotes, 
    loading: itemsLoading, 
    error: itemsError
  } = useItems();

  // Step 2: Initialize UI state management
  const [user, setUser] = useState<User | null>(null);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<CredentialDecrypted | null>(null);
  const [selectedBankCard, setSelectedBankCard] = useState<BankCardDecrypted | null>(null);
  const [selectedSecureNote, setSelectedSecureNote] = useState<SecureNoteDecrypted | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Step 3: Load user profile when component mounts
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await loadUserProfile();
        setUser(userData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load user profile';
        setError(errorMessage);
        console.error('[useHomePage] Failed to load user profile:', err);
      }
    };

    loadUser();
  }, []);

  // Step 4: Determine loading state and debug logging
  const loading = shouldShowLoading(itemsLoading, items.length, user);

  useEffect(() => {
    const counts = getItemCounts(items, credentials, bankCards, secureNotes);
    console.log('[useHomePage] Item counts:', counts);
  }, [items, credentials, bankCards, secureNotes]);

  // Step 5: Handle data refresh
  const refreshData = useCallback(async () => {
    try {
      console.log('[useHomePage] Refreshing vault data...');
      setError(null);
      
      await fetchAndStoreItems();
      console.log('[useHomePage] Vault data refreshed successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh vault data';
      setError(errorMessage);
      console.error('[useHomePage] Failed to refresh vault data:', err);
    }
  }, []);

  return {
    // State
    user,
    items,
    credentials,
    bankCards,
    secureNotes,
    filter,
    selected,
    selectedBankCard,
    selectedSecureNote,
    error: error || itemsError,
    loading,
    
    // Actions
    setFilter,
    setSelected,
    setSelectedBankCard,
    setSelectedSecureNote,
    refreshData,
  };
}; 