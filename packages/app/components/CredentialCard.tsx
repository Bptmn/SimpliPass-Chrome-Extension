// CredentialCard.tsx
// This component displays a single credential (title, username, icon) and provides a copy-to-clipboard button for the password.
// Used in both the popup and popover for credential display and interaction.

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { CredentialDecrypted } from '@app/core/types/types';
import { getColors } from '@design/colors';
import { radius } from '@design/layout';
import { cardStyles } from '@design/card';
import { LazyCredentialIcon } from './LazyCredentialIcon';
import CopyButton from './CopyButton';
import { spacing } from '@design/layout';
import { typography } from '@design/typography';
import { useThemeMode } from '@app/core/logic/theme';

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

  // Handles copying the password to clipboard
  const handleCopy = async () => {
    try {
      // Password is already decrypted in the new architecture
      const { writeToClipboard } = await import('@app/core/platform/clipboard');
      await writeToClipboard(credential.password);
      if (onCopy) onCopy();
    } catch {
      setError('Impossible de copier le mot de passe');
    }
  };

  // Create dynamic styles based on current theme
  const dynamicStyles = React.useMemo(() => ({
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
  }), [themeColors]);

  return (
    <>
      {error && <ErrorBanner message={error} styles={dynamicStyles} />}
      <Pressable
        style={[cardStyles.credentialCard, { backgroundColor: themeColors.secondaryBackground, borderColor: themeColors.borderColor }]}
        onPress={onPress}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`Credential ${credential.title}`}
      >
        <View style={cardStyles.credentialCardLeft}>
          <LazyCredentialIcon title={credential.title} url={credential.url} />
          <View style={cardStyles.credentialCardInfo}>
            <Text style={cardStyles.credentialCardTitle} numberOfLines={1}>
              {credential.title}
            </Text>
            <Text style={cardStyles.credentialCardUsername} numberOfLines={1}>
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
