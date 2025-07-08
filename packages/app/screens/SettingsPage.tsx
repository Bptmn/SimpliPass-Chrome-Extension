// SettingsPage.tsx
// This page displays the user's profile and settings.
// It also allows the user to logout.

import React, { useState, Suspense } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useUserStore } from '@app/core/states/user';
import { logoutUser } from '@app/core/logic/user';
import { ErrorBanner } from '@components/ErrorBanner';
import { Icon } from '@components/Icon';
import { useToast } from '@app/core/hooks/useToast';
import { pageStyles } from '@design/layout';
import { radius, spacing } from '@design/layout';
import { typography } from '@design/typography';
import { Button } from '@components/Buttons';
import { ModeSwitch } from '@components/ModeSwitch';
import { colors } from '@design/colors';
import { Toast } from '@components/Toast';

const SettingsPage: React.FC = () => {
  const user = useUserStore((state) => state.user);
  console.log('[SettingsPage] user:', user);
  const [error, setError] = useState<string | null>(null);
  const { toast, showToast } = useToast();

  const handleLogout = async () => {
    try {
      await logoutUser();
      showToast('Déconnexion réussie');
      setTimeout(() => window.location.reload(), 1200);
    } catch {
      setError('Erreur lors de la déconnexion.');
    }
  };

  // Lazy load non-critical sections (simulate for demo)
  const LazyMenu = React.lazy(() =>
    Promise.resolve({
      default: () => (
        <View style={styles.menuList}>
          {/* Security row */}
          <Pressable style={styles.menuItem} accessibilityLabel="Sécurité">
            <View style={styles.menuIcon}>
              <Icon name="security" size={22} color={colors.secondary} />
            </View>
            <Text style={styles.menuLabel}>Sécurité</Text>
            <View style={styles.menuArrow}>
              <Icon name="arrowForward" size={15} color={colors.primary} />
            </View>
          </Pressable>
          {/* Help row */}
          <Pressable style={styles.menuItem} accessibilityLabel="Aide">
            <View style={styles.menuIcon}>
              <Icon name="help" size={22} color={colors.secondary} />
            </View>
            <Text style={styles.menuLabel}>Aide</Text>
            <View style={styles.menuArrow}>
              <Icon name="arrowForward" size={15} color={colors.primary} />
            </View>
          </Pressable>
          {/* Subscription row */}
          <Pressable style={styles.menuItem} accessibilityLabel="Mon abonnement">
            <View style={styles.menuIcon}>
              <Icon name="workspacePremium" size={22} color={colors.secondary} />
            </View>
            <Text style={styles.menuLabel}>Mon abonnement</Text>
            <View style={styles.menuArrow}>
              <Icon name="arrowForward" size={15} color={colors.primary} />
            </View>
          </Pressable>
          {/* Languages row */}
          <Pressable style={styles.menuItem} accessibilityLabel="Languages">
            <View style={styles.menuIcon}>
              <Icon name="language" size={22} color={colors.secondary} />
            </View>
            <Text style={styles.menuLabel}>Languages</Text>
            <View style={styles.menuArrow}>
              <Icon name="arrowForward" size={15} color={colors.primary} />
            </View>
          </Pressable>
        </View>
      ),
    }),
  );

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
                  <Icon name="person" size={25} color={colors.secondary} />
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
            <Suspense fallback={<Text>Chargement…</Text>}>
              <LazyMenu />
            </Suspense>
          </View>
          {/* Feedback and logout buttons */}
          <View style={styles.btnList}>
            <Button
              text="Donnez votre avis"
              color={colors.secondary}
              width="full"
              height="full"
              onPress={() => {}}
              testID="feedback-btn"
              accessibilityLabel="Donnez votre avis"
            />
            <Button
              text="Se déconnecter"
              color={colors.primary}
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

const styles = StyleSheet.create({
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
    color: colors.primary,
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
  },
  menuList: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: radius.md,
    flexDirection: 'column',
    padding: spacing.sm,
    gap: spacing.sm,
    borderColor: colors.borderColor,
    borderWidth: 1,
  },
  modeSwitchWrapper: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  pageSection: {},
  profileCard: {
    backgroundColor: colors.secondaryBackground,
    borderColor: colors.borderColor,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'column',
    gap: spacing.sm,
    padding: spacing.sm,
    shadowColor: colors.blackText,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },

  userDetails: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  userDetailsLabel: {
    color: colors.secondary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  userEmail: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  userIcon: {
    alignItems: 'center',
    backgroundColor: colors.secondaryBackground,
    borderRadius: 25,
    color: colors.secondary,
    fontSize: typography.fontSize.xl,
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
});

export default SettingsPage;
