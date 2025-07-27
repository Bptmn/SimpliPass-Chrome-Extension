/**
 * ReEnterPasswordPage.tsx
 * 
 * This page allows users to re-enter their master password to derive the secret key
 * without logging out. This is used when the secret key is lost from secure storage but
 * the user is still authenticated.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Input } from '@ui/components/InputFields';
import { Button } from '@ui/components/Buttons';
import { getColors } from '@ui/design/colors';
import { spacing } from '@ui/design/layout';
import { typography } from '@ui/design/typography';
import { useThemeMode } from '@common/ui/design/theme';
import { useReEnterPassword } from '@common/hooks/useReEnterPassword';
import { useLogoutFlow } from '@common/hooks/useLogoutFlow';

interface ReEnterPasswordPageProps {
  onSecretKeyStored?: () => void;
}

export const ReEnterPasswordPage: React.FC<ReEnterPasswordPageProps> = ({ onSecretKeyStored }) => {
  const [password, setPassword] = useState('');
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const { reEnterPassword, isLoading, error, clearError } = useReEnterPassword();
  const { logout } = useLogoutFlow();

  const handleSubmit = async () => {
    if (!password.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre mot de passe maître.');
      return;
    }

    try {
      await reEnterPassword(password);
      // Call the callback to trigger PopupApp re-check
      if (onSecretKeyStored) {
        console.log('[ReEnterPasswordPage] Calling onSecretKeyStored callback...');
        onSecretKeyStored();
      }
    } catch (error) {
      // Error is handled by the hook and displayed via the error state
      console.error('[ReEnterPasswordPage] Error during password re-entry:', error);
    }
  };

  const handleCancel = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('[ReEnterPasswordPage] Error during logout:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.primaryBackground,
      padding: spacing.lg,
    },
    header: {
      marginBottom: spacing.xl,
    },
    title: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: themeColors.primary,
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.regular,
      color: themeColors.tertiary,
      lineHeight: 20,
    },
    form: {
      flex: 1,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.xl,
    },
    cancelButton: {
      flex: 1,
    },
    submitButton: {
      flex: 1,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Déverrouiller le coffre-fort</Text>
        <Text style={styles.subtitle}>
          Veuillez entrer votre mot de passe maître pour accéder à vos données.
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Mot de passe maître"
          _id="master-password"
          value={password}
          onChange={setPassword}
          type="password"
          placeholder="Entrez votre mot de passe maître"
          _required
        />

        <View style={styles.buttonContainer}>
          <Button
            text="Annuler"
            color={themeColors.tertiary}
            onPress={handleCancel}
            style={styles.cancelButton}
            disabled={isLoading}
          />
          <Button
            text={isLoading ? "Déverrouillage..." : "Déverrouiller"}
            color={themeColors.secondary}
            onPress={handleSubmit}
            disabled={isLoading}
            style={styles.submitButton}
          />
        </View>
      </View>
    </View>
  );
}; 