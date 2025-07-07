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
import { pageStyles } from '@design/layout';
import { radius, spacing } from '@design/layout';
import { typography } from '@design/typography';
import { Button } from '../components/Buttons';
import { ModeSwitch } from '../components/ModeSwitch';
import { useNavigate } from 'react-router-dom';
import { colors } from '@design/colors';

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
        <View style={styles.pageContent}>
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
            />
            <Button
              text="Se déconnecter"
              color={colors.primary}
              width="full"
              height="full"
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
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  infoText: {
    color: '#4f86a2', // fallback, not theme aware
    fontSize: typography.fontSize.sm,
    fontWeight: '400',
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
    marginBottom: spacing.sm,
    outline: 'none',
    position: 'relative',
    textAlign: 'left',
    width: '100%',
  },
  menuLabel: {
    color: '#4f86a2', // fallback, not theme aware
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: '400',
  },
  menuList: {
    backgroundColor: '#f1f4f8', // fallback, not theme aware
    borderRadius: radius.md,
    flexDirection: 'column',
    padding: spacing.sm,
  },
  pageContent: {
    gap: spacing.md,
  },
  pageSection: {},
  profileCard: {
    flexDirection: 'column',
    gap: spacing.sm,
    backgroundColor: '#f1f4f8', // fallback, not theme aware
    borderColor: '#E0E3E7', // fallback, not theme aware
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  sectionTitle: {
    color: '#4f86a2', // fallback, not theme aware
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  userDetails: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  userDetailsLabel: {
    color: '#2eae97', // fallback, not theme aware
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
  userEmail: {
    color: '#4f86a2', // fallback, not theme aware
    fontSize: typography.fontSize.md,
    fontWeight: '500',
  },
  userIcon: {
    alignItems: 'center',
    backgroundColor: '#f1f4f8', // fallback, not theme aware
    borderRadius: 25,
    color: '#4f86a2', // fallback, not theme aware
    fontSize: 24,
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  modeSwitchWrapper: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
});

export default SettingsPage;
