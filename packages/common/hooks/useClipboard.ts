// useClipboard.ts
// This hook manages UI state for clipboard operations.
// Responsibilities:
// - Clipboard copy functionality
// - Success/error state management
// - Toast notification integration

import { useState, useCallback } from 'react';
import { useToast } from '@common/ui/components/Toast';

export const useClipboard = () => {
  const [isCopying, setIsCopying] = useState(false);
  const { showToast } = useToast();

  /**
   * Copies text to clipboard with success/error feedback
   */
  const copyToClipboard = useCallback(async (text: string, successMessage: string = 'Copied to clipboard', errorMessage: string = 'Failed to copy') => {
    if (!text) {
      showToast('Nothing to copy', 'error');
      return false;
    }

    setIsCopying(true);

    try {
      await navigator.clipboard.writeText(text);
      showToast(successMessage, 'success');
      return true;
    } catch (_error) {
      showToast(errorMessage, 'error');
      return false;
    } finally {
      setIsCopying(false);
    }
  }, [showToast]);

  /**
   * Copies text to clipboard without toast notifications
   */
  const copyToClipboardSilent = useCallback(async (text: string): Promise<boolean> => {
    if (!text) {
      return false;
    }

    setIsCopying(true);

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_error) {
      return false;
    } finally {
      setIsCopying(false);
    }
  }, []);

  /**
   * Checks if clipboard API is available
   */
  const isClipboardAvailable = useCallback(() => {
    return navigator.clipboard && typeof navigator.clipboard.writeText === 'function';
  }, []);

  return {
    isCopying,
    copyToClipboard,
    copyToClipboardSilent,
    isClipboardAvailable
  };
}; 