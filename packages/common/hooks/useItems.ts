/**
 * useItems Hook - Layer 1: UI Layer
 * 
 * Provides real-time access to items data with automatic UI updates.
 * Subscribes to the centralized items state manager.
 * Does NOT handle data fetching - that should be done by the calling component.
 */

import { useEffect, useState } from 'react';
import { itemsStateManager } from '@common/core/services/items';
import type { ItemDecrypted, CredentialDecrypted, BankCardDecrypted, SecureNoteDecrypted } from '@common/core/types/items.types';

export const useItems = () => {
  // Step 1: Initialize UI state
  const [items, setItems] = useState<ItemDecrypted[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 2: Subscribe to state changes
  useEffect(() => {
    const handleItemsChanged = (newItems: ItemDecrypted[]) => {
      console.log('[useItems] Items changed, updating UI state:', newItems.length);
      setItems(newItems);
      setLoading(false);
      setError(null);
    };

    // Step 2.1: Listen for changes from the centralized state manager
    itemsStateManager.on('itemsChanged', handleItemsChanged);

    // Step 2.2: Get initial state from the state manager
    const initialItems = itemsStateManager.getItems();
    if (initialItems.length > 0) {
      console.log('[useItems] Initial items found in state manager:', initialItems.length);
      setItems(initialItems);
      setLoading(false);
    } else {
      console.log('[useItems] No initial items in state manager, waiting for data...');
      setLoading(true);
    }

    // Step 2.3: Cleanup
    return () => {
      itemsStateManager.off('itemsChanged', handleItemsChanged);
    };
  }, []);

  // Step 3: Derive data for convenience
  const credentials = items.filter(item => item.itemType === 'credential') as CredentialDecrypted[];
  const bankCards = items.filter(item => item.itemType === 'bankCard') as BankCardDecrypted[];
  const secureNotes = items.filter(item => item.itemType === 'secureNote') as SecureNoteDecrypted[];

  return {
    items,
    credentials,
    bankCards,
    secureNotes,
    loading,
    error,
  };
}; 