// SettingsPage.tsx
// This page displays the user's profile and settings.
// It also allows the user to logout.

import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { auth } from '@common/core/adapters/auth.adapter';
import { ErrorBanner } from '@ui/components/ErrorBanner';
import { Icon } from '@ui/components/Icon';
import { useToast } from '@common/hooks/useToast';
import { useManualRefresh } from '@common/hooks/useManualRefresh';
import { getCurrentUser } from '@common/core/services/userService';
import { getPageStyles, spacing, radius } from '@ui/design/layout';
import { typography } from '@ui/design/typography';
import { Button } from '@ui/components/Buttons';
import { ModeSwitch } from '@ui/components/ModeSwitch';
import { useThemeMode } from '@common/ui/design/theme';
import { getColors } from '@ui/design/colors';
import { Toast } from '@ui/components/Toast';
import { User } from '@common/core/types/types';

// MenuList component to avoid defining components during render
const MenuList: React.FC<{ themeColors: any; styles: any }> = ({ themeColors, styles }) => (
  <View style={styles.menuList}>
    {/* Security row */}
    <Pressable style={styles.menuItem} accessibilityLabel="Sécurité">
      <View style={styles.menuIcon}>
        <Icon name="security" size={22} color={themeColors.secondary} />
      </View>
      <Text style={styles.menuLabel}>Sécurité</Text>
      <View style={styles.menuArrow}>
        <Icon name="arrowForward" size={15} color={themeColors.primary} />
      </View>
    </Pressable>
    {/* Help row */}
    <Pressable style={styles.menuItem} accessibilityLabel="Aide">
      <View style={styles.menuIcon}>
        <Icon name="help" size={22} color={themeColors.secondary} />
      </View>
      <Text style={styles.menuLabel}>Aide</Text>
      <View style={styles.menuArrow}>
        <Icon name="arrowForward" size={15} color={themeColors.primary} />
      </View>
    </Pressable>
    {/* Subscription row */}
    <Pressable style={styles.menuItem} accessibilityLabel="Mon abonnement">
      <View style={styles.menuIcon}>
        <Icon name="workspacePremium" size={22} color={themeColors.secondary} />
      </View>
      <Text style={styles.menuLabel}>Mon abonnement</Text>
      <View style={styles.menuArrow}>
        <Icon name="arrowForward" size={15} color={themeColors.primary} />
      </View>
    </Pressable>
    {/* Languages row */}
    <Pressable style={styles.menuItem} accessibilityLabel="Languages">
      <View style={styles.menuIcon}>
        <Icon name="language" size={22} color={themeColors.secondary} />
      </View>
      <Text style={styles.menuLabel}>Languages</Text>
      <View style={styles.menuArrow}>
        <Icon name="arrowForward" size={15} color={themeColors.primary} />
      </View>
    </Pressable>
  </View>
);

