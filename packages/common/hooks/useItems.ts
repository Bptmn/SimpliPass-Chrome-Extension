/**
 * useItems Hook - Layer 1: UI Layer
 * 
 * Provides comprehensive items functionality including:
 * - Real-time data access with automatic UI updates
 * - CRUD operations (add, edit, delete)
 * - Search and filtering capabilities
 * - User profile management
 * - Data refresh functionality
 * 
 * Subscribes to the centralized items state manager.
 */

import { useEffect, useState, useMemo, useCallback } from 'react';
import { itemsStateManager } from '@common/core/services/itemsService';
import { addItem, updateItem, deleteItem, fetchAndStoreItems } from '@common/core/services/itemsService';
import { useListeners } from './useListeners';

import type { 
  ItemDecrypted, 
  CredentialDecrypted, 
  BankCardDecrypted, 
  SecureNoteDecrypted 
} from '@common/core/types/items.types';
import type { User } from '@common/core/types/types';

export interface UseItemsReturn {
  // Data
  items: ItemDecrypted[];
  credentials: CredentialDecrypted[];
  bankCards: BankCardDecrypted[];
  secureNotes: SecureNoteDecrypted[];
  
  // User data
  user: User | null;
  
  // Search and filtering
  searchValue: string;
  filteredItems: ItemDecrypted[];
  filteredCredentials: CredentialDecrypted[];
  filteredBankCards: BankCardDecrypted[];
  filteredSecureNotes: SecureNoteDecrypted[];
  
  // Selection state
  selectedCredential: CredentialDecrypted | null;
  selectedBankCard: BankCardDecrypted | null;
  selectedSecureNote: SecureNoteDecrypted | null;
  
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
  setSelectedCredential: (item: CredentialDecrypted | null) => void;
  setSelectedBankCard: (item: BankCardDecrypted | null) => void;
  setSelectedSecureNote: (item: SecureNoteDecrypted | null) => void;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

export const useItems = (): UseItemsReturn => {
  // Initialize UI state
  const [items, setItems] = useState<ItemDecrypted[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Initialize search and selection state
  const [searchValue, setSearchValue] = useState('');
  const [selectedCredential, setSelectedCredential] = useState<CredentialDecrypted | null>(null);
  const [selectedBankCard, setSelectedBankCard] = useState<BankCardDecrypted | null>(null);
  const [selectedSecureNote, setSelectedSecureNote] = useState<SecureNoteDecrypted | null>(null);
  
  // Use the centralized listener hook for user data
  const { user } = useListeners();

  // Subscribe to state changes
  useEffect(() => {
    const handleItemsChanged = (newItems: ItemDecrypted[]) => {
      console.log('[useItems] Items changed, updating UI state:', newItems.length);
      setItems(newItems);
      setLoading(false);
      setError(null);
      

    };

    // Listen for changes from the centralized state manager
    itemsStateManager.on('itemsChanged', handleItemsChanged);

    // Get initial state from the state manager
    const initialItems = itemsStateManager.getItems();
    if (initialItems.length > 0) {
      console.log('[useItems] Initial items found in state manager:', initialItems.length);
      setItems(initialItems);
      setLoading(false);
    } else {
      console.log('[useItems] No initial items in state manager, waiting for data...');
      setLoading(true);
    }

    // Cleanup
    return () => {
      itemsStateManager.off('itemsChanged', handleItemsChanged);
    };
  }, []);

  // Derive data for convenience
  const credentials = items.filter(item => item.itemType === 'credential') as CredentialDecrypted[];
  const bankCards = items.filter(item => item.itemType === 'bankCard') as BankCardDecrypted[];
  const secureNotes = items.filter(item => item.itemType === 'secureNote') as SecureNoteDecrypted[];

  // Derive loading state from items state
  const _shouldShowLoading = loading && items.length === 0;

  // Filter items based on search value
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
      if (item.itemType === 'bankCard' && 'bankName' in item) {
        const bankCard = item as BankCardDecrypted;
        if (bankCard.bankName && bankCard.bankName.toLowerCase().includes(searchLower)) {
          return true;
        }
      }

      return false;
    });
  }, [items, searchValue]);

  // Derive filtered items by type
  const filteredCredentials = useMemo(() => 
    filteredItems.filter(item => item.itemType === 'credential') as CredentialDecrypted[],
    [filteredItems]
  );

  const filteredBankCards = useMemo(() => 
    filteredItems.filter(item => item.itemType === 'bankCard') as BankCardDecrypted[],
    [filteredItems]
  );

  const filteredSecureNotes = useMemo(() => 
    filteredItems.filter(item => item.itemType === 'secureNote') as SecureNoteDecrypted[],
    [filteredItems]
  );

  // CRUD Actions - delegated to itemsService.ts
  const handleAddItem = useCallback(async (item: ItemDecrypted) => {
    try {
      setIsActionLoading(true);
      setError(null);
      await addItem(item);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item';
      setError(errorMessage);
      console.error('[useItems] Failed to add item:', err);
    } finally {
      setIsActionLoading(false);
    }
  }, []);

  const handleEditItem = useCallback(async (id: string, updates: Partial<ItemDecrypted>) => {
    try {
      setIsActionLoading(true);
      setError(null);
      await updateItem(id, updates as ItemDecrypted);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to edit item';
      setError(errorMessage);
      console.error('[useItems] Failed to edit item:', err);
    } finally {
      setIsActionLoading(false);
    }
  }, []);

  const handleDeleteItem = useCallback(async (id: string) => {
    try {
      setIsActionLoading(true);
      setError(null);
      await deleteItem(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete item';
      setError(errorMessage);
      console.error('[useItems] Failed to delete item:', err);
    } finally {
      setIsActionLoading(false);
    }
  }, []);

  // Search actions
  const clearSearch = useCallback(() => {
    setSearchValue('');
  }, []);

  // Data refresh
  const refreshData = useCallback(async () => {
    try {
      console.log('[useItems] Refreshing vault data...');
      setError(null);
      
      await fetchAndStoreItems();
      console.log('[useItems] Vault data refreshed successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh vault data';
      setError(errorMessage);
      console.error('[useItems] Failed to refresh vault data:', err);
    }
  }, []);

  // Error handling
  const clearError = useCallback(() => {
    setError(null);
  }, []);



  return {
    // Data
    items,
    credentials,
    bankCards,
    secureNotes,
    
    // User data
    user,
    
    // Search and filtering
    searchValue,
    filteredItems,
    filteredCredentials,
    filteredBankCards,
    filteredSecureNotes,
    
    // Selection state
    selectedCredential,
    selectedBankCard,
    selectedSecureNote,
    
    // State
    loading,
    error,
    isActionLoading,
    
    // Actions
    addItem: handleAddItem,
    editItem: handleEditItem,
    deleteItem: handleDeleteItem,
    setSearchValue,
    clearSearch,
    setSelectedCredential,
    setSelectedBankCard,
    setSelectedSecureNote,
    refreshData,
    clearError,
  };
}; 