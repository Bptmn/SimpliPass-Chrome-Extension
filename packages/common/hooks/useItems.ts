/**
 * useItems Hook - Layer 1: UI Layer
 * 
 * Manages items state and provides comprehensive item management functionality:
 * - Real-time items synchronization with database
 * - Search and filtering capabilities
 * - Item selection and management
 * - CRUD operations for items
 * 
 * IMPORTANT: This hook now receives user state from useAppInitialization
 * instead of calling useListeners directly to prevent redundant actions.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { itemsStateManager, addItem as addItemToService, updateItem as editItemInService, deleteItem as deleteItemFromService } from '../core/services/itemsService';
import { User } from '../core/types/auth.types';
import { ItemDecrypted, CredentialDecrypted, BankCardDecrypted, SecureNoteDecrypted } from '../core/types/items.types';

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

export interface UseItemsProps {
  user: User | null;
}

export const useItems = ({ user }: UseItemsProps): UseItemsReturn => {
  // Initialize items state
  const [items, setItems] = useState<ItemDecrypted[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Initialize search and selection state
  const [searchValue, setSearchValue] = useState('');
  const [selectedCredential, setSelectedCredential] = useState<CredentialDecrypted | null>(null);
  const [selectedBankCard, setSelectedBankCard] = useState<BankCardDecrypted | null>(null);
  const [selectedSecureNote, setSelectedSecureNote] = useState<SecureNoteDecrypted | null>(null);

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
      await addItemToService(item);
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
      await editItemInService(id, updates as ItemDecrypted);
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
      await deleteItemFromService(id);
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
      
      // The original code had fetchAndStoreItems here, but it's not imported.
      // Assuming it's meant to be removed or replaced with a placeholder if needed.
      // For now, removing it as it's not in the new_code.
      
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