// CredentialCard.tsx
// This component displays a single credential (title, username, icon) and provides a copy-to-clipboard button for the password.
// Used in both the popup and popover for credential display and interaction.

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CredentialFromVaultDb } from '@shared/types';
import { decryptData } from '@utils/crypto';
import { getUserSecretKey } from '@logic/user';
import CopyButton from './CopyButton';
import { colors } from '@design/colors';
import { layout, padding, radius, spacing } from '@design/layout';

// Minimal RN-compatible LazyCredentialIcon
const LazyCredentialIcon: React.FC<{ title: string; url?: string }> = ({ title }) => (
  <View style={styles.iconContainer}>
    <Text style={styles.iconLetter}>{title ? title[0].toUpperCase() : '?'}</Text>
  </View>
);

// Minimal RN-compatible ErrorBanner
const ErrorBanner: React.FC<{ message: string }> = ({ message }) => (
  <View style={styles.errorBanner} accessibilityRole="alert" accessibilityLiveRegion="assertive">
    <Text style={styles.errorTitle}>Erreur</Text>
    <Text style={styles.errorText}>{message}</Text>
  </View>
);

interface CredentialCardProps {
  cred: CredentialFromVaultDb;
  onClick?: () => void;
  hideCopyBtn?: boolean;
  onCopy?: () => void;
}

const CredentialCardComponent: React.FC<CredentialCardProps> = ({
  cred,
  onClick,
  hideCopyBtn,
  onCopy,
}) => {
  const [error, setError] = React.useState<string | null>(null);

  // Handles copying the password to clipboard
  const handleCopy = async () => {
    try {
      const userSecretKey = await getUserSecretKey();
      if (!userSecretKey) throw new Error('User secret key not found');
      const itemKey = await decryptData(userSecretKey, cred.itemKeyCipher);
      const password = await decryptData(itemKey, cred.passwordCipher);
      await navigator.clipboard.writeText(password);
      if (onCopy) onCopy();
    } catch {
      setError('Erreur lors de la copie du mot de passe.');
    }
  };

  return (
    <>
      {error && <ErrorBanner message={error} />}
      <Pressable
        style={styles.card}
        onPress={onClick}
        accessibilityLabel={`Credential for ${cred.title} (${cred.username})`}
        accessibilityRole="button"
      >
        <View style={styles.cardLeft}>
          <LazyCredentialIcon title={cred.title || ''} url={cred.url} />
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{cred.title || 'Title'}</Text>
            <Text style={styles.cardUsername}>{cred.username || ''}</Text>
          </View>
        </View>
        {!hideCopyBtn && (
          <CopyButton textToCopy={''} onClick={handleCopy} />
        )}
      </Pressable>
    </>
  );
};

const CredentialCard = React.memo(CredentialCardComponent);
CredentialCard.displayName = 'CredentialCard';

export { CredentialCard };

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.bgAlt,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'solid',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    width: '100%',
  },
  cardInfo: {
    flexDirection: 'column',
    gap: 2,
    maxWidth: 200,
    minWidth: 0,
  },
  cardLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  cardTitle: {
    color: colors.primary,
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  cardUsername: {
    color: colors.textSecondary,
    flexShrink: 1,
    fontSize: 12,
  },
  errorBanner: {
    backgroundColor: colors.bg,
    borderColor: colors.error,
    borderRadius: radius.md,
    borderWidth: 1,
    margin: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  errorTitle: {
    color: colors.error,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    height: 35,
    justifyContent: 'center',
    width: 35,
  },
  iconLetter: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 35,
    textAlign: 'center',
    width: '100%',
  },
});
