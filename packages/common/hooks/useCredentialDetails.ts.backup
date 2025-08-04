// useCredentialDetails.ts
// This hook manages credential details page business logic:
// - Edit navigation
// - URL launching
// - Delete operations
// - Copy operations
// - Error handling

import { useCallback } from 'react';
import { deleteItem } from '@common/core/services/itemsService';
import { textFormattingService } from '@common/core/services/formattingService';
import { ROUTES } from '@common/ui/router/ROUTES';
import { useAppRouterContext } from '@common/ui/router/AppRouterProvider';
import type { CredentialDecrypted } from '@common/core/types/items.types';

export const useCredentialDetails = (
  credential: CredentialDecrypted,
  onBack: () => void,
  setError: (error: string | null) => void,
  setLoading: (loading: boolean) => void,
  showToast: (message: string) => void,
  copyToClipboard: (text: string, message: string) => void,
  togglePasswordVisibility: () => void
) => {
  const router = useAppRouterContext();

  // Step 1: Handle edit navigation
  const handleEdit = useCallback(() => {
    router.navigateTo(ROUTES.MODIFY_CREDENTIAL, { credential });
  }, [router, credential]);

  // Step 2: Handle URL launching
  const handleLaunch = useCallback((url: string) => {
    try {
      const normalizedUrl = textFormattingService.formatURL(url);
      window.open(normalizedUrl, '_blank');
    } catch {
      setError("Erreur lors de l'ouverture du lien.");
    }
  }, [setError]);

  // Step 3: Handle delete initiation
  const handleDelete = useCallback(() => {
    // This will be handled by the component's state
    // The component should set showDeleteConfirm to true
  }, []);

  // Step 4: Handle delete confirmation
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
  }, [credential.id, onBack, setError, setLoading, showToast]);

  // Step 5: Handle copy operations
  const handleCopyUsername = useCallback(() => {
    copyToClipboard(credential.username, "Nom d'utilisateur copié !");
  }, [credential.username, copyToClipboard]);

  const handleCopyPassword = useCallback(() => {
    copyToClipboard(credential.password, "Mot de passe copié !");
  }, [credential.password, copyToClipboard]);

  const handleCopyNote = useCallback(() => {
    copyToClipboard(credential.note, "Note copiée !");
  }, [credential.note, copyToClipboard]);

  return {
    handleEdit,
    handleLaunch,
    handleDelete,
    confirmDelete,
    handleCopyUsername,
    handleCopyPassword,
    handleCopyNote,
  };
}; 