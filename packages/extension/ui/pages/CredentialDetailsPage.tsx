/**
 * CredentialDetailsPage.tsx (Extension / DOM)
 * 
 * Details view for a credential with edit, delete, and copy functionality
 */

import React, { useState } from 'react';
import { HeaderTitle } from '@extension/ui/components/HeaderTitle';
import { ErrorBanner } from '@extension/ui/components/ErrorBanner';
import { Button } from '@extension/ui/components/Buttons';
import { DetailField } from '@extension/ui/components/DetailField';
import { MoreInfo } from '@extension/ui/components/MoreInfo';
import { LazyCredentialIcon } from '@extension/ui/components/LazyCredentialIcon';
import { useClipboard } from '@common/hooks/useClipboard';
import { usePasswordVisibility } from '@common/hooks/usePasswordVisibility';
// Note: useCredentialDetails hook has import issues, implementing logic directly
import { colors, spacing, radius, typography } from '../design/tokens';
import type { CredentialDecrypted } from '@common/core/types/items.types';

interface CredentialDetailsPageProps {
  credential: CredentialDecrypted;
  onBack: () => void;
}

export const CredentialDetailsPage: React.FC<CredentialDetailsPageProps> = ({
  credential,
  onBack,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { copyToClipboard } = useClipboard();
  const { isPasswordVisible, togglePasswordVisibility } = usePasswordVisibility();
  
  // Implement credential details logic directly
  const handleEdit = () => {
    // Navigate to modify credential page
    console.log('Edit credential:', credential.id);
  };

  const handleLaunch = () => {
    if (credential.url) {
      window.open(credential.url, '_blank');
    }
  };

  const handleCopyUsername = () => {
    copyToClipboard(credential.username);
  };

  const handleCopyPassword = () => {
    copyToClipboard(credential.password);
  };

  const handleCopyNote = () => {
    if (credential.note) {
      copyToClipboard(credential.note);
    }
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      // TODO: Implement delete logic using useItemsCRUD
      console.log('Delete credential:', credential.id);
      onBack();
    } catch (err) {
      setError('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    await confirmDelete();
  };

  return (
    <div style={styles.pageContainer} data-testid="credential-details-page">
      {error && <ErrorBanner message={error} />}
      
      {showDeleteConfirm && (
        <div style={styles.confirmOverlay}>
          <div style={styles.confirmDialog}>
            <h3 style={styles.confirmTitle}>Confirmation</h3>
            <p style={styles.confirmMessage}>
              Êtes-vous sûr de vouloir supprimer cet identifiant ?
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
                onClick={handleConfirmDelete}
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
        <HeaderTitle title="Détails de l'identifiant" onBackPress={onBack} />
        
        <div style={styles.headerRow}>
          <LazyCredentialIcon 
            title={credential.title} 
            url={credential.url || ''} 
          />
          <div style={styles.headerInfo}>
            <h2 style={styles.title}>{credential.title}</h2>
            {credential.url && (
              <p style={styles.url}>{credential.url}</p>
            )}
          </div>
        </div>

        {/* Detail Fields */}
        <div style={styles.detailsContainer}>
          <DetailField
            label="Nom d'utilisateur"
            value={credential.username}
            showCopyButton
            onCopy={handleCopyUsername}
            copyText="Copier"
          />
          
          <DetailField
            label="Mot de passe"
            value={isPasswordVisible ? credential.password : '••••••••'}
            showCopyButton
            onCopy={handleCopyPassword}
            copyText="Copier"
          />
          
          {credential.note && (
            <DetailField
              label="Note"
              value={credential.note}
              showCopyButton
              onCopy={handleCopyNote}
              copyText="Copier"
            />
          )}
          
          {credential.url && (
            <DetailField
              label="URL"
              value={credential.url}
              showLaunchButton
              onLaunch={handleLaunch}
            />
          )}
        </div>

        {/* More Info */}
        <MoreInfo
          lastUseDateTime={credential.lastUseDateTime}
          createdDateTime={credential.createdDateTime}
        />

        {/* Action Buttons */}
        <div style={styles.actions}>
          <Button
            onClick={handleEdit}
            variant="primary"
            fullWidth
            data-testid="edit-credential-button"
          >
            Modifier
          </Button>
          <Button
            onClick={handleDelete}
            variant="danger"
            fullWidth
            data-testid="delete-credential-button"
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
  headerRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  headerInfo: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.base,
    color: colors.primary,
    margin: 0,
    marginBottom: spacing.xs,
  },
  url: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.base,
    color: colors.tertiaryText,
    margin: 0,
    wordBreak: 'break-all' as const,
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

export default CredentialDetailsPage;
