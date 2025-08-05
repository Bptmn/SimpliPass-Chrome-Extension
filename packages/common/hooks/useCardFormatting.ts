/**
 * useCardFormatting Hook - Layer 1: UI Layer
 * 
 * Provides card formatting functionality:
 * - Card number formatting
 * - Card display formatting
 * 
 * Business logic is delegated to formattingService.
 */

import { useMemo } from 'react';
import { formatCardNumber, maskCardNumber } from '@common/utils/formatting';

export interface UseCardFormattingReturn {
  formatCardNumber: (cardNumber: string) => string;
  maskCardNumber: (cardNumber: string) => string;
}

export const useCardFormatting = (): UseCardFormattingReturn => {
  const formatCardNumberForDisplay = useMemo(() => {
    return (cardNumber: string) => formatCardNumber(cardNumber);
  }, []);

  const maskCardNumberForSecurity = useMemo(() => {
    return (cardNumber: string) => maskCardNumber(cardNumber);
  }, []);

  return {
    formatCardNumber: formatCardNumberForDisplay,
    maskCardNumber: maskCardNumberForSecurity,
  };
};
