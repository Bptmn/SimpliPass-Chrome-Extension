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
import { useAuth } from '@common/hooks/useAuth';
import { useReEnterPassword } from '@common/hooks/useReEnterPassword';
import { useThemeMode } from '@common/ui/design/theme';
import { getColors } from '@ui/design/colors';
import { spacing } from '@ui/design/layout';
import { typography } from '@ui/design/typography';
import type { User } from '@common/core/types/auth.types';

type LockReason = 'expired' | 'fingerprint_mismatch' | 'decryption_failed' | 'not_found' | 'corrupted';

interface LockPageProps {
  reason?: LockReason;
  user: User | null;
}

export const LockPage: React.FC<LockPageProps> = ({ reason, user }) => {
  const [password, setPassword] = useState('');
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const { logout } = useAuth({ user });

  
  
  const { reEnterPassword, isLoading } = useReEnterPassword();

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
      // The success callback will handle navigation
      await reEnterPassword(password);
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
          placeholder="Entrez votre mot de passe maître"
          type="password"
          _autoComplete="current-password"
          _required
          disabled={isLoading}
        />

        <View style={styles.buttonContainer}>
          <Button
            text="Annuler"
            color={themeColors.secondary}
            onPress={handleCancel}
            disabled={isLoading}
            style={styles.cancelButton}
          />
          <Button
            text={isLoading ? 'Déverrouillage...' : 'Déverrouiller'}
            color={themeColors.primary}
            onPress={handleSubmit}
            disabled={isLoading}
            style={styles.submitButton}
          />
        </View>
      </View>
    </View>
  );
}; 