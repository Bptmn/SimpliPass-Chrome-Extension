// SettingsPage.tsx
// This page displays the user's profile and settings.
// It also allows the user to logout.

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useUserStore } from '@app/core/states/user';
import { logoutUser } from '@app/core/logic/auth';
import { colors } from '@design/colors';
import { spacing, radius } from '@design/layout';
import { typography } from '@design/typography';

const SettingsPage: React.FC = () => {
  const user = useUserStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      // The app will automatically redirect to login
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.pageContainer}>
          <View style={styles.pageContent}>
            <View style={styles.pageHeader}>
              <Text style={styles.title}>Settings</Text>
            </View>

            <View style={styles.pageSection}>
              <Text style={styles.sectionTitle}>Account</Text>
              <View style={styles.card}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{user.email}</Text>
              </View>
            </View>

            <View style={styles.pageSection}>
              <Text style={styles.sectionTitle}>Security</Text>
              <Pressable
                style={[styles.button, styles.logoutButton]}
                onPress={handleLogout}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Logging out...' : 'Logout'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackground,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  pageContainer: {
    backgroundColor: colors.primaryBackground,
    flex: 1,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  pageContent: {
    flex: 1,
    gap: spacing.md,
  },
  pageHeader: {
    marginBottom: spacing.lg,
  },
  pageSection: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.blackText,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.blackText,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.tertiaryText,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.xs,
    color: colors.tertiaryText,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: typography.fontSize.sm,
    color: colors.blackText,
    fontWeight: typography.fontWeight.medium,
  },
  durationOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  durationOptionSelected: {
    backgroundColor: colors.primary,
  },
  durationLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.blackText,
  },
  durationLabelSelected: {
    color: colors.whiteText,
    fontWeight: typography.fontWeight.bold,
  },
  checkmark: {
    color: colors.whiteText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  logoutButton: {
    backgroundColor: colors.error,
  },
  buttonText: {
    fontSize: typography.fontSize.sm,
    color: colors.whiteText,
    fontWeight: typography.fontWeight.bold,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});

export default SettingsPage;
