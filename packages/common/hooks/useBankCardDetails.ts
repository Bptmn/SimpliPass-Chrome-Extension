// useBankCardDetails.ts
// This hook manages bank card details UI state:
// - Card operations (edit, delete, copy)
// - Card formatting
// - Error handling

import { useCallback } from 'react';
import { useCardFormatting } from './useCardFormatting'; // ✅ Use focused formatting hook
import { useClipboard } from './useClipboard';
import { useItems } from './useItems';
import { useToast } from '../ui/components/Toast';
import { ROUTES } from '../ui/router/ROUTES';
import { useAppRouterContext } from '../ui/router/AppRouterProvider';
import type { BankCardDecrypted } from '../core/types/items.types';

export const useBankCardDetails = (
  card: BankCardDecrypted,
  onBack: () => void,
  setError: (error: string | null) => void,
  setLoading: (loading: boolean) => void,
  showToast: (message: string) => void,
  copyToClipboard: (text: string, message: string) => void
) => {
  const router = useAppRouterContext();
  const { editItem, deleteItem } = useItems({ user: null }); // User will be passed from parent
  const { formatCardNumber } = useCardFormatting(); // ✅ Use focused formatting hook

  // Step 1: Format card number for display
  const displayCardNumber = formatCardNumber(card.cardNumber);

  // Step 2: Handle edit operation
  const handleEdit = useCallback(() => {
    router.navigateTo(ROUTES.MODIFY_BANKCARD, { bankCard: card });
  }, [router, card]);

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
