/**
 * useItemsOperations Hook - Layer 1: UI Layer
 * 
 * Unified operations hook for all item types with proper error handling:
 * - CRUD operations for all item types
 * - Search and filtering
 * - State management
 * - Error handling and propagation
 * 
 * Business logic is delegated to itemsService.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { itemsService, itemsStateManager } from '../../core/services/itemsService';
import { User } from '../@common/types/auth.types';
import { ItemDecrypted, CredentialDecrypted, BankCardDecrypted, SecureNoteDecrypted } from '../@common/types/items.types';

export interface UseItemsOperationsReturn {
  // Data
  items: ItemDecrypted[];
  credentials: CredentialDecrypted[];
  bankCards: BankCardDecrypted[];
  secureNotes: SecureNoteDecrypted[];
  
  // Search and filtering
  searchValue: string;
  filteredItems: ItemDecrypted[];
  filteredCredentials: CredentialDecrypted[];
  filteredBankCards: BankCardDecrypted[];
  filteredSecureNotes: SecureNoteDecrypted[];
  
  // State
  loading: boolean;
  error: string | null;
  isActionLoading: boolean;
  
  // Actions
  addItem: (item: ItemDecrypted) => Promise<void>;
  editItem: (id: string, updates: Partial<ItemDecrypted>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  setSearchValue: (value: string) => void;
  clearSearch: () => void;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

export interface UseItemsOperationsProps {
  user: User | null;
}

export const useItemsOperations = ({ user }: UseItemsOperationsProps): UseItemsOperationsReturn => {
  // UI state
  const [items, setItems] = useState<ItemDecrypted[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // ✅ Auto-fetch data when user is available
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user) {
        console.log('[useItemsOperations] No user available, skipping data fetch');
        return;
      }

      try {
        console.log('[useItemsOperations] User available, fetching initial data...');
        setLoading(true);
        setError(null);
        
        await itemsService.loadItemsWithFallback();
        console.log('[useItemsOperations] Initial data fetch completed');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch initial data';
        setError(errorMessage);
        console.error('[useItemsOperations] Failed to fetch initial data:', err);
        // ✅ Propagate error to ErrorBoundary
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [user]);

  // ✅ Subscribe to state changes
  useEffect(() => {
    const handleItemsChanged = (newItems: ItemDecrypted[]) => {
      console.log('[useItemsOperations] Items changed, updating UI state:', newItems.length);
      setItems(newItems);
      setLoading(false);
      setError(null);
    };

    itemsStateManager.on('itemsChanged', handleItemsChanged);

    const initialItems = itemsStateManager.getItems();
    if (initialItems.length > 0) {
      console.log('[useItemsOperations] Initial items found in state manager:', initialItems.length);
      setItems(initialItems);
      setLoading(false);
    } else {
      console.log('[useItemsOperations] No initial items in state manager, waiting for data...');
      setLoading(true);
    }

    return () => {
      itemsStateManager.off('itemsChanged', handleItemsChanged);
    };
  }, []);

  // ✅ Unified CRUD operations with proper error handling
  const addItem = useCallback(async (item: ItemDecrypted) => {
    try {
      setIsActionLoading(true);
      setError(null);
      
      await itemsService.addItem(item);
      console.log('[useItemsOperations] Item added successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item';
      setError(errorMessage);
      console.error('[useItemsOperations] Add item failed:', err);
      // ✅ Propagate error to ErrorBoundary
      throw new Error(errorMessage);
    } finally {
      setIsActionLoading(false);
    }
  }, []);

  const editItem = useCallback(async (id: string, updates: Partial<ItemDecrypted>) => {
    try {
      setIsActionLoading(true);
      setError(null);
      
      await itemsService.updateItem(id, updates as ItemDecrypted);
      console.log('[useItemsOperations] Item edited successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to edit item';
      setError(errorMessage);
      console.error('[useItemsOperations] Edit item failed:', err);
      // ✅ Propagate error to ErrorBoundary
      throw new Error(errorMessage);
    } finally {
      setIsActionLoading(false);
    }
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    try {
      setIsActionLoading(true);
      setError(null);
      
      await itemsService.deleteItem(id);
      console.log('[useItemsOperations] Item deleted successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete item';
      setError(errorMessage);
      console.error('[useItemsOperations] Delete item failed:', err);
      // ✅ Propagate error to ErrorBoundary
      throw new Error(errorMessage);
    } finally {
      setIsActionLoading(false);
    }
  }, []);

  // ✅ Search and filtering
  const clearSearch = useCallback(() => {
    setSearchValue('');
  }, []);

  const refreshData = useCallback(async () => {
    try {
      console.log('[useItemsOperations] Refreshing vault data...');
      setError(null);
      setLoading(true);
      
      await itemsService.loadItemsWithFallback();
      console.log('[useItemsOperations] Vault data refreshed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh vault data';
      setError(errorMessage);
      console.error('[useItemsOperations] Failed to refresh vault data:', err);
      // ✅ Propagate error to ErrorBoundary
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ✅ Derived data
  const credentials = useMemo(() => 
    items.filter(item => item.itemType === 'credential') as CredentialDecrypted[], 
    [items]
  );

  const bankCards = useMemo(() => 
    items.filter(item => item.itemType === 'bank_card') as BankCardDecrypted[], 
    [items]
  );

  const secureNotes = useMemo(() => 
    items.filter(item => item.itemType === 'secure_note') as SecureNoteDecrypted[], 
    [items]
  );

  // ✅ Filtered items based on search
  const filteredItems = useMemo(() => {
    if (!searchValue.trim()) {
      return items;
    }

    const searchLower = searchValue.toLowerCase();
    return items.filter(item => {
      // Search in title
      if (item.title.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Search in note
      if (item.note && item.note.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Search in URL for credentials
      if (item.itemType === 'credential' && 'url' in item) {
        const credential = item as CredentialDecrypted;
        if (credential.url && credential.url.toLowerCase().includes(searchLower)) {
          return true;
        }
      }

      // Search in username for credentials
      if (item.itemType === 'credential' && 'username' in item) {
        const credential = item as CredentialDecrypted;
        if (credential.username && credential.username.toLowerCase().includes(searchLower)) {
          return true;
        }
      }

      // Search in bank name for bank cards
      if (item.itemType === 'bank_card' && 'bankName' in item) {
        const bankCard = item as BankCardDecrypted;
        if (bankCard.bankName && bankCard.bankName.toLowerCase().includes(searchLower)) {
          return true;
        }
      }

      return false;
    });
  }, [items, searchValue]);

  // ✅ Derived filtered items by type
  const filteredCredentials = useMemo(() => 
    filteredItems.filter(item => item.itemType === 'credential') as CredentialDecrypted[],
    [filteredItems]
  );

  const filteredBankCards = useMemo(() => 
    filteredItems.filter(item => item.itemType === 'bank_card') as BankCardDecrypted[],
    [filteredItems]
  );

  const filteredSecureNotes = useMemo(() => 
    filteredItems.filter(item => item.itemType === 'secure_note') as SecureNoteDecrypted[],
    [filteredItems]
  );

  return {
    // Data
    items,
    credentials,
    bankCards,
    secureNotes,
    
    // Search and filtering
    searchValue,
    filteredItems,
    filteredCredentials,
    filteredBankCards,
    filteredSecureNotes,
    
    // State
    loading,
    error,
    isActionLoading,
    
    // Actions
    addItem,
    editItem,
    deleteItem,
    setSearchValue,
    clearSearch,
    refreshData,
    clearError,
  };
}; 