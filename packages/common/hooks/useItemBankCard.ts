// useItemBankCard.ts
// This hook manages bank card item UI state:
// - Card number formatting
// - Display formatting

import { useMemo } from 'react';
import { useCardFormatting } from './useCardFormatting'; // ✅ Use focused formatting hook
import type { BankCardDecrypted } from '@common/types/items.types';

export const useItemBankCard = (card: BankCardDecrypted) => {
  // ✅ Use focused formatting hook
  const { maskCardNumber } = useCardFormatting();
  
  // Step 1: Mask card number by default for security (showing only last 4 digits)
  const displayCardNumber = useMemo(() => {
    return maskCardNumber(card.cardNumber);
  }, [card.cardNumber, maskCardNumber]);

  return {
    displayCardNumber,
  };
};
