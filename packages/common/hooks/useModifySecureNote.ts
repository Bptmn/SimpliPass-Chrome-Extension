// useModifySecureNote.ts
// This hook manages modify secure note page business logic:
// - Form state management
// - Update operations
// - Navigation
// - Error handling

import { useState, useCallback } from 'react';
import { itemsService } from '@common/core/services/itemsService';
import { ROUTES } from '@common/ui/router/ROUTES';
import { useAppRouterContext } from '@common/ui/router/AppRouterProvider';
import { CATEGORIES } from '@common/core/types/categories.types';
import type { SecureNoteDecrypted } from '@common/core/types/items.types';

export const useModifySecureNote = (secureNote: SecureNoteDecrypted | null) => {
  const router = useAppRouterContext();
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
      router.navigateTo(ROUTES.HOME, { category: CATEGORIES.SECURE_NOTES });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la modification de la note.');
    } finally {
      setLoading(false);
    }
  }, [secureNote, router]);

  return {
    error,
    loading,
    handleSubmit,
  };
}; 