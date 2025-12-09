/**
 * SecureNoteDetailsPage.tsx (Extension / DOM)
 * 
 * Details view for a secure note with edit, delete, and copy functionality
 */

import React, { useState } from 'react';
import { HeaderBar } from '@extension/ui/components/HeaderBar';
import { ErrorBanner } from '@extension/ui/components/ErrorBanner';
import { Button } from '@extension/ui/components/Buttons';
import { DetailField } from '@extension/ui/components/DetailField';
import { MoreInfo } from '@extension/ui/components/MoreInfo';
import { ItemSecureNote } from '@extension/ui/components/ItemSecureNote';
import { ConfirmDialog } from '@extension/ui/components/ConfirmDialog';
import { useAppRouterContext } from '../router/AppRouterProvider';
import { ROUTES } from '../router/ROUTES';
import { useItemsCRUD } from '@common/hooks/useItemsCRUD';
import { useClipboard } from '@common/hooks/useClipboard';
import { colors, spacing, radius, pageStyles, commonStyles } from '../design';
import type { SecureNoteDecrypted } from '@common/types/items.types';

interface SecureNoteDetailsPageProps {
  note: SecureNoteDecrypted;
  onBack: () => void;
}

export const SecureNoteDetailsPage: React.FC<SecureNoteDetailsPageProps> = ({
  note,
  onBack,
}) => {
  const router = useAppRouterContext();
  const { deleteItem, isLoading, error } = useItemsCRUD();
  const { copyToClipboard } = useClipboard();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEdit = () => {
    router.navigateTo(ROUTES.MODIFY_SECURENOTE, { secureNote: note });
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      await deleteItem(note.id);
      onBack();
    } catch (e) {
      console.error('[SecureNoteDetailsPage] Delete failed:', e);
    }
  };

  const handleCopyTitle = () => {
    copyToClipboard(note.title);
  };

  const handleCopyContent = () => {
    copyToClipboard(note.note);
  };

  return (
    <div style={styles.pageContainer} data-testid="secure-note-details-page">
      {error && <ErrorBanner message={error} />}
      
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Confirmation"
        message="Êtes-vous sûr de vouloir supprimer cette note ?"
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        testId="delete-confirm-dialog"
      />
      
      {/* Header - Fixed, non-scrollable */}
      <HeaderBar title={note.title} onBackPress={onBack} />
      
      <div style={styles.pageContent}>

        {/* Note content */}
        <DetailField
          label="Note :"
          value={note.note}
          showCopyButton
          onCopy={handleCopyContent}
        />

        {/* More Info */}
        <MoreInfo
          lastUseDateTime={note.lastUseDateTime}
          createdDateTime={note.createdDateTime}
        />

        {/* Actions */}
        <div style={styles.actionsRow}>
          <Button
            onClick={handleEdit}
            variant="secondary"
            disabled={isLoading}
            data-testid="edit-note-button"
            style={{ flex: 1, maxWidth: 135 }}
          >
            Modifier
          </Button>
          <Button
            onClick={handleDelete}
            variant="danger"
            disabled={isLoading}
            data-testid="delete-note-button"
            style={{ flex: 1, maxWidth: 135 }}
          >
            Supprimer
          </Button>
        </div>
      </div>
      
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  ...pageStyles,
  ...commonStyles,
  pageContainer: {
    ...pageStyles.pageContainer,
    overflow: 'auto',
    maxWidth: '100%',
  },
  pageContent: {
    ...pageStyles.pageContentWithGap,
  },
  colorCircle: {
    borderRadius: spacing.lg * 2,
    height: 28,
    width: 28,
  },
};

export default SecureNoteDetailsPage;
