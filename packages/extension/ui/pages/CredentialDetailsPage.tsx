/**
 * CredentialDetailsPage.tsx (Extension / DOM)
 * 
 * Details view for a credential with edit, delete, and copy functionality
 */

import React, { useState } from 'react';
import { HeaderBar } from '@extension/ui/components/HeaderBar';
import { ErrorBanner } from '@extension/ui/components/ErrorBanner';
import { Button } from '@extension/ui/components/Buttons';
import { DetailField } from '@extension/ui/components/DetailField';
import { MoreInfo } from '@extension/ui/components/MoreInfo';
import { LazyCredentialIcon } from '@extension/ui/components/LazyCredentialIcon';
import { CopyButton } from '@extension/ui/components/CopyButton';
import { ConfirmDialog } from '@extension/ui/components/ConfirmDialog';
import { useClipboard } from '@common/hooks/useClipboard';
import { usePasswordVisibility } from '@common/hooks/usePasswordVisibility';
import { useAppRouterContext } from '../router/AppRouterProvider';
import { ROUTES } from '../router/ROUTES';
import { colors, spacing, radius, typography, pageStyles, commonStyles } from '../design';
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
  
  const router = useAppRouterContext();
  const { copyToClipboard } = useClipboard();
  const { isPasswordVisible, togglePasswordVisibility } = usePasswordVisibility();
  
  // Navigate to modify credential page
  const handleEdit = () => {
    router.navigateTo(ROUTES.MODIFY_CREDENTIAL, { credential });
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
      
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Confirmation"
        message="Êtes-vous sûr de vouloir supprimer cet identifiant ?"
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        testId="delete-confirm-dialog"
      />
      
      {/* Header - Fixed, non-scrollable */}
      <HeaderBar title={credential.title} onBackPress={onBack} />
      
      <div style={styles.pageContent}>

        {/* Grouped card: username & password */}
        <div style={styles.cardGroup}>
          {/* Username */}
          <div style={styles.credentialFieldRow}>
            <div style={styles.fieldLeft}>
              <span style={styles.fieldLabel}>Email / Nom d'utilisateur :</span>
              <span style={styles.fieldValue}>{credential.username}</span>
            </div>
            {credential.username && (
              <CopyButton
                textToCopy={credential.username}
              />
            )}
          </div>
          <div style={styles.divider} />
          {/* Password */}
          <div style={styles.credentialFieldRow}>
            <div style={styles.fieldLeft}>
              <span style={styles.fieldLabel}>Mot de passe :</span>
              <div style={styles.passwordRow}>
                <span style={styles.fieldValue}>{isPasswordVisible ? credential.password : '••••••••'}</span>
                <button
                  style={styles.eyeBtn}
                  onClick={togglePasswordVisibility}
                  aria-label={isPasswordVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    {isPasswordVisible ? (
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" stroke={colors.tertiary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={colors.tertiary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke={colors.tertiary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>
            {credential.password && (
              <CopyButton
                textToCopy={credential.password}
              />
            )}
          </div>
        </div>

        {/* Link card */}
        <DetailField
          label="Lien :"
          value={credential.url}
          showLaunchButton
          onLaunch={handleLaunch}
        />

        {/* Note card */}
        {credential.note && (
          <DetailField
            label="Note :"
            value={credential.note}
            showCopyButton
            onCopy={handleCopyNote}
            ariaLabel="Copier la note"
          />
        )}

        {/* More Info */}
        <MoreInfo
          lastUseDateTime={credential.lastUseDateTime}
          createdDateTime={credential.createdDateTime}
        />

        {/* Actions */}
        <div style={styles.actionsRow}>
          <Button
            onClick={handleEdit}
            variant="tertiary"
            disabled={loading}
            data-testid="edit-credential-button"
            style={{ flex: 1, maxWidth: 135 }}
          >
            Modifier
          </Button>
          <Button
            onClick={handleDelete}
            variant="danger"
            disabled={loading}
            data-testid="delete-credential-button"
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
    overflow: 'hidden', // Let pageContent handle scrolling
    // Force strict containment
    maxWidth: '100%',
    height: '100vh', // Use full viewport height
    display: 'flex',
    flexDirection: 'column',
  },
  pageContent: {
    ...pageStyles.pageContentWithGap,
    minHeight: 0, // Allow content to shrink
    flex: 1, // Take available space
  },
  cardGroup: {
    ...pageStyles.pageElement, // Applique width: 100%, marginLeft: 0, marginRight: 0
    backgroundColor: colors.secondaryBackground,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: radius.md,
    padding: spacing.sm,
    overflow: 'hidden',
    flexShrink: 0, // Don't shrink the card group
    minHeight: 'fit-content', // Ensure it takes the space it needs
  },
  credentialFieldRow: {
    ...pageStyles.pageElement, // Applique width: 100%, marginLeft: 0, marginRight: 0
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 0, // Allow flex items to shrink
    flexShrink: 0, // Don't shrink the rows
    minHeight: 'fit-content', // Ensure they take the space they need
  },
  fieldLeft: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0, // Allow text to wrap/truncate
    overflow: 'hidden',
    flexShrink: 1, // Allow this to shrink if needed
  },
  fieldLabel: {
    color: colors.tertiaryText,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular,
    fontFamily: typography.fontFamily.base,
    marginBottom: spacing.xxs,
  },
  fieldValue: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    fontFamily: typography.fontFamily.base,
    wordBreak: 'break-all' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    flexShrink: 1, // Allow this to shrink if needed
  },
  passwordRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 1, // Allow this to shrink if needed
    minWidth: 0, // Allow flex items to shrink
  },
  eyeBtn: {
    appearance: 'none',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0, // Don't shrink the eye button
  },
  divider: {
    borderBottom: `1px solid ${colors.borderColor}`,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    width: '100%',
    flexShrink: 0, // Don't shrink the divider
  },
};

export default CredentialDetailsPage;
