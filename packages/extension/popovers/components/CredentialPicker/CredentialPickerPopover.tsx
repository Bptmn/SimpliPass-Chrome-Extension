/**
 * Credential Picker Popover Component (React Native Web)
 * Displays matching credentials for autofill using common components
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeProvider, useThemeMode } from '@common/ui/design/theme';
import { getColors } from '@common/ui/design/colors';
import { spacing, radius } from '@common/ui/design/layout';
import { typography } from '@common/ui/design/typography';
import { CredentialCard } from '@common/ui/components/CredentialCard';
import { Button } from '@common/ui/components/Buttons';
import { ToastProvider } from '@common/ui/components/Toast';

interface Credential {
  id: string;
  title: string;
  username: string;
  url?: string;
}

interface CredentialPickerPopoverProps {
  credentials: Credential[];
  onSelectCredential: (credential: Credential) => void;
  onCancel: () => void;
}

const CredentialPickerInner: React.FC<CredentialPickerPopoverProps> = ({
  credentials,
  onSelectCredential,
  onCancel,
}) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);

  // Convert credentials to CredentialDecrypted format for CredentialCard
  const credentialCards = credentials.map(cred => ({
    id: cred.id,
    title: cred.title,
    username: cred.username,
    password: '••••••••', // Placeholder for security
    url: cred.url || '',
    type: 'credential' as const,
    itemType: 'credential' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdDateTime: new Date(),
    lastUseDateTime: new Date(),
    note: '',
    itemKey: cred.id,
  }));

  const styles = StyleSheet.create({
    container: {
      backgroundColor: themeColors.primaryBackground,
      borderColor: themeColors.borderColor,
      borderRadius: radius.md,
      borderWidth: 1,
      padding: spacing.md,
      width: 320,
      maxHeight: 400,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    title: {
      color: themeColors.primary,
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    subtitle: {
      color: themeColors.tertiaryText,
      fontSize: typography.fontSize.sm,
      marginBottom: spacing.sm,
    },
    list: {
      marginBottom: spacing.md,
      flexDirection: 'column',
      width: '100%',
      gap: spacing.sm,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    emptyText: {
      color: themeColors.tertiaryText,
      fontSize: typography.fontSize.sm,
      textAlign: 'center',
    },
    footer: {
      alignItems: 'center',
    },
    cancelButton: {
      minWidth: 96,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SimpliPass</Text>
      <Text style={styles.subtitle}>Select a credential to autofill:</Text>

      {credentials.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No matching credentials found</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {credentialCards.map((credential) => (
            <CredentialCard
              key={credential.id}
              credential={credential}
              onPress={() => {
                const originalCredential = credentials.find(c => c.id === credential.id);
                if (originalCredential) {
                  onSelectCredential(originalCredential);
                }
              }}
              hideCopyBtn={true}
              disableFavicon={true}
              testID={`credential-${credential.id}`}
            />
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Button
          text="Cancel"
          color={themeColors.secondary}
          onPress={onCancel}
          style={styles.cancelButton}
          testID="cancel-credential-picker"
        />
      </View>
    </View>
  );
};

export const CredentialPickerPopover: React.FC<CredentialPickerPopoverProps> = (props) => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <CredentialPickerInner {...props} />
      </ToastProvider>
    </ThemeProvider>
  );
};
