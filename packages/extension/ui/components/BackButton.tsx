/**
 * BackButton.tsx (Extension / DOM)
 *
 * Purpose: Reusable back navigation button with arrow icon
 */

import React from 'react';
import { colors, spacing, typography } from '../design/tokens';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, label = 'Retour' }) => {
  return (
    <button style={styles.backButton} onClick={onClick} data-testid="back-button">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path 
          d="M19 12H5M5 12L12 19M5 12L12 5" 
          stroke={colors.primary} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      <span style={styles.backButtonText}>{label}</span>
    </button>
  );
};

const styles: Record<string, React.CSSProperties> = {
  backButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: spacing.xs,
    borderRadius: 8,
    transition: 'background 0.2s',
  },
  backButtonText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.base,
  },
};

export default BackButton;

