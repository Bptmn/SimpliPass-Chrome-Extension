/**
 * LockPage.tsx
 * 
 * Unified page for handling password re-entry when the secret key is lost from secure storage.
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
import { useAuth } from '@common/hooks/useAuth';
import { useListeners } from '@common/hooks/useListeners';

type LockReason = 'expired' | 'fingerprint_mismatch' | 'decryption_failed' | 'not_found' | 'corrupted';

interface LockPageProps {
  onSecretKeyStored?: () => void;
  reason?: LockReason;
}

export const LockPage: React.FC<LockPageProps> = ({ onSecretKeyStored, reason }) => {
  const [password, setPassword] = useState('');
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const { reEnterPassword, isLoading } = useReEnterPassword();
  const { logout } = useAuth();
  const { recheckUserInitialization } = useListeners();

  const getReasonMessage = () => {
    switch (reason) {
      case 'expired':
        return 'Votre session a expiré. Veuillez entrer votre mot de passe maître pour continuer.';
      case 'fingerprint_mismatch':
        return 'Votre appareil a changé. Veuillez entrer votre mot de passe maître pour continuer.';
      case 'decryption_failed':
        return 'Impossible de déverrouiller votre coffre-fort. Veuillez entrer votre mot de passe maître.';
      case 'corrupted':
        return 'Les données de session sont corrompues. Veuillez entrer votre mot de passe maître.';
      default:
        return 'Veuillez entrer votre mot de passe maître pour accéder à vos données.';
    }
  };

  const handleSubmit = async () => {
    if (!password.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre mot de passe maître.');
      return;
    }

    try {
      // Re-enter password to derive and store secret key
      await reEnterPassword(password);
      
      console.log('[LockPage] Password re-entry successful, rechecking user initialization...');
      
      // Re-check user initialization status to trigger navigation
      await recheckUserInitialization();
      
      // Call the callback to trigger PopupApp re-check (if provided)
      if (onSecretKeyStored) {
        console.log('[LockPage] Calling onSecretKeyStored callback...');
        onSecretKeyStored();
      }
      
      console.log('[LockPage] Lock page flow completed successfully');
    } catch (error) {
      // Error is handled by the hook and displayed via the error state
      console.error('[LockPage] Error during password re-entry:', error);
    }
  };

  const handleCancel = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('[LockPage] Error during logout:', error);
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
          {getReasonMessage()}
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