// useCredentialDetails.ts
// This hook manages credential details UI state:
// - Credential operations (edit, delete, copy, launch)
// - URL formatting
// - Error handling

import { useCallback } from 'react';
import { useTextFormatting } from './useTextFormatting'; // ✅ Use focused formatting hook
import { useItemsState } from './useItemsState';
import { ROUTES } from '../ui/router/ROUTES';
import { useAppRouterContext } from '../ui/router/AppRouterProvider';
import type { CredentialDecrypted } from '../core/types/items.types';

export const useCredentialDetails = (
  credential: CredentialDecrypted,
  onBack: () => void,
  setError: (error: string | null) => void,
  setLoading: (loading: boolean) => void,
  showToast: (message: string) => void,
  copyToClipboard: (text: string, message: string) => void,
  _togglePasswordVisibility: () => void
) => {
  const router = useAppRouterContext();
  const { deleteItem } = useItemsState({ user: null }); // User will be passed from parent
  const { formatURL } = useTextFormatting(); // ✅ Use focused formatting hook

  // Step 1: Format URL for display
  const normalizedUrl = formatURL(credential.url);

  // Step 2: Handle edit operation
  const handleEdit = useCallback(() => {
    router.navigateTo(ROUTES.MODIFY_CREDENTIAL, { credential });
  }, [router, credential]);

  // Step 3: Handle launch operation
  const handleLaunch = useCallback((url: string) => {
    if (url) {
      window.open(url, '_blank');
    }
  }, []);

  // Step 4: Handle copy operations
  const handleCopyUsername = useCallback(() => {
    copyToClipboard(credential.username, 'Nom d\'utilisateur copié !');
  }, [credential.username, copyToClipboard]);

  const handleCopyPassword = useCallback(() => {
    copyToClipboard(credential.password, 'Mot de passe copié !');
  }, [credential.password, copyToClipboard]);

  const handleCopyNote = useCallback(() => {
    copyToClipboard(credential.note, 'Note copiée !');
  }, [credential.note, copyToClipboard]);

  // Step 5: Handle delete operation
  const confirmDelete = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteItem(credential.id);
      showToast('Identifiant supprimé avec succès');
      onBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la suppression.');
    } finally {
      setLoading(false);
    }
  }, [credential.id, deleteItem, onBack, showToast, setError, setLoading]);

  return {
    handleEdit,
    handleLaunch,
    confirmDelete,
    handleCopyUsername,
    handleCopyPassword,
    handleCopyNote,
    normalizedUrl,
  };
};
