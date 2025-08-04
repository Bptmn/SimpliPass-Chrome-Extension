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
import { cardFormattingService } from '../core/services/formattingService';

export interface UseCardFormattingReturn {
  formatCardNumber: (cardNumber: string) => string;
  formatCardDisplay: (cardNumber: string) => string;
}

export const useCardFormatting = (): UseCardFormattingReturn => {
  // Step 1: Format card number using service
  const formatCardNumber = useMemo(() => {
    return (cardNumber: string) => cardFormattingService.formatCardNumber(cardNumber);
  }, []);

  // Step 2: Format card display using service
  const formatCardDisplay = useMemo(() => {
    return (cardNumber: string) => cardFormattingService.formatCardDisplay(cardNumber);
  }, []);

  return {
    formatCardNumber,
    formatCardDisplay,
  };
};
