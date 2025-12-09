// useItemBankCard.ts
// This hook manages bank card item UI state:
// - Card number formatting
// - Display formatting

import { useMemo } from 'react';
import { useCardFormatting } from './useCardFormatting'; // ✅ Use focused formatting hook
import type { BankCardDecrypted } from '@common/types/items.types';

export const useItemBankCard = (card: BankCardDecrypted) => {
  // ✅ Use focused formatting hook
  const { formatCardNumber } = useCardFormatting();
  
  // Step 1: Format card number using focused hook
  const displayCardNumber = useMemo(() => {
    return formatCardNumber(card.cardNumber);
  }, [card.cardNumber, formatCardNumber]);

  return {
    displayCardNumber,
  };
};
