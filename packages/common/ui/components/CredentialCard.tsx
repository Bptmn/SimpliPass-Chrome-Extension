// CredentialCard.tsx
// This component displays a single credential (title, username, icon) and provides a copy-to-clipboard button for the password.
// Used in both the popup and popover for credential display and interaction.

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CredentialDecrypted } from '@common/core/types/types';
import { getColors } from '@ui/design/colors';
import { radius, spacing } from '@ui/design/layout';
import { LazyCredentialIcon } from './LazyCredentialIcon';
import CopyButton from './CopyButton';
import { typography } from '@ui/design/typography';
import { useThemeMode } from '@common/core/logic/theme';

// Minimal RN-compatible ErrorBanner
const ErrorBanner: React.FC<{ message: string; styles: Record<string, object> }> = ({ message, styles }) => (
  <View style={styles.errorBanner}>
    <Text style={styles.errorTitle}>Erreur</Text>
    <Text style={styles.errorText}>{message}</Text>
  </View>
);

interface CredentialCardProps {
  credential: CredentialDecrypted;
  onPress: () => void;
  testID?: string;
  hideCopyBtn?: boolean;
  onCopy?: () => void;
}

export const CredentialCard: React.FC<CredentialCardProps> = ({
  credential,
  onPress,
  testID,
  hideCopyBtn,
  onCopy,
}) => {
  const [error, setError] = React.useState<string | null>(null);
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);

  // Create styles based on current theme
  const styles = React.useMemo(() => {
    const colors = getColors(mode);
    
    return StyleSheet.create({
      credentialCard: {
        alignItems: 'center',
        backgroundColor: colors.secondaryBackground,
        borderColor: colors.borderColor,
        borderRadius: radius.md,
        borderStyle: 'solid',
        borderWidth: 1,
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
      credentialCardInfo: {
        flexDirection: 'column',
        gap: 2,
        maxWidth: 200,
        minWidth: 0,
      },
      credentialCardLeft: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 12,
      },
      credentialCardTitle: {
        color: colors.primary,
        flexShrink: 1,
        fontSize: 15,
        fontWeight: '600',
      },
      credentialCardUsername: {
        color: colors.tertiaryText,
        flexShrink: 1,
        fontSize: 12,
      },
      errorBanner: {
        backgroundColor: themeColors.primaryBackground,
        borderColor: themeColors.error,
        borderRadius: radius.md,
        borderWidth: 1,
        margin: spacing.lg,
        padding: spacing.lg,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      errorText: {
        color: themeColors.secondary,
        fontSize: typography.fontSize.sm,
      },
      errorTitle: {
        color: themeColors.error,
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.medium,
        marginBottom: spacing.md,
      },
    });
  }, [mode, themeColors]);

  // Handles copying the password to clipboard
  const handleCopy = async () => {
    try {
      // Password is already decrypted in the new architecture
      await navigator.clipboard.writeText(credential.password);
      if (onCopy) onCopy();
    } catch {
      setError('Impossible de copier le mot de passe');
    }
  };

  return (
    <>
      {error && <ErrorBanner message={error} styles={styles} />}
      <Pressable
        style={styles.credentialCard}
        onPress={onPress}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`Credential ${credential.title}`}
      >
        <View style={styles.credentialCardLeft}>
          <LazyCredentialIcon title={credential.title} url={credential.url} />
          <View style={styles.credentialCardInfo}>
            <Text style={styles.credentialCardTitle} numberOfLines={1}>
              {credential.title}
            </Text>
            <Text style={styles.credentialCardUsername} numberOfLines={1}>
              {credential.username}
            </Text>
          </View>
        </View>
        {!hideCopyBtn && (
          <CopyButton textToCopy={credential.password} onClick={handleCopy} />
        )}
      </Pressable>
    </>
  );
};
