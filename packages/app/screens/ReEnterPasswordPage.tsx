/**
 * ReEnterPasswordPage.tsx
 * 
 * This page allows users to re-enter their master password to derive the secret key
 * without logging out. This is used when the secret key is lost from memory but
 * the user is still authenticated.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useNavigate } from 'react-router-dom';
import { Input } from '@components/InputFields';
import { Button } from '@components/Buttons';
import { getColors } from '@design/colors';
import { spacing } from '@design/layout';
import { typography } from '@design/typography';
import { deriveKey } from '@app/utils/crypto';
import { storeUserSecretKey, getUserSalt } from '@app/core/logic/auth';
import { useUserStore } from '@app/core/states/user';
import { useThemeMode } from '@app/components';

export const ReEnterPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);

  const handleSubmit = async () => {
    if (!password.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre mot de passe maître.');
      return;
    }

    if (!user) {
      Alert.alert('Erreur', 'Utilisateur non trouvé.');
      return;
    }

    setIsLoading(true);

    try {
      // Get user salt
      const salt = await getUserSalt();
      if (!salt) {
        Alert.alert('Erreur', 'Impossible de récupérer le sel utilisateur.');
        return;
      }

      // Derive the secret key
      const userSecretKey = await deriveKey(password, salt);
      
      // Store the secret key in memory
      await storeUserSecretKey(userSecretKey);

      console.log('[ReEnterPasswordPage] Secret key derived and stored successfully');
      
      // Navigate back to home
      navigate('/home');
    } catch (error) {
      console.error('[ReEnterPasswordPage] Error deriving secret key:', error);
      Alert.alert('Erreur', 'Mot de passe incorrect ou erreur lors de la dérivation de la clé.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/home');
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