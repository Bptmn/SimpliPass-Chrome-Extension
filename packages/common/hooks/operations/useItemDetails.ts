/**
 * useItemDetails Hook - Layer 1: UI Layer
 * 
 * Unified item details operations with proper error handling:
 * - Edit, delete, copy operations for all item types
 * - URL formatting and launching
 * - Error handling and propagation
 * 
 * Business logic is delegated to services.
 */

import { useCallback } from 'react';
import { useAppRouterContext } from '../../ui/router/AppRouterProvider';
import { ROUTES } from '../../ui/router/ROUTES';
import { useItemsOperations } from './useItemsOperations';
import { useAppStateStore } from '../core/useAppState';
import { CredentialDecrypted, BankCardDecrypted, SecureNoteDecrypted } from '../../core/types/items.types';

export interface UseItemDetailsReturn {
  // Actions
  handleEdit: (item: CredentialDecrypted | BankCardDecrypted | SecureNoteDecrypted) => void;
  handleDelete: (itemId: string) => Promise<void>;
  handleCopy: (text: string, message: string) => void;
  handleLaunch: (url: string) => void;
  
  // Formatting
  formatCardNumber: (cardNumber: string) => string;
  formatURL: (url: string) => string;
  
  // State
  isActionLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export interface UseItemDetailsProps {
  onBack: () => void;
  showToast: (message: string) => void;
  copyToClipboard: (text: string, message: string) => void;
}

export const useItemDetails = ({ onBack, showToast, copyToClipboard }: UseItemDetailsProps): UseItemDetailsReturn => {
  const router = useAppRouterContext();
  const user = useAppStateStore(state => state.user);
  const { deleteItem, isActionLoading, error, clearError } = useItemsOperations({ user });

  // ✅ Unified edit handler
  const handleEdit = useCallback((item: CredentialDecrypted | BankCardDecrypted | SecureNoteDecrypted) => {
    try {
      switch (item.itemType) {
        case 'credential':
          router.navigateTo(ROUTES.MODIFY_CREDENTIAL, { credential: item });
          break;
              case 'bank_card':
        router.navigateTo(ROUTES.MODIFY_BANK_CARD, { bankCard: item });
        break;
      case 'secure_note':
        router.navigateTo(ROUTES.MODIFY_SECURE_NOTE, { secureNote: item });
          break;
        default:
          throw new Error(`Unknown item type: ${(item as any).itemType}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to navigate to edit page';
      console.error('[useItemDetails] Edit navigation failed:', err);
      // ✅ Propagate error to ErrorBoundary
      throw new Error(errorMessage);
    }
  }, [router]);

  // ✅ Unified delete handler
  const handleDelete = useCallback(async (itemId: string) => {
    try {
      await deleteItem(itemId);
      showToast('Item deleted successfully');
      onBack();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete item';
      console.error('[useItemDetails] Delete failed:', err);
      // ✅ Propagate error to ErrorBoundary
      throw new Error(errorMessage);
    }
  }, [deleteItem, showToast, onBack]);

  // ✅ Unified copy handler
  const handleCopy = useCallback((text: string, message: string) => {
    try {
      copyToClipboard(text, message);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to copy to clipboard';
      console.error('[useItemDetails] Copy failed:', err);
      // ✅ Propagate error to ErrorBoundary
      throw new Error(errorMessage);
    }
  }, [copyToClipboard]);

  // ✅ URL launch handler
  const handleLaunch = useCallback((url: string) => {
    try {
      if (url) {
        window.open(url, '_blank');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to launch URL';
      console.error('[useItemDetails] URL launch failed:', err);
      // ✅ Propagate error to ErrorBoundary
      throw new Error(errorMessage);
    }
  }, []);

  // ✅ Card number formatting
  const formatCardNumber = useCallback((cardNumber: string): string => {
    try {
      // Remove all non-digits
      const digits = cardNumber.replace(/\D/g, '');
      
      // Format as XXXX XXXX XXXX XXXX
      return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    } catch (err) {
      console.error('[useItemDetails] Card number formatting failed:', err);
      return cardNumber; // Return original if formatting fails
    }
  }, []);

  // ✅ URL formatting
  const formatURL = useCallback((url: string): string => {
    try {
      if (!url) return '';
      
      // Remove protocol if present
      const cleanUrl = url.replace(/^https?:\/\//, '');
      
      // Remove trailing slash
      return cleanUrl.replace(/\/$/, '');
    } catch (err) {
      console.error('[useItemDetails] URL formatting failed:', err);
      return url; // Return original if formatting fails
    }
  }, []);

  return {
    // Actions
    handleEdit,
    handleDelete,
    handleCopy,
    handleLaunch,
    
    // Formatting
    formatCardNumber,
    formatURL,
    
    // State
    isActionLoading,
    error,
    clearError,
  };
}; 