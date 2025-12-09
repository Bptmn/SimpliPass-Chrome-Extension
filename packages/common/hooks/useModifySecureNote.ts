// useModifySecureNote.ts
// This hook manages modify secure note page business logic:
// - Form state management
// - Update operations
// - Navigation
// - Error handling

import { useState, useCallback } from 'react';
import { itemsService } from '@common/core/services/itemsService';
// Note: Router imports removed - navigation should be handled by the calling component
import { CATEGORIES } from '@common/types/categories.types';
import type { SecureNoteDecrypted } from '@common/types/items.types';

export const useModifySecureNote = (secureNote: SecureNoteDecrypted | null) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Handle form submission
  const handleSubmit = useCallback(async (
    title: string,
    noteText: string,
    color: string,
    showToast: (message: string) => void
  ) => {
    if (!secureNote) {
      setError('Note introuvable');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const updatedNote: SecureNoteDecrypted = {
        ...secureNote,
        title,
        note: noteText,
        color,
        lastUseDateTime: new Date(),
      };
      
      await itemsService.updateItem(secureNote.id, updatedNote);
      showToast('Note modifiée avec succès');
      // Navigation should be handled by the calling component
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la modification de la note.');
    } finally {
      setLoading(false);
    }
  }, [secureNote]);

  return {
    error,
    loading,
    handleSubmit,
  };
}; 