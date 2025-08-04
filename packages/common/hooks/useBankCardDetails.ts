// useBankCardDetails.ts
// This hook manages bank card details page business logic:
// - Edit navigation
// - Delete operations
// - Copy operations
// - Error handling

import { useCallback } from 'react';
import { deleteItem } from '@common/core/services/itemsService';
import { cardFormattingService } from '@common/core/services/formattingService';
import { ROUTES } from '@common/ui/router/ROUTES';
import { useAppRouterContext } from '@common/ui/router/AppRouterProvider';
import type { BankCardDecrypted } from '@common/core/types/items.types';

export const useBankCardDetails = (
  card: BankCardDecrypted,
  onBack: () => void,
  setError: (error: string | null) => void,
  setLoading: (loading: boolean) => void,
  showToast: (message: string) => void,
  copyToClipboard: (text: string, message: string) => void
) => {
  const router = useAppRouterContext();

  // Step 1: Handle edit navigation
  const handleEdit = useCallback(() => {
    router.navigateTo(ROUTES.MODIFY_BANK_CARD, { bankCard: card });
  }, [router, card]);

  // Step 2: Handle delete confirmation
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
  }, [card.id, onBack, setError, setLoading, showToast]);

  // Step 3: Handle copy operations
  const handleCopyOwner = useCallback(() => {
    copyToClipboard(card.owner, 'Titulaire copié !');
  }, [card.owner, copyToClipboard]);

  const handleCopyCardNumber = useCallback(() => {
    copyToClipboard(card.cardNumber, 'Numéro copié !');
  }, [card.cardNumber, copyToClipboard]);

  const handleCopyCVV = useCallback(() => {
    copyToClipboard(card.verificationNumber, 'CVV copié !');
  }, [card.verificationNumber, copyToClipboard]);

  const handleCopyNote = useCallback(() => {
    copyToClipboard(card.note, 'Note copiée !');
  }, [card.note, copyToClipboard]);

  // Step 4: Format card number
  const displayCardNumber = cardFormattingService.formatCardNumber(card.cardNumber);

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