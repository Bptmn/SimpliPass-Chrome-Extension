// useTextFormatting.ts
// This hook provides text formatting utilities for UI components.
// Responsibilities:
// - Format URLs for display
// - Format text for display
// - Business logic is delegated to formatting utilities.

import { useMemo } from 'react';
import { formatURL, truncateText } from '@common/utils/formatting';

export interface UseTextFormattingReturn {
  formatURL: (url: string) => string;
  truncateText: (text: string, maxLength: number) => string;
}

export const useTextFormatting = (): UseTextFormattingReturn => {
  const formatURLForDisplay = useMemo(() => {
    return (url: string) => formatURL(url);
  }, []);

  const truncateTextForDisplay = useMemo(() => {
    return (text: string, maxLength: number) => truncateText(text, maxLength);
  }, []);

  return {
    formatURL: formatURLForDisplay,
    truncateText: truncateTextForDisplay,
  };
};
