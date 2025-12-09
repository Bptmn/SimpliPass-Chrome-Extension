// useAddCard2.ts
// This hook manages add card step 2 page business logic:
// - Form state management
// - Card preview generation
// - Navigation
// - Error handling

import { useState, useMemo, useCallback } from 'react';
// Removed unused import
import { createExpirationDate, parseExpirationDate } from '@common/utils/expirationDate';
import type { BankCardDecrypted } from '@common/types/items.types';

export const useAddCard2 = (
  formData: {
    title: string;
    cardNumber: string;
    cardholderName: string;
    expirationDate: string;
    cvv: string;
    notes?: string;
  },
  selectedColor: string
) => {
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  // Step 1: Generate card preview object
  const previewCard: BankCardDecrypted = useMemo(() => ({
    id: 'preview',
    itemType: 'bank_card',
    title: formData.title || 'Titre de la carte',
    owner: formData.cardholderName || 'Nom du titulaire',
    cardholderName: formData.cardholderName || 'Nom du titulaire',
    note: formData.notes || '',
    color: selectedColor,
    itemKey: '',
    cardNumber: formData.cardNumber || '0000 0000 0000 0000',
    expirationDate: parseExpirationDate(formData.expirationDate) || createExpirationDate(1, new Date().getFullYear() + 1),
    verificationNumber: formData.cvv || '123',
    cvv: formData.cvv || '123',
    bankName: formData.cardholderName || 'Nom du titulaire',
    bankDomain: '',
    lastUseDateTime: new Date(),
    createdDateTime: new Date(),
  }), [formData, selectedColor]);

  // Step 2: Handle date picker visibility
  const showDatePicker = useCallback(() => {
    setDatePickerVisible(true);
  }, []);

  const hideDatePicker = useCallback(() => {
    setDatePickerVisible(false);
  }, []);

  return {
    previewCard,
    isDatePickerVisible,
    showDatePicker,
    hideDatePicker,
  };
}; 