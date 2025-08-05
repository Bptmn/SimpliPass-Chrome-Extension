/**
 * useItemsState Hook - Layer 1: UI Layer
 * 
 * Manages items state and provides comprehensive item management functionality:
 * - Real-time items synchronization with database
 * - Search and filtering capabilities
 * - Item selection and management
 * - State management for UI components
 * 
 * IMPORTANT: This hook now receives user state from useAppInitialization
 * instead of calling useListeners directly to prevent redundant actions.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { itemsService, itemsStateManager } from '../core/services/itemsService';
import { useItemsCRUD } from './useItemsCRUD';
import { User } from '../core/types/auth.types';
import { ItemDecrypted, CredentialDecrypted, BankCardDecrypted, SecureNoteDecrypted } from '../core/types/items.types';

export interface UseItemsStateReturn {
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

export interface UseItemsStateProps {
  user: User | null;
}

export const useItemsState = ({ user }: UseItemsStateProps): UseItemsStateReturn => {
  // ✅ Use CRUD operations from useItemsCRUD to avoid redundancy
  const { addItem, editItem, deleteItem, isLoading: isActionLoading, error: operationError, clearError: clearOperationError } = useItemsCRUD();
  
  // Initialize items state
  const [items, setItems] = useState<ItemDecrypted[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize search and selection state
  const [searchValue, setSearchValue] = useState('');
  const [selectedCredential, setSelectedCredential] = useState<CredentialDecrypted | null>(null);
  const [selectedBankCard, setSelectedBankCard] = useState<BankCardDecrypted | null>(null);
  const [selectedSecureNote, setSelectedSecureNote] = useState<SecureNoteDecrypted | null>(null);

  // ✅ NEW: Auto-fetch data when user is available
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user) {
        console.log('[useItems] No user available, skipping data fetch');
        return;
      }

      try {
        console.log('[useItems] User available, fetching initial data...');
        setLoading(true);
        setError(null);
        
        // Fetch data using itemsService (handles local storage + database)
        await itemsService.loadItemsWithFallback();
        
        console.log('[useItems] Initial data fetch completed');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch initial data';
        setError(errorMessage);
        console.error('[useItems] Failed to fetch initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [user]);

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

  // ✅ CRUD Actions are now delegated to useItemsCRUD (no redundancy)

  // Search actions
  const clearSearch = useCallback(() => {
    setSearchValue('');
  }, []);

  // ✅ UPDATED: Data refresh using loadItemsWithFallback
  const refreshData = useCallback(async () => {
    try {
      console.log('[useItems] Refreshing vault data...');
      setError(null);
      setLoading(true);
      
      // Use itemsService to refresh data
      await itemsService.loadItemsWithFallback();
      
      console.log('[useItems] Vault data refreshed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh vault data';
      setError(errorMessage);
      console.error('[useItems] Failed to refresh vault data:', err);
    } finally {
      setLoading(false);
    }
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
    error: error || operationError, // ✅ Use local error or operation error
    isActionLoading,
    
    // Actions
    addItem,
    editItem,
    deleteItem,
    setSearchValue,
    clearSearch,
    setSelectedCredential,
    setSelectedBankCard,
    setSelectedSecureNote,
    refreshData,
    clearError: clearOperationError, // ✅ Use operation clearError
  };
}; 