/**
 * useItems Hook - Layer 1: UI Layer
 * 
 * Provides unified interface for all item management operations.
 * Handles UI state and abstracts complexity from components.
 */

import { useState } from 'react';
import { useItemStates } from '../core/states/itemStates';
import { addItemToDatabase, updateItemInDatabase, deleteItemFromDatabase } from '../core/services/items';
import { 
  CredentialDecrypted, 
  BankCardDecrypted, 
  SecureNoteDecrypted,
  ItemDecrypted 
} from '../core/types/items.types';
import { platform } from '../core/adapters/platform.adapter';
import { db } from '../core/adapters/database.adapter';
import { generateItemKey } from '../utils/crypto';

type ItemType = 'credential' | 'bankCard' | 'secureNote';

// Type-safe input types for adding items
type AddCredentialInput = Omit<CredentialDecrypted, 'id' | 'createdDateTime' | 'lastUseDateTime' | 'itemKey'>;
type AddBankCardInput = Omit<BankCardDecrypted, 'id' | 'createdDateTime' | 'lastUseDateTime' | 'itemKey'>;
type AddSecureNoteInput = Omit<SecureNoteDecrypted, 'id' | 'createdDateTime' | 'lastUseDateTime' | 'itemKey'>;

export const useItems = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store
  const itemStates = useItemStates();

  // Generic add function
  const addItem = async <T extends ItemDecrypted>(
    itemType: T['itemType'], 
    itemData: Omit<T, 'id' | 'createdDateTime' | 'lastUseDateTime' | 'itemKey'>
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Generate item ID
      const id = db.generateItemId();
      
      // 2. Generate item key
      const itemKey = generateItemKey();
      
      // 3. Create complete item
      const now = new Date();
      const completeItem: T = {
        id,
        itemKey,
        ...itemData,
        createdDateTime: now,
        lastUseDateTime: now,
        itemType: itemType,
      } as T;
      
      // 4. Call addItemToDatabase
      await addItemToDatabase(completeItem);
      
      // 5. Add to state
      itemStates.addItemToState(completeItem);
      
      // Return success for UI to handle toast
      return { success: true, data: completeItem };
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to add ${itemType}`;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Generic update function
  const updateItem = async (id: string, type: ItemType, updates: Partial<ItemDecrypted>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Update in database
      await updateItemInDatabase(id, updates as any);
      
      // 2. Update in state
      itemStates.updateItemInState(id, updates);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to update ${type}`;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Generic delete function
  const deleteItem = async (id: string, type: ItemType) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Delete from database
      await deleteItemFromDatabase(id);
      
      // 2. Remove from state
      itemStates.deleteItemFromState(id);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to delete ${type}`;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Type-specific operations
  const copyPassword = async (credentialId: string) => {
    try {
      const credential = itemStates.getItemsByTypeFromState('credential').find(c => c.id === credentialId) as CredentialDecrypted | undefined;
      if (!credential) {
        throw new Error('Credential not found');
      }
      await platform.copyToClipboard(credential.password);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to copy password';
      return { success: false, error: errorMessage };
    }
  };

  // Convenience functions for each item type
  const addCredential = (data: AddCredentialInput) => 
    addItem('credential', data);
  
  const addBankCard = (data: AddBankCardInput) => 
    addItem('bankCard', data);
  
  const addSecureNote = (data: AddSecureNoteInput) => 
    addItem('secureNote', data);

  return {
    // State
    isLoading,
    error,
    clearError: () => setError(null),
    
    // Data - computed from unified state
    credentials: itemStates.getItemsByTypeFromState('credential') as CredentialDecrypted[],
    bankCards: itemStates.getItemsByTypeFromState('bankCard') as BankCardDecrypted[],
    secureNotes: itemStates.getItemsByTypeFromState('secureNote') as SecureNoteDecrypted[],
    allItems: itemStates.getAllItemsFromState(),
    
    // Generic operations
    addItem,
    updateItem,
    deleteItem,
    
    // Convenience operations
    addCredential,
    addBankCard,
    addSecureNote,
    
    // Type-specific operations
    copyPassword,
    
    // State setters (for initialization)
    setItems: itemStates.setItemsInState,
  };
}; 