/**
 * useSecureNoteOperations Hook - Layer 1: UI Layer
 * 
 * Provides business operations for secure notes:
 * - Delete secure note
 * - Add secure note
 * - Edit secure note
 * 
 * Business logic is delegated to itemsService.
 */

import { useState, useCallback } from 'react';
import { deleteItem, addItem, updateItem } from '../core/services/itemsService';
import type { SecureNoteDecrypted } from '../core/types/items.types';

export interface UseSecureNoteOperationsReturn {
  // State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  deleteSecureNote: (noteId: string) => Promise<void>;
  addSecureNote: (note: SecureNoteDecrypted) => Promise<void>;
  editSecureNote: (noteId: string, updates: Partial<SecureNoteDecrypted>) => Promise<void>;
  clearError: () => void;
}

export const useSecureNoteOperations = (): UseSecureNoteOperationsReturn => {
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delete secure note
  const deleteSecureNote = useCallback(async (noteId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // ✅ Hook calls service for business logic
      await deleteItem(noteId);
      
      console.log('[useSecureNoteOperations] Secure note deleted successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete secure note';
      setError(errorMessage);
      console.error('[useSecureNoteOperations] Delete failed:', err);
      throw err; // Re-throw for UI handling
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add secure note
  const addSecureNote = useCallback(async (note: SecureNoteDecrypted) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // ✅ Hook calls service for business logic
      await addItem(note);
      
      console.log('[useSecureNoteOperations] Secure note added successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add secure note';
      setError(errorMessage);
      console.error('[useSecureNoteOperations] Add failed:', err);
      throw err; // Re-throw for UI handling
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Edit secure note
  const editSecureNote = useCallback(async (noteId: string, updates: Partial<SecureNoteDecrypted>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // ✅ Hook calls service for business logic
      await updateItem(noteId, updates as SecureNoteDecrypted);
      
      console.log('[useSecureNoteOperations] Secure note edited successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to edit secure note';
      setError(errorMessage);
      console.error('[useSecureNoteOperations] Edit failed:', err);
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
    deleteSecureNote,
    addSecureNote,
    editSecureNote,
    clearError,
  };
};
