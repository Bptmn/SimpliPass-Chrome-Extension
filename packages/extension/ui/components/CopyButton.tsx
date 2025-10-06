/**
 * CopyButton.tsx (Extension / DOM)
 *
 * Purpose: Copy text to clipboard with visual feedback
 */

import React from 'react';
import { colors, radius, spacing, typography } from '../design/tokens';
import { useClipboard } from '@common/hooks/useClipboard';

interface CopyButtonProps {
  textToCopy: string;
  ariaLabel?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ 
  textToCopy, 
  ariaLabel = 'Copier', 
  children, 
  onClick 
}) => {
  const { copyToClipboard } = useClipboard();

  const handleCopy = async () => {
    try {
      await copyToClipboard(textToCopy, 'Copié !');
      if (onClick) onClick();
    } catch {
      alert('Erreur lors de la copie');
    }
  };

  return (
    <button 
      style={styles.button} 
      onClick={handleCopy}
      aria-label={ariaLabel}
      data-testid="copy-button"
    >
      {children || (
        <div style={styles.container}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke={colors.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke={colors.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={styles.text}>Copier</span>
        </div>
      )}
    </button>
  );
};

const styles: Record<string, React.CSSProperties> = {
  button: {
    appearance: 'none',
    border: 'none',
    backgroundColor: colors.secondary,
    borderRadius: radius.sm,
    color: colors.white,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
    transition: 'opacity 0.2s',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    height: '100%',
    width: '100%',
  },
  text: {
    color: colors.whiteText,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.base,
    marginTop: spacing.xxs,
  },
};

export default CopyButton;

