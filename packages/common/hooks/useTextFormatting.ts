/**
 * useTextFormatting Hook - Layer 1: UI Layer
 * 
 * Provides text formatting functionality:
 * - URL formatting
 * - Text formatting
 * 
 * Business logic is delegated to formattingService.
 */

import { useMemo } from 'react';
import { textFormattingService } from '../core/services/formattingService';

export interface UseTextFormattingReturn {
  formatURL: (url: string) => string;
  formatText: (text: string) => string;
}

export const useTextFormatting = (): UseTextFormattingReturn => {
  // Step 1: Format URL using service
  const formatURL = useMemo(() => {
    return (url: string) => textFormattingService.formatURL(url);
  }, []);

  // Step 2: Format text using service
  const formatText = useMemo(() => {
    return (text: string) => textFormattingService.formatText(text);
  }, []);

  return {
    formatURL,
    formatText,
  };
};
