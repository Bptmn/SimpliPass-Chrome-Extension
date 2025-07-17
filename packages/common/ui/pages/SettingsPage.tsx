// SettingsPage.tsx
// This page displays the user's profile and settings.
// It also allows the user to logout.

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useUserStore } from '@common/core/states/user';
import { auth } from '@common/core/adapters/auth.adapter';
import { ErrorBanner } from '@ui/components/ErrorBanner';
import { Icon } from '@ui/components/Icon';
import { useToast } from '@common/hooks/useToast';
import { getPageStyles, spacing, radius } from '@ui/design/layout';
import { typography } from '@ui/design/typography';
import { Button } from '@ui/components/Buttons';
import { ModeSwitch } from '@ui/components/ModeSwitch';
import { useThemeMode } from '@common/ui/design/theme';
import { getColors } from '@ui/design/colors';
import { Toast } from '@ui/components/Toast';

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
  const user = useUserStore((state) => state.user);
  console.log('[SettingsPage] user:', user);
  const [error, setError] = useState<string | null>(null);
  const { toast, showToast } = useToast();
  const pageStyles = React.useMemo(() => getPageStyles(mode), [mode]);
  const styles = React.useMemo(() => getStyles(mode), [mode]);

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
