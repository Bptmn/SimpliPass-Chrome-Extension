/**
 * HeaderTitle.tsx (Extension / DOM)
 *
 * Purpose: Header component with back button and centered title
 */

import React from 'react';
import { colors, spacing, typography } from '../design/tokens';
import { Icon } from './Icon';

interface HeaderTitleProps {
  title: string;
  onBackPress: () => void;
  testID?: string;
  accessibilityLabel?: string;
}

export const HeaderTitle: React.FC<HeaderTitleProps> = ({
  title,
  onBackPress,
  testID = 'header-title',
  accessibilityLabel,
}) => {
  return (
    <div style={styles.headerContainer} data-testid={testID}>
      <button
        style={styles.backButton}
        onClick={onBackPress}
        aria-label={accessibilityLabel || 'Retour'}
        data-testid="header-back-button"
      >
        <Icon name="arrowForward" size={20} color={colors.primary} />
      </button>
      <h1 style={styles.title}>{title}</h1>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  headerContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
    marginBottom: spacing.md,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    paddingRight: spacing.sm,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    zIndex: 1,
  },
  title: {
    color: colors.primary,
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.base,
    textAlign: 'center',
    margin: 0,
  },
};

export default HeaderTitle;