interface SettingsPageProps {
  onLogout?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onLogout,
}) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const [user, setUser] = useState<User | null>(null);
  const [_userLoading, setUserLoading] = useState(true);
  console.log('[SettingsPage] user:', user);
  const [error, setError] = useState<string | null>(null);
  const { toast, showToast } = useToast();
  const { 
    refreshAllData, 
    refreshUserOnly, 
    refreshVaultOnly, 
    isRefreshing, 
    error: refreshError, 
    clearError 
  } = useManualRefresh();
  const pageStyles = React.useMemo(() => getPageStyles(mode), [mode]);
  const styles = React.useMemo(() => getStyles(mode), [mode]);

  // Load user data from secure storage
  useEffect(() => {
    const loadUser = async () => {
      try {
        setUserLoading(true);
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('[SettingsPage] Failed to load user:', err);
        setError('Failed to load user data');
      } finally {
        setUserLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      showToast('Déconnexion réussie');
      setTimeout(() => {
        onLogout?.();
      }, 1200);
    } catch {
      setError('Erreur lors de la déconnexion.');
    }
  };

  const handleRefreshAll = async () => {
    try {
      await refreshAllData();
      showToast('Données actualisées avec succès');
    } catch (_err) {
      setError('Erreur lors de l\'actualisation des données');
    }
  };

  const handleRefreshUser = async () => {
    try {
      await refreshUserOnly();
      showToast('Informations utilisateur actualisées');
    } catch (_err) {
      setError('Erreur lors de l\'actualisation des informations utilisateur');
    }
  };

  const handleRefreshVault = async () => {
    try {
      await refreshVaultOnly();
      showToast('Coffre-fort actualisé');
    } catch (_err) {
      setError('Erreur lors de l\'actualisation du coffre-fort');
    }
  };



  // Clear refresh error when component mounts or error changes
  React.useEffect(() => {
    if (refreshError) {
      setError(refreshError);
      clearError();
    }
  }, [refreshError, clearError]);

  return (
    <View style={pageStyles.pageContainer}>
      {error && <ErrorBanner message={error} />}
      <Toast message={toast} />
      <ScrollView style={pageStyles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={pageStyles.pageContent}>
          <View style={styles.pageSection}>
            <View style={styles.profileCard}>
              <View style={styles.userDetails}>
                <View style={styles.userIcon}>
                  <Icon name="person" size={25} color={themeColors.secondary} />
                </View>
                <Text style={styles.userEmail}>{user?.email || 'Non connecté'}</Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userDetailsLabel}>Abonnement : </Text>
                <Text style={styles.userEmail}>Basic</Text>
              </View>
            </View>
          </View>
          
          {/* Manual Refresh Section */}
          <View style={styles.pageSection}>
            <Text style={styles.sectionTitle}>Synchronisation</Text>
            <View style={styles.refreshButtons}>
              <Button
                text={isRefreshing ? "Actualisation..." : "Actualiser tout"}
                color={themeColors.secondary}
                width="full"
                height="full"
                onPress={handleRefreshAll}
                disabled={isRefreshing}
                testID="refresh-all-btn"
                accessibilityLabel="Actualiser toutes les données"
              />
              <Button
                text="Actualiser utilisateur"
                color={themeColors.secondary}
                width="full"
                height="full"
                onPress={handleRefreshUser}
                disabled={isRefreshing}
                testID="refresh-user-btn"
                accessibilityLabel="Actualiser les informations utilisateur"
              />
              <Button
                text="Actualiser coffre-fort"
                color={themeColors.secondary}
                width="full"
                height="full"
                onPress={handleRefreshVault}
                disabled={isRefreshing}
                testID="refresh-vault-btn"
                accessibilityLabel="Actualiser le coffre-fort"
              />
              <Button
                text="Redémarrer synchronisation"
                color={themeColors.secondary}
                width="full"
                height="full"
                onPress={() => {}}
                disabled={isRefreshing}
                testID="restart-listeners-btn"
                accessibilityLabel="Redémarrer la synchronisation en temps réel"
              />
            </View>
          </View>
          
          <View style={styles.pageSection}>
            <View style={styles.modeSwitchWrapper}>
              <ModeSwitch />
            </View>
          </View>
          <View style={styles.pageSection}>
            <MenuList themeColors={themeColors} styles={styles} />
          </View>
          {/* Feedback and logout buttons */}
          <View style={styles.btnList}>
            <Button
              text="Donnez votre avis"
              color={themeColors.secondary}
              width="full"
              height="full"
              onPress={() => {}}
              testID="feedback-btn"
              accessibilityLabel="Donnez votre avis"
            />
            <Button
              text="Se déconnecter"
              color={themeColors.primary}
              width="full"
              height="full"
              onPress={handleLogout}
              testID="logout-btn"
              accessibilityLabel="Se déconnecter"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const getStyles = (mode: 'light' | 'dark') => {
  const themeColors = getColors(mode);
  
  return StyleSheet.create({
    btnList: {
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    refreshButtons: {
      backgroundColor: themeColors.secondaryBackground,
      borderColor: themeColors.borderColor,
      borderRadius: radius.lg,
      borderWidth: 1,
      flexDirection: 'column',
      gap: spacing.sm,
      padding: spacing.sm,
    },
    sectionTitle: {
      color: themeColors.primary,
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing.sm,
    },
    menuArrow: {},
    menuIcon: {
      alignItems: 'center',
      height: 24,
      justifyContent: 'center',
      marginRight: spacing.md,
      width: 24,
    },
    menuItem: {
      alignItems: 'center',
      borderWidth: 0,
      flexDirection: 'row',
      height: 35,
      justifyContent: 'flex-start',
      outline: 'none',
      position: 'relative',
      textAlign: 'left',
      width: '100%',
    },
    menuLabel: {
      color: themeColors.primary,
      flex: 1,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.regular,
    },
    menuList: {
      backgroundColor: themeColors.secondaryBackground,
      borderColor: themeColors.borderColor,
      borderRadius: radius.lg,
      borderWidth: 1,
      flexDirection: 'column',
      gap: spacing.sm,
      padding: spacing.sm,
    },
    modeSwitchWrapper: {
      alignItems: 'center',
      marginVertical: spacing.sm,
    },
    pageSection: {},
    profileCard: {
      backgroundColor: themeColors.secondaryBackground,
      borderColor: themeColors.borderColor,
      borderRadius: radius.lg,
      borderWidth: 1,
      flexDirection: 'column',
      gap: spacing.sm,
      padding: spacing.sm,
      shadowColor: themeColors.blackText,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
    },

    userDetails: {
      alignItems: 'center',
      flexDirection: 'row',
    },
    userDetailsLabel: {
      color: themeColors.secondary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      paddingBottom: spacing.xs,
    },
    userEmail: {
      color: themeColors.primary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
    },
    userIcon: {
      alignItems: 'center',
      backgroundColor: themeColors.secondaryBackground,
      borderRadius: 25,
      color: themeColors.secondary,
      fontSize: typography.fontSize.xl,
      justifyContent: 'center',
      marginRight: spacing.sm,
    },
  });
};
