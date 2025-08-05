/**
 * useClipboard Hook - Layer 1: UI Layer
 * 
 * Clipboard operations with error handling:
 * - Copy text to clipboard
 * - Success/error state management
 * - Toast notification integration
 * - Error propagation to ErrorBoundary
 * 
 * Pure UI state management only.
 */

import { useState, useCallback } from 'react';
import { useToast } from '../../ui/components/Toast';

export interface UseClipboardReturn {
  // State
  isCopying: boolean;
  
  // Actions
  copyToClipboard: (text: string, successMessage?: string, errorMessage?: string) => Promise<boolean>;
  copyToClipboardSilent: (text: string) => Promise<boolean>;
  isClipboardAvailable: () => boolean;
}

export const useClipboard = (): UseClipboardReturn => {
  const [isCopying, setIsCopying] = useState(false);
  const { showToast } = useToast();

  // ✅ Copy text to clipboard with success/error feedback
  const copyToClipboard = useCallback(async (
    text: string, 
    successMessage: string = 'Copied to clipboard', 
    errorMessage: string = 'Failed to copy'
  ): Promise<boolean> => {
    if (!text) {
      showToast('Nothing to copy');
      return false;
    }

    setIsCopying(true);

    try {
      await navigator.clipboard.writeText(text);
      showToast(successMessage);
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : errorMessage;
      showToast(errorMsg);
      console.error('[useClipboard] Copy failed:', err);
      // ✅ Propagate error to ErrorBoundary
      throw new Error(errorMsg);
    } finally {
      setIsCopying(false);
    }
  }, [showToast]);

  // ✅ Copy text to clipboard without toast notifications
  const copyToClipboardSilent = useCallback(async (text: string): Promise<boolean> => {
    if (!text) {
      return false;
    }

    setIsCopying(true);

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to copy';
      console.error('[useClipboard] Silent copy failed:', err);
      // ✅ Propagate error to ErrorBoundary
      throw new Error(errorMsg);
    } finally {
      setIsCopying(false);
    }
  }, []);

  // ✅ Check if clipboard API is available
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