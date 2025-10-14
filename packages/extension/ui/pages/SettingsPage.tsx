/**
 * SettingsPage (Extension / DOM)
 */

import React from 'react';
import { BackButton } from '@extension/ui/components';
import { useAppRouterContext } from '../router/AppRouterProvider';
import { ROUTES } from '../router/ROUTES';
import { colors, spacing, typography, pageStyles } from '../design';

export const SettingsPage: React.FC = () => {
  const router = useAppRouterContext();

  const handleBack = () => {
    router.navigateTo(ROUTES.HOME);
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.pageContent}>
        <div style={styles.content}>
          <div style={styles.comingSoon}>Plus d'options à venir...</div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  ...pageStyles,
  pageContainer: {
    ...pageStyles.pageContainer,
    gap: spacing.lg,
  },
  pageContent: {
    ...pageStyles.pageContentWithGap,
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


