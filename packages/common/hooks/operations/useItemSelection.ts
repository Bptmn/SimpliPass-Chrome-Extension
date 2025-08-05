/**
 * useItemSelection Hook - Layer 1: UI Layer
 * 
 * Item selection state management with error handling:
 * - Selection state for all item types
 * - Selection validation
 * - Error handling and propagation
 * 
 * Pure UI state management only.
 */

import { useState, useCallback } from 'react';
import { CredentialDecrypted, BankCardDecrypted, SecureNoteDecrypted } from '../../core/types/items.types';

export interface UseItemSelectionReturn {
  // State
  selectedCredential: CredentialDecrypted | null;
  selectedBankCard: BankCardDecrypted | null;
  selectedSecureNote: SecureNoteDecrypted | null;
  error: string | null;
  
  // Actions
  setSelectedCredential: (item: CredentialDecrypted | null) => void;
  setSelectedBankCard: (item: BankCardDecrypted | null) => void;
  setSelectedSecureNote: (item: SecureNoteDecrypted | null) => void;
  clearSelection: () => void;
  validateSelection: (item: CredentialDecrypted | BankCardDecrypted | SecureNoteDecrypted) => boolean;
  clearError: () => void;
}

export const useItemSelection = (): UseItemSelectionReturn => {
  const [selectedCredential, setSelectedCredentialState] = useState<CredentialDecrypted | null>(null);
  const [selectedBankCard, setSelectedBankCardState] = useState<BankCardDecrypted | null>(null);
  const [selectedSecureNote, setSelectedSecureNoteState] = useState<SecureNoteDecrypted | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ Set selected credential with validation
  const setSelectedCredential = useCallback((item: CredentialDecrypted | null) => {
    try {
      if (item && !validateSelection(item)) {
        throw new Error('Invalid credential item');
      }

      setSelectedCredentialState(item);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to select credential';
      setError(errorMessage);
      console.error('[useItemSelection] Credential selection failed:', err);
      // ✅ Propagate error to ErrorBoundary
      throw new Error(errorMessage);
    }
  }, []);

  // ✅ Set selected bank card with validation
  const setSelectedBankCard = useCallback((item: BankCardDecrypted | null) => {
    try {
      if (item && !validateSelection(item)) {
        throw new Error('Invalid bank card item');
      }

      setSelectedBankCardState(item);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to select bank card';
      setError(errorMessage);
      console.error('[useItemSelection] Bank card selection failed:', err);
      // ✅ Propagate error to ErrorBoundary
      throw new Error(errorMessage);
    }
  }, []);

  // ✅ Set selected secure note with validation
  const setSelectedSecureNote = useCallback((item: SecureNoteDecrypted | null) => {
    try {
      if (item && !validateSelection(item)) {
        throw new Error('Invalid secure note item');
      }

      setSelectedSecureNoteState(item);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to select secure note';
      setError(errorMessage);
      console.error('[useItemSelection] Secure note selection failed:', err);
      // ✅ Propagate error to ErrorBoundary
      throw new Error(errorMessage);
    }
  }, []);

  // ✅ Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedCredentialState(null);
    setSelectedBankCardState(null);
    setSelectedSecureNoteState(null);
    setError(null);
  }, []);

  // ✅ Validate selection
  const validateSelection = useCallback((item: CredentialDecrypted | BankCardDecrypted | SecureNoteDecrypted): boolean => {
    try {
      // Basic validation
      if (!item || !item.id || !item.title) {
        return false;
      }

      // Type-specific validation
      switch (item.itemType) {
        case 'credential':
          const credential = item as CredentialDecrypted;
          return !!(credential.username && credential.password);
        case 'bankCard':
          const bankCard = item as BankCardDecrypted;
          return !!(bankCard.cardNumber && bankCard.owner);
        case 'secureNote':
          const secureNote = item as SecureNoteDecrypted;
          return !!(secureNote.content);
        default:
          return false;
      }
    } catch (err) {
      console.error('[useItemSelection] Selection validation failed:', err);
      return false;
    }
  }, []);

  // ✅ Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    selectedCredential,
    selectedBankCard,
    selectedSecureNote,
    error,
    setSelectedCredential,
    setSelectedBankCard,
    setSelectedSecureNote,
    clearSelection,
    validateSelection,
    clearError,
  };
}; 