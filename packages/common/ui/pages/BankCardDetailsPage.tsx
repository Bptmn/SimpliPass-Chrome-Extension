// BankCardDetailsPage.tsx
// This component renders the details view for a bank card.
// Responsibilities:
// - Display card details in a readable format
// - Use useClipboard hook for copy operations
// - Handle edit and delete actions
// - Display confirmation dialogs

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { BankCardDecrypted } from '@common/core/types/items.types';
import { ExpirationDate, formatExpirationDate } from '@common/utils';
import { ErrorBanner } from '@ui/components/ErrorBanner';
import { Icon } from '@ui/components/Icon';
import { LazyCredentialIcon } from '@ui/components/LazyCredentialIcon';
import { useToast } from '@common/ui/components/Toast';
import { useThemeMode } from '@common/ui/design/theme';
import { getColors } from '@ui/design/colors';
import { getPageStyles, spacing, radius } from '@ui/design/layout';
import { typography } from '@ui/design/typography';
import { Button } from '@ui/components/Buttons';
import { DetailField } from '@ui/components/DetailField';
import { MoreInfo } from '@ui/components/MoreInfo';
import { useClipboard } from '@common/hooks/useClipboard';
import { useBankCardDetails } from '@common/hooks/useBankCardDetails';

interface BankCardDetailsPageProps {
  card: BankCardDecrypted;
  onBack: () => void;
}

export const BankCardDetailsPage: React.FC<BankCardDetailsPageProps> = ({
  card,
  onBack,
}) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const pageStyles = React.useMemo(() => getPageStyles(mode), [mode]);
  const styles = React.useMemo(() => getStyles(mode), [mode]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { showToast } = useToast();
  const { copyToClipboard } = useClipboard();

  const { handleEdit, confirmDelete, handleCopyOwner, handleCopyCardNumber, handleCopyCVV, handleCopyNote, displayCardNumber } = useBankCardDetails(
    card,
    onBack,
    setError,
    setLoading,
    showToast,
    copyToClipboard
  );

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    await confirmDelete();
  };

  const formatDate = (expDate: ExpirationDate) => {
    if (!expDate) return '';
    return formatExpirationDate(expDate);
  };

  return (
    <View style={pageStyles.pageContainer}>
      {error && <ErrorBanner message={error} />}
      {showDeleteConfirm && (
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmDialog}>
            <Text style={styles.confirmTitle}>Confirmation</Text>
            <Text style={styles.confirmMessage}>Êtes-vous sûr de vouloir supprimer cette carte ?</Text>
            <View style={styles.confirmButtons}>
              <Button
                text="Annuler"
                color={themeColors.secondary}
                width="full"
                height="full"
                onPress={() => setShowDeleteConfirm(false)}
                style={{ flex: 1 }}
              />
              <Button
                text="Supprimer"
                color={themeColors.error}
                width="full"
                height="full"
                onPress={handleConfirmDelete}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      )}
      <View style={pageStyles.pageContent}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable style={styles.backBtn} onPress={onBack} accessibilityLabel="Retour">
            <View style={{ transform: [{ scaleX: -1 }] }}>
              <Icon name="arrowRight" size={28} color={themeColors.primary} />
            </View>
          </Pressable>
          <View style={styles.headerContent}>
            <View style={styles.iconCenter}>
              <LazyCredentialIcon title={card.title} url={card.bankDomain} />
            </View>
            <Text style={styles.title}>{card.title}</Text>
          </View>
        </View>
        {/* Form fields */}
        <View style={styles.detailsFieldsContainer}>
        {/* Owner */}
        <DetailField
          label="Titulaire :"
          value={card.owner}
          showCopyButton={!!card.owner}
          onCopy={handleCopyOwner}
          ariaLabel="Copier le titulaire"
        />
        {/* Card Number */}
        <DetailField
          label="Numéro de carte :"
          value={displayCardNumber}
          showCopyButton={!!card.cardNumber}
          onCopy={handleCopyCardNumber}
          ariaLabel="Copier le numéro de carte"
        />
        {/* CVV */}
        <DetailField
          label="CVV :"
          value={card.verificationNumber}
          showCopyButton={!!card.verificationNumber}
          onCopy={handleCopyCVV}
          ariaLabel="Copier le CVV"
        />
        {/* Expiration Date */}
        <DetailField
          label="Date d'expiration :"
          value={formatDate(card.expirationDate)}
        />
        {/* Note */}
        <DetailField
          label="Note :"
          value={card.note}
          showCopyButton={!!card.note}
          onCopy={handleCopyNote}
          ariaLabel="Copier la note"
        />
        </View>
        {/* Actions */}
        <View style={styles.actionsRow}>
          <Button
            text="Modifier"
            color={themeColors.tertiary}
            width="full"
            height="full"
            onPress={handleEdit}
            disabled={loading}
            style={{ flex: 1, maxWidth: 135 }}
          />
          <Button
            text="Supprimer"
            color={themeColors.error}
            width="full"
            height="full"
            onPress={handleDelete}
            disabled={loading}
            style={{ flex: 1, maxWidth: 135 }}
          />
        </View>
        {/* Expandable meta info */}
        <MoreInfo
          lastUseDateTime={card.lastUseDateTime}
          createdDateTime={card.createdDateTime}
        />
      </View>
    </View>
  );
};

// Create styles for this component
const getStyles = (mode: 'light' | 'dark') => {
  const themeColors = getColors(mode);
  
  return StyleSheet.create({
    detailsFieldsContainer: {
      flex: 1,
      gap: spacing.sm,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: spacing.md,
      justifyContent: 'space-around',
      width: '100%',
    },
    backBtn: {
      alignItems: 'center',
      height: 44,
      justifyContent: 'center',
      left: 0,
      minWidth: 44,
      padding: spacing.sm,
      position: 'absolute',
      top: 0,
      zIndex: 1,
    },
    confirmButtons: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    confirmDialog: {
      backgroundColor: themeColors.secondaryBackground,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: themeColors.borderColor,
      padding: spacing.lg,
      width: '80%',
      maxWidth: 400,
    },
    confirmMessage: {
      color: themeColors.primary,
      fontSize: typography.fontSize.md,
      marginTop: spacing.sm,
      textAlign: 'center',
    },
    confirmOverlay: {
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      bottom: 0,
      justifyContent: 'center',
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
      zIndex: 1000,
    },
    confirmTitle: {
      color: themeColors.primary,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      textAlign: 'center',
    },
    headerContent: {
      alignItems: 'center',
      flex: 1,
      gap: spacing.sm,
    },
    headerRow: {
      alignItems: 'center',
      flexDirection: 'row',
      position: 'relative',
      width: '100%',
    },
    iconCenter: {
      alignItems: 'center',
    },
    pageContent: {
      flex: 1,
      gap: spacing.md,
    },
    title: {
      color: themeColors.primary,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      textAlign: 'center',
    },
  });
};

export default BankCardDetailsPage; 