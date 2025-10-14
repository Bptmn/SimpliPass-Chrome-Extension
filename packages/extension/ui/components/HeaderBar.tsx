/**
 * HeaderBar.tsx (Extension / DOM)
 *
 * Purpose: Header component with back button and centered title
 */

import React from 'react';
import { colors, spacing, commonStyles } from '../design';
import { Icon } from './Icon';

interface HeaderBarProps {
  title: string;
  onBackPress: () => void;
  testID?: string;
  accessibilityLabel?: string;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  onBackPress,
  testID = 'header-bar',
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
        <Icon name="arrowBack" size={20} color={colors.primary} />
      </button>
      <h1 style={styles.title}>{title}</h1>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  ...commonStyles,
  headerContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Centrer horizontalement
    marginBottom: 15, // 15px comme demandé
    position: 'relative', // Pour positionner le bouton
  },
  backButton: {
    position: 'absolute',
    left: 0, // Positionner à gauche
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: spacing.xs,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...commonStyles.title,
    textAlign: 'center' as const,
    margin: 0, // Reset margin par défaut
  },
};

export default HeaderBar;
