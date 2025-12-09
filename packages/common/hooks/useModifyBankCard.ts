// useModifyBankCard.ts
// This hook manages modify bank card page business logic:
// - Form state management
// - Update operations
// - Navigation
// - Error handling

import { useState, useCallback } from 'react';
import { itemsService } from '@common/core/services/itemsService';
// Note: Router imports removed - navigation should be handled by the calling component
import { CATEGORIES } from '@common/types/categories.types';
import type { BankCardDecrypted } from '@common/types/items.types';

export const useModifyBankCard = (bankCard: BankCardDecrypted) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Handle form submission
  const handleSubmit = useCallback(async (
    formData: {
      title: string;
      cardNumber: string;
      cardholderName: string;
      expirationDate: string;
      cvv: string;
      notes: string;
    },
    color: string,
    showToast: (message: string) => void
  ) => {
    setError(null);
    setLoading(true);
    
    try {
      const [month, year] = formData.expirationDate.split('/');
      const updatedCard: BankCardDecrypted = {
        ...bankCard,
        title: formData.title,
        bankName: formData.cardholderName, // Using cardholderName as bankName for consistency
        owner: formData.cardholderName,
        cardNumber: formData.cardNumber.replace(/\s/g, ''), // Remove spaces for storage
        expirationDate: {
          month: parseInt(month, 10),
          year: parseInt(`20${year}`, 10),
        },
        verificationNumber: formData.cvv,
        note: formData.notes,
        color,
        lastUseDateTime: new Date(),
      };

      await itemsService.updateItem(bankCard.id, updatedCard);
      showToast('Carte modifiée avec succès');
      // Navigation should be handled by the calling component
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la modification de la carte.');
    } finally {
      setLoading(false);
    }
  }, [bankCard]);

  return {
    error,
    loading,
    handleSubmit,
  };
}; 