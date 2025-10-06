/**
 * SettingsPage (Extension / DOM)
 */

import React from 'react';
import { BackButton } from '@extension/ui/components';
import { useAppRouterContext } from '../router/AppRouterProvider';
import { ROUTES } from '../router/ROUTES';
import { colors, spacing, typography } from '../design/tokens';

export const SettingsPage: React.FC = () => {
  const router = useAppRouterContext();

  const handleBack = () => {
    router.navigateTo(ROUTES.HOME);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <BackButton onClick={handleBack} label="Retour" />
        <h2 style={styles.title}>Paramètres</h2>
      </div>
      <div style={styles.content}>
        <div style={styles.comingSoon}>Plus d'options à venir...</div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: spacing.lg,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.lg,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    margin: 0,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.base,
    color: colors.primary,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  },
  comingSoon: {
    color: colors.tertiary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.base,
  },
};

export default SettingsPage;


