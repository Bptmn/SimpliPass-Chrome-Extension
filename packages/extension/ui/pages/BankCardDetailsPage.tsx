/**
 * BankCardDetailsPage.tsx (Extension / DOM)
 * 
 * Details view for a bank card with edit, delete, and copy functionality
 */

import React, { useState } from 'react';
import { HeaderTitle } from '@extension/ui/components/HeaderTitle';
import { ErrorBanner } from '@extension/ui/components/ErrorBanner';
import { Button } from '@extension/ui/components/Buttons';
import { DetailField } from '@extension/ui/components/DetailField';
import { MoreInfo } from '@extension/ui/components/MoreInfo';
import { ItemBankCard } from '@extension/ui/components/ItemBankCard';
import { useClipboard } from '@common/hooks/useClipboard';
import { useBankCardDetails } from '@common/hooks/useBankCardDetails';
import { formatExpirationDateFromExp } from '@common/utils';
import { colors, spacing, radius, typography } from '../design/tokens';
import type { BankCardDecrypted } from '@common/core/types/items.types';

interface BankCardDetailsPageProps {
  card: BankCardDecrypted;
  onBack: () => void;
}

export const BankCardDetailsPage: React.FC<BankCardDetailsPageProps> = ({
  card,
  onBack,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { copyToClipboard } = useClipboard();

  const { 
    handleEdit, 
    confirmDelete, 
    handleCopyOwner, 
    handleCopyCardNumber, 
    handleCopyCVV, 
    handleCopyNote, 
    displayCardNumber 
  } = useBankCardDetails(
    card,
    onBack,
    setError,
    setLoading,
    copyToClipboard
  );

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    await confirmDelete();
  };

  const formatDate = (expDate: string) => {
    if (!expDate) return '';
    return formatExpirationDateFromExp(expDate);
  };

  return (
    <div style={styles.pageContainer} data-testid="bank-card-details-page">
      {error && <ErrorBanner message={error} />}
      
      {showDeleteConfirm && (
        <div style={styles.confirmOverlay}>
          <div style={styles.confirmDialog}>
            <h3 style={styles.confirmTitle}>Confirmation</h3>
            <p style={styles.confirmMessage}>
              Êtes-vous sûr de vouloir supprimer cette carte ?
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
        <HeaderTitle title="Détails de la carte" onBackPress={onBack} />
        
        {/* Card Preview */}
        <div style={styles.cardPreview}>
          <ItemBankCard 
            cred={card} 
            onPress={() => {}} 
          />
        </div>

        {/* Detail Fields */}
        <div style={styles.detailsContainer}>
          <DetailField
            label="Titulaire"
            value={card.cardholderName}
            showCopyButton
            onCopy={handleCopyOwner}
            copyText="Copier"
          />
          
          <DetailField
            label="Numéro de carte"
            value={displayCardNumber}
            showCopyButton
            onCopy={handleCopyCardNumber}
            copyText="Copier"
          />
          
          <DetailField
            label="Date d'expiration"
            value={formatDate(card.expirationDate)}
            showCopyButton={false}
          />
          
          <DetailField
            label="CVV"
            value="***"
            showCopyButton
            onCopy={handleCopyCVV}
            copyText="Copier"
          />
          
          {card.note && (
            <DetailField
              label="Note"
              value={card.note}
              showCopyButton
              onCopy={handleCopyNote}
              copyText="Copier"
            />
          )}
        </div>

        {/* More Info */}
        <MoreInfo
          lastUseDateTime={card.lastUseDateTime}
          createdDateTime={card.createdDateTime}
        />

        {/* Action Buttons */}
        <div style={styles.actions}>
          <Button
            onClick={handleEdit}
            variant="primary"
            fullWidth
            data-testid="edit-card-button"
          >
            Modifier
          </Button>
          <Button
            onClick={handleDelete}
            variant="danger"
            fullWidth
            data-testid="delete-card-button"
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
  cardPreview: {
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

export default BankCardDetailsPage;
