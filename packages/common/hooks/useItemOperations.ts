/**
 * useItemOperations Hook - Layer 1: UI Layer
 * 
 * Provides business operations for all item types:
 * - Add items (credentials, bank cards, secure notes)
 * - Edit items
 * - Delete items
 * 
 * Business logic is delegated to itemsService.
 */

import { useState, useCallback } from 'react';
import { addItem, updateItem, deleteItem } from '../core/services/itemsService';
import type { ItemDecrypted, CredentialDecrypted, BankCardDecrypted, SecureNoteDecrypted } from '../core/types/items.types';

export interface UseItemOperationsReturn {
  // State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addCredential: (credential: CredentialDecrypted) => Promise<void>;
  addBankCard: (bankCard: BankCardDecrypted) => Promise<void>;
  addSecureNote: (secureNote: SecureNoteDecrypted) => Promise<void>;
  editItem: (itemId: string, updates: Partial<ItemDecrypted>) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  clearError: () => void;
}

export const useItemOperations = (): UseItemOperationsReturn => {
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add credential
  const addCredential = useCallback(async (credential: CredentialDecrypted) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // ✅ Hook calls service for business logic
      await addItem(credential);
      
      console.log('[useItemOperations] Credential added successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add credential';
      setError(errorMessage);
      console.error('[useItemOperations] Add credential failed:', err);
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
      await addItem(bankCard);
      
      console.log('[useItemOperations] Bank card added successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add bank card';
      setError(errorMessage);
      console.error('[useItemOperations] Add bank card failed:', err);
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
      await addItem(secureNote);
      
      console.log('[useItemOperations] Secure note added successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add secure note';
      setError(errorMessage);
      console.error('[useItemOperations] Add secure note failed:', err);
      throw err; // Re-throw for UI handling
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Edit item
  const editItemOperation = useCallback(async (itemId: string, updates: Partial<ItemDecrypted>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // ✅ Hook calls service for business logic
      await updateItem(itemId, updates as ItemDecrypted);
      
      console.log('[useItemOperations] Item edited successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to edit item';
      setError(errorMessage);
      console.error('[useItemOperations] Edit item failed:', err);
      throw err; // Re-throw for UI handling
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete item
  const deleteItemOperation = useCallback(async (itemId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // ✅ Hook calls service for business logic
      await deleteItem(itemId);
      
      console.log('[useItemOperations] Item deleted successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete item';
      setError(errorMessage);
      console.error('[useItemOperations] Delete item failed:', err);
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
    addCredential,
    addBankCard,
    addSecureNote,
    editItem: editItemOperation,
    deleteItem: deleteItemOperation,
    clearError,
  };
};
