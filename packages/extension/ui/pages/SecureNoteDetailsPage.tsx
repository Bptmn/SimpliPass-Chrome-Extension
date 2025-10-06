/**
 * SecureNoteDetailsPage.tsx (Extension / DOM)
 * 
 * Details view for a secure note with edit, delete, and copy functionality
 */

import React, { useState } from 'react';
import { HeaderTitle } from '@extension/ui/components/HeaderTitle';
import { ErrorBanner } from '@extension/ui/components/ErrorBanner';
import { Button } from '@extension/ui/components/Buttons';
import { DetailField } from '@extension/ui/components/DetailField';
import { MoreInfo } from '@extension/ui/components/MoreInfo';
import { ItemSecureNote } from '@extension/ui/components/ItemSecureNote';
import { useAppRouterContext } from '../router/AppRouterProvider';
import { ROUTES } from '../router/ROUTES';
import { useItemsCRUD } from '@common/hooks/useItemsCRUD';
import { useClipboard } from '@common/hooks/useClipboard';
import { colors, spacing, radius, typography } from '../design/tokens';
import type { SecureNoteDecrypted } from '@common/core/types/items.types';

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
      
      {showDeleteConfirm && (
        <div style={styles.confirmOverlay}>
          <div style={styles.confirmDialog}>
            <h3 style={styles.confirmTitle}>Confirmation</h3>
            <p style={styles.confirmMessage}>
              Êtes-vous sûr de vouloir supprimer cette note ?
            </p>
            <div style={styles.confirmButtons}>
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="secondary"
                fullWidth
                data-testid="delete-cancel-button"
              >
                Annuler
              </Button>
              <Button
                onClick={confirmDelete}
                variant="danger"
                fullWidth
                data-testid="delete-confirm-button"
              >
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div style={styles.pageContent}>
        {/* Header */}
        <HeaderTitle title="Détails de la note" onBackPress={onBack} />
        
        {/* Note Preview */}
        <div style={styles.notePreview}>
          <ItemSecureNote 
            note={note} 
            onPress={() => {}} 
          />
        </div>

        {/* Detail Fields */}
        <div style={styles.detailsContainer}>
          <DetailField
            label="Titre"
            value={note.title}
            showCopyButton
            onCopy={handleCopyTitle}
            copyText="Copier"
          />
          
          <DetailField
            label="Contenu"
            value={note.note}
            showCopyButton
            onCopy={handleCopyContent}
            copyText="Copier"
          />
        </div>

        {/* More Info */}
        <MoreInfo
          lastUseDateTime={note.lastUseDateTime}
          createdDateTime={note.createdDateTime}
        />

        {/* Action Buttons */}
        <div style={styles.actions}>
          <Button
            onClick={handleEdit}
            variant="primary"
            fullWidth
            data-testid="edit-note-button"
          >
            Modifier
          </Button>
          <Button
            onClick={handleDelete}
            variant="danger"
            fullWidth
            data-testid="delete-note-button"
          >
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.primaryBackground,
    padding: spacing.lg,
    height: '100%',
    overflow: 'auto',
  },
  pageContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    flex: 1,
  },
  notePreview: {
    display: 'flex',
    justifyContent: 'center',
    padding: spacing.md,
  },
  detailsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  confirmOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  confirmDialog: {
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.lg,
    padding: spacing.xl,
    maxWidth: 300,
    width: '90%',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  },
  confirmTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.base,
    color: colors.primary,
    margin: 0,
    marginBottom: spacing.md,
  },
  confirmMessage: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.base,
    color: colors.tertiaryText,
    margin: 0,
    marginBottom: spacing.lg,
    lineHeight: '1.4',
  },
  confirmButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
};

export default SecureNoteDetailsPage;
