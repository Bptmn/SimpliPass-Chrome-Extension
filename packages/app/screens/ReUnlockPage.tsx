/**
 * ReUnlockPage.tsx
 * 
 * Fallback unlock page that appears when persistent key restoration fails
 * This page allows users to re-enter their master password to restore access
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@components/InputFields';
import { Button } from '@components/Buttons';
import { HeaderTitle } from '@components/HeaderTitle';
import { getPageStyles } from '@design/layout';
import { useThemeMode } from '@app/core/logic/theme';
import { getColors } from '@design/colors';
import { spacing, radius } from '@design/layout';
import { typography } from '@design/typography';
import { deriveKey } from '@app/utils/crypto';
import { storeUserSecretKey, getUserSalt } from '@app/core/logic/user';
import { useUserStore } from '@app/core/states/user';
import { storeUserSecretKeyPersistent } from '@app/core/sessionPersistent/storeUserSecretKeyPersistent';

interface LocationState {
  reason?: 'expired' | 'fingerprint_mismatch' | 'decryption_failed' | 'not_found' | 'corrupted';
}

export const ReUnlockPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUserStore((state) => state.user);
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const pageStyles = React.useMemo(() => getPageStyles(mode), [mode]);

  const state = location.state as LocationState;
  const reason = state?.reason;

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

      // If user chose "Remember me", store persistently
      if (rememberMe) {
        const expiresAt = Date.now() + (15 * 24 * 60 * 60 * 1000); // 15 days
        await storeUserSecretKeyPersistent(userSecretKey, expiresAt);
        console.log('[ReUnlockPage] User secret key stored persistently');
      }

      console.log('[ReUnlockPage] Secret key derived and stored successfully');
      
      // Navigate back to home
      navigate('/home');
    } catch (error) {
      console.error('[ReUnlockPage] Error deriving secret key:', error);
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
    },
    content: {
      flex: 1,
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
      marginBottom: spacing.lg,
    },
    form: {
      flex: 1,
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.lg,
      marginBottom: spacing.xl,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: radius.xs,
      borderWidth: 2,
      borderColor: themeColors.primary,
      backgroundColor: 'transparent',
      marginRight: spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxChecked: {
      backgroundColor: themeColors.primary,
    },
    checkboxLabel: {
      fontSize: typography.fontSize.sm,
      color: themeColors.primary,
      fontWeight: typography.fontWeight.medium,
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
      <View style={pageStyles.pageContent}>
        <HeaderTitle title="Déverrouiller le coffre-fort" onBackPress={handleCancel} />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Accès requis</Text>
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

            <View style={styles.checkboxContainer}>
              <View 
                style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
                onTouchEnd={() => setRememberMe(!rememberMe)}
              >
                {rememberMe && (
                  <Text style={{ color: themeColors.whiteText, fontSize: 12 }}>✓</Text>
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                Se souvenir de moi pendant 15 jours
              </Text>
            </View>

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
      </View>
    </View>
  );
}; 