/**
 * ReUnlockPage.tsx
 * 
 * Fallback unlock page that appears when persistent key restoration fails
 * This page allows users to re-enter their master password to restore access
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@ui/components/Buttons';
import { Input } from '@ui/components/InputFields';
import { HeaderTitle } from '@ui/components/HeaderTitle';
import { getColors } from '@ui/design/colors';
import { spacing, radius } from '@ui/design/layout';
import { typography } from '@ui/design/typography';
import { useThemeMode } from '@common/ui/design/theme';
import { getPageStyles } from '@ui/design/layout';
import { useReEnterPassword } from '@common/hooks/useReEnterPassword';
import { storage } from '@common/core/adapters/platform.storage.adapter';
import { User } from '@common/core/types/types';

interface LocationState {
  reason?: 'expired' | 'fingerprint_mismatch' | 'decryption_failed' | 'not_found' | 'corrupted';
}

export const ReUnlockPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [_userLoading, setUserLoading] = useState(true);
  const { reEnterPassword, isLoading } = useReEnterPassword();
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const pageStyles = React.useMemo(() => getPageStyles(mode), [mode]);

  // Load user data from secure storage
  useEffect(() => {
    const loadUser = async () => {
      try {
        setUserLoading(true);
        const userData = await storage.getUserFromSecureLocalStorage();
        setUser(userData);
      } catch (err) {
        console.error('[ReUnlockPage] Failed to load user:', err);
      } finally {
        setUserLoading(false);
      }
    };

    loadUser();
  }, []);

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

    try {
      await reEnterPassword(password);
      // Navigation is handled by the hook
    } catch (reEnterError) {
      console.error('[ReUnlockPage] Error during password re-entry:', reEnterError);
      // Error is handled by the hook
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