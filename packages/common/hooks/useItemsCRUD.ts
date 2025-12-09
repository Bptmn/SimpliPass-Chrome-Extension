/**
 * useItemsCRUD Hook - Layer 1: UI Layer
 * 
 * Provides pure CRUD operations for all item types:
 * - Add items (credentials, bank cards, secure notes)
 * - Edit items
 * - Delete items
 * 
 * Business logic is delegated to itemsService.
 */

import { useState, useCallback } from 'react';
import { itemsService } from '../core/services/itemsService';
import type { ItemDecrypted, CredentialDecrypted, BankCardDecrypted, SecureNoteDecrypted } from '@common/types/items.types';

export interface UseItemsCRUDReturn {
  // State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addItem: (item: ItemDecrypted) => Promise<void>;
  addCredential: (credential: CredentialDecrypted) => Promise<void>;
  addBankCard: (bankCard: BankCardDecrypted) => Promise<void>;
  addSecureNote: (secureNote: SecureNoteDecrypted) => Promise<void>;
  editItem: (itemId: string, updates: Partial<ItemDecrypted>) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  clearError: () => void;
}

export const useItemsCRUD = (): UseItemsCRUDReturn => {
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add credential
  const addCredential = useCallback(async (credential: CredentialDecrypted) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // ✅ Hook calls service for business logic
      await itemsService.addItem(credential);
      
      console.log('[useItemsCRUD] Credential added successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add credential';
      setError(errorMessage);
      console.error('[useItemsCRUD] Add credential failed:', err);
      throw err; // Re-throw for UI handling
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add bank card
  const addBankCard = useCallback(async (bankCard: BankCardDecrypted) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // ✅ Hook calls service for business logic
      await itemsService.addItem(bankCard);
      
      console.log('[useItemsCRUD] Bank card added successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add bank card';
      setError(errorMessage);
      console.error('[useItemsCRUD] Add bank card failed:', err);
      throw err; // Re-throw for UI handling
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add secure note
  const addSecureNote = useCallback(async (secureNote: SecureNoteDecrypted) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // ✅ Hook calls service for business logic
      await itemsService.addItem(secureNote);
      
      console.log('[useItemsCRUD] Secure note added successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add secure note';
      setError(errorMessage);
      console.error('[useItemsCRUD] Add secure note failed:', err);
      throw err; // Re-throw for UI handling
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Edit item
  const editItem = useCallback(async (itemId: string, updates: Partial<ItemDecrypted>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // ✅ Hook calls service for business logic
      await itemsService.updateItem(itemId, updates as ItemDecrypted);
      
      console.log('[useItemsCRUD] Item edited successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to edit item';
      setError(errorMessage);
      console.error('[useItemsCRUD] Edit item failed:', err);
      throw err; // Re-throw for UI handling
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete item
  const deleteItem = useCallback(async (itemId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // ✅ Hook calls service for business logic
      await itemsService.deleteItem(itemId);
      
      console.log('[useItemsCRUD] Item deleted successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete item';
      setError(errorMessage);
      console.error('[useItemsCRUD] Delete item failed:', err);
      throw err; // Re-throw for UI handling
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ Generic addItem method for useItemsState compatibility
  const addItem = useCallback(async (item: ItemDecrypted) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // ✅ Hook calls service for business logic
      await itemsService.addItem(item);
      
      console.log('[useItemsCRUD] Item added successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item';
      setError(errorMessage);
      console.error('[useItemsCRUD] Add item failed:', err);
      throw err; // Re-throw for UI handling
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isLoading,
    error,
    
    // Actions
    addItem, // ✅ Generic method for useItemsState
    addCredential,
    addBankCard,
    addSecureNote,
    editItem,
    deleteItem,
    clearError,
  };
};
