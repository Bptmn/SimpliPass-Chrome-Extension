// SettingsPage.tsx
// This page displays the user's profile and settings.
// It also allows the user to logout.

import React, { useState, Suspense } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useUserStore } from '@app/core/states/user';
import { logoutUser } from '@app/core/logic/user';
import { ErrorBanner } from '../components/ErrorBanner';
import { Icon } from '../components/Icon';
import { Toast, useToast } from '../components/Toast';
import { colors } from '@design/colors';
import { layout, radius, spacing } from '@design/layout';
import { typography } from '@design/typography';
import { Button } from '../components/Buttons';

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
          <Pressable style={styles.menuItem} accessibilityLabel="Sécurité">
            <View style={styles.menuIcon}>
              <Icon name="security" size={22} color={colors.secondary} />
            </View>
            <Text style={styles.menuLabel}>Sécurité</Text>
            <View style={styles.menuArrow}>
              <Icon name="arrowForward" size={15} color={colors.primary} />
            </View>
          </Pressable>
          <Pressable style={styles.menuItem} accessibilityLabel="Aide">
            <View style={styles.menuIcon}>
              <Icon name="help" size={22} color={colors.secondary} />
            </View>
            <Text style={styles.menuLabel}>Aide</Text>
            <View style={styles.menuArrow}>
              <Icon name="arrowForward" size={15} color={colors.primary} />
            </View>
          </Pressable>
          <Pressable style={styles.menuItem} accessibilityLabel="Mon abonnement">
            <View style={styles.menuIcon}>
              <Icon name="workspacePremium" size={22} color={colors.secondary} />
            </View>
            <Text style={styles.menuLabel}>Mon abonnement</Text>
            <View style={styles.menuArrow}>
              <Icon name="arrowForward" size={15} color={colors.primary} />
            </View>
          </Pressable>
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
    <View style={styles.pageContainer}>
      {error && <ErrorBanner message={error} />}
      <Toast message={toast} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.pageContent}>
          <View style={styles.pageSection}>
            <View style={styles.profileCard}>
              <View style={styles.userDetails}>
                <View style={styles.userIcon}>
                  <Icon name="person" size={25} color={colors.secondary} />
                </View>
                <Text style={styles.userEmail}>{user?.email || 'Non connecté'}</Text>
              </View>
            </View>
          </View>
          <View style={styles.pageSection}>
            <Suspense fallback={<Text>Chargement…</Text>}>
              <LazyMenu />
            </Suspense>
          </View>
          <View style={styles.pageSection}>
            <View style={styles.profileCard}>
              <Text style={styles.sectionTitle}>Informations supplémentaires</Text>
              <Text style={styles.infoText}>Cette section contient des informations supplémentaires pour tester le défilement.</Text>
              <Text style={styles.infoText}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Text>
              <Text style={styles.infoText}>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</Text>
              <Text style={styles.infoText}>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</Text>
              <Text style={styles.infoText}>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</Text>
            </View>
          </View>
          <View style={styles.btnList}>
            <Button
              text="Donnez votre avis"
              color={colors.secondary}
              size="medium"
              onPress={() => {}}
            />
            <Button
              text="Se déconnecter"
              color={colors.primary}
              size="medium"
              onPress={handleLogout}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  btnList: {
    marginTop: spacing.sm,
  },
  infoText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: '400',
  },
  menuArrow: {
    // Color will be applied to the Icon component
  },
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
    marginBottom: spacing.sm,
    outline: 'none',
    position: 'relative',
    textAlign: 'left',
    width: '100%',
  },
  menuLabel: {
    color: colors.primary,
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: '400',
  },
  menuList: {
    backgroundColor: layout.secondaryBackground,
    borderRadius: radius.md,
    flexDirection: 'column',
    marginBottom: spacing.sm,
    padding: spacing.sm,
  },
  pageContainer: {
    backgroundColor: layout.primaryBackground,
    flex: 1,
    padding: spacing.md,
  },
  pageContent: {
    // Removed flex: 1 to allow scrolling
  },
  pageSection: {
    marginBottom: spacing.md,
  },
  profileCard: {
    backgroundColor: layout.secondaryBackground,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  userDetails: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  userEmail: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: '500',
  },
  userIcon: {
    alignItems: 'center',
    backgroundColor: layout.secondaryBackground,
    borderRadius: 25,
    color: colors.primary,
    fontSize: 24,
    height: 50,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 50,
  },
});

export default SettingsPage;
