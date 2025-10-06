// useModifyCredential.ts
// This hook manages modify credential page business logic:
// - Form state management
// - Update operations
// - Navigation
// - Error handling

import { useState, useCallback } from 'react';
import { itemsService } from '@common/core/services/itemsService';
// Note: Router imports removed - navigation should be handled by the calling component
import { CATEGORIES } from '@common/core/types/categories.types';
import type { CredentialDecrypted } from '@common/core/types/items.types';

export const useModifyCredential = (credential: CredentialDecrypted | null) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Handle form submission
  const handleSubmit = useCallback(async (
    title: string,
    username: string,
    password: string,
    url: string,
    note: string,
    showToast: (message: string) => void
  ) => {
    if (!credential) {
      setError('Identifiant introuvable');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const updatedCredential: CredentialDecrypted = {
        ...credential,
        title,
        username,
        password,
        url,
        note,
        lastUseDateTime: new Date(),
      };

      await itemsService.updateItem(credential.id, updatedCredential);
      showToast('Identifiant modifié avec succès');
      // Navigation should be handled by the calling component
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la modification de l\'identifiant.');
    } finally {
      setLoading(false);
    }
  }, [credential]);

  return {
    error,
    loading,
    handleSubmit,
  };
}; 