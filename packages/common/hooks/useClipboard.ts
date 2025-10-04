// useClipboard.ts
// This hook manages UI state for clipboard operations.
// Responsibilities:
// - Clipboard copy functionality
// - Success/error state management
// Note: Toast notifications should be handled by the UI layer

import { useState, useCallback } from 'react';

export const useClipboard = () => {
  const [isCopying, setIsCopying] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>('');

  /**
   * Copies text to clipboard with success/error feedback
   */
  const copyToClipboard = useCallback(async (text: string, successMessage: string = 'Copied to clipboard', errorMessage: string = 'Failed to copy') => {
    if (!text) {
      setLastMessage('Nothing to copy');
      return false;
    }

    setIsCopying(true);

    try {
      await navigator.clipboard.writeText(text);
      setLastMessage(successMessage);
      return true;
    } catch (_error) {
      setLastMessage(errorMessage);
      return false;
    } finally {
      setIsCopying(false);
    }
  }, []);

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
    lastMessage,
    copyToClipboard,
    copyToClipboardSilent,
    isClipboardAvailable
  };
}; 