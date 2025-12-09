// useBankCardDetails.ts
// This hook manages bank card details UI state:
// - Card operations (edit, delete, copy)
// - Card formatting
// - Error handling

import { useCallback } from 'react';
import { useCardFormatting } from './useCardFormatting'; // ✅ Use focused formatting hook
import { useItemsCRUD } from './useItemsCRUD';
import type { BankCardDecrypted } from '@common/types/items.types';

export const useBankCardDetails = (
  card: BankCardDecrypted,
  onBack: () => void,
  setError: (error: string | null) => void,
  setLoading: (loading: boolean) => void,
  showToast: (message: string) => void,
  copyToClipboard: (text: string, message: string) => void
) => {
  const { deleteItem } = useItemsCRUD();
  const { formatCardNumber } = useCardFormatting(); // ✅ Use focused formatting hook

  // Step 1: Format card number for display
  const displayCardNumber = formatCardNumber(card.cardNumber);

  // Step 2: Handle edit operation
  const handleEdit = useCallback(() => {
    // TODO: Navigate to edit page - let parent handle this
    console.log('Edit bank card:', card.id);
  }, [card]);

  // Step 3: Handle copy operations
  const handleCopyOwner = useCallback(() => {
    copyToClipboard(card.owner, 'Titulaire copié !');
  }, [card.owner, copyToClipboard]);

  const handleCopyCardNumber = useCallback(() => {
    copyToClipboard(card.cardNumber, 'Numéro de carte copié !');
  }, [card.cardNumber, copyToClipboard]);

  const handleCopyCVV = useCallback(() => {
    copyToClipboard(card.verificationNumber, 'CVV copié !');
  }, [card.verificationNumber, copyToClipboard]);

  const handleCopyNote = useCallback(() => {
    copyToClipboard(card.note, 'Note copiée !');
  }, [card.note, copyToClipboard]);

  // Step 4: Handle delete operation
  const confirmDelete = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteItem(card.id);
      showToast('Carte supprimée avec succès');
      onBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la suppression.');
    } finally {
      setLoading(false);
    }
  }, [card.id, deleteItem, onBack, showToast, setError, setLoading]);

  return {
    handleEdit,
    confirmDelete,
    handleCopyOwner,
    handleCopyCardNumber,
    handleCopyCVV,
    handleCopyNote,
    displayCardNumber,
  };
};
