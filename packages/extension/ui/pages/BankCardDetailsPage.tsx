/**
 * BankCardDetailsPage.tsx (Extension / DOM)
 * 
 * Details view for a bank card with edit, delete, and copy functionality
 */

import React, { useState } from 'react';
import { HeaderBar } from '@extension/ui/components/HeaderBar';
import { ErrorBanner } from '@extension/ui/components/ErrorBanner';
import { Button } from '@extension/ui/components/Buttons';
import { DetailField } from '@extension/ui/components/DetailField';
import { MoreInfo } from '@extension/ui/components/MoreInfo';
import { ItemBankCard } from '@extension/ui/components/ItemBankCard';
import { LazyCredentialIcon } from '@extension/ui/components/LazyCredentialIcon';
import { ConfirmDialog } from '@extension/ui/components/ConfirmDialog';
import { useClipboard } from '@common/hooks/useClipboard';
import { useBankCardDetails } from '@common/hooks/useBankCardDetails';
import { formatExpirationDateFromExp } from '@common/utils';
import { colors, spacing, radius, typography, pageStyles, commonStyles } from '../design';
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
      
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Confirmation"
        message="Êtes-vous sûr de vouloir supprimer cette carte ?"
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        testId="delete-confirm-dialog"
      />
      
      {/* Header - Fixed, non-scrollable */}
      <HeaderBar title={card.title} onBackPress={onBack} />
      
      <div style={styles.pageContent}>

        {/* Form fields */}
        <div style={styles.detailsFieldsContainer}>
          {/* Owner */}
          <DetailField
            label="Titulaire :"
            value={card.cardholderName || card.owner}
            showCopyButton={!!(card.cardholderName || card.owner)}
            onCopy={handleCopyOwner}
          />
          {/* Card Number */}
          <DetailField
            label="Numéro de carte :"
            value={displayCardNumber}
            showCopyButton={!!card.cardNumber}
            onCopy={handleCopyCardNumber}
          />
          {/* CVV */}
          <DetailField
            label="CVV :"
            value={card.verificationNumber || card.cvv || '***'}
            showCopyButton={!!(card.verificationNumber || card.cvv)}
            onCopy={handleCopyCVV}
          />
          {/* Expiration Date */}
          <DetailField
            label="Date d'expiration :"
            value={formatDate(card.expirationDate)}
          />
          {/* Note */}
          {card.note && (
            <DetailField
              label="Note :"
              value={card.note}
              showCopyButton
              onCopy={handleCopyNote}
            />
          )}
        </div>

        {/* More Info */}
        <MoreInfo
          lastUseDateTime={card.lastUseDateTime}
          createdDateTime={card.createdDateTime}
        />

        {/* Actions */}
        <div style={styles.actionsRow}>
          <Button
            onClick={handleEdit}
            variant="secondary"
            disabled={loading}
            data-testid="edit-card-button"
            style={{ flex: 1, maxWidth: 135 }}
          >
            Modifier
          </Button>
          <Button
            onClick={handleDelete}
            variant="danger"
            disabled={loading}
            data-testid="delete-card-button"
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
  detailsFieldsContainer: {
    ...pageStyles.pageElement, // Applique width: 100%, marginLeft: 0, marginRight: 0
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md, // 12px entre les DetailField
    overflow: 'hidden',
  },
};

export default BankCardDetailsPage;
