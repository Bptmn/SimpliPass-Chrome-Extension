// useItemBankCard.ts
// This hook manages bank card item business logic:
// - Card number formatting
// - Display formatting

import { useMemo } from 'react';
import { cardFormattingService } from '@common/core/services/formattingService';
import type { BankCardDecrypted } from '@common/core/types/items.types';

export const useItemBankCard = (card: BankCardDecrypted) => {
  // Step 1: Format card number using service
  const displayCardNumber = useMemo(() => {
    return cardFormattingService.formatCardNumber(card.cardNumber);
  }, [card.cardNumber]);

  return {
    displayCardNumber,
  };
}; 