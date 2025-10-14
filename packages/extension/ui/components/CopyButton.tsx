/**
 * CopyButton.tsx (Extension / DOM)
 *
 * Purpose: Copy text to clipboard with visual feedback
 */

import React from 'react';
import { colors, radius, spacing, typography } from '../design';
import { useClipboard } from '@common/hooks/useClipboard';
import { Icon } from './Icon';

interface CopyButtonProps {
  textToCopy: string;
  onClick?: () => void;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ 
  textToCopy, 
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
      aria-label="Copier"
      data-testid="copy-button"
    >
      <div style={styles.container}>
        <Icon name="copy" size={spacing.copyButtonIconSize} color="white" />
        <span style={styles.text}>copier</span>
      </div>
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
    // Taille fixe centralisée
    width: spacing.copyButtonWidth,
    height: spacing.copyButtonHeight,
    minWidth: spacing.copyButtonWidth,
    minHeight: spacing.copyButtonHeight,
    // Styles centralisés - ne peuvent pas être modifiés par les pages
    fontFamily: typography.fontFamily.base,
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
    // Couleur, taille et famille centralisées
    color: colors.whiteText,
    fontSize: typography.fontSize.xxs,
    fontFamily: typography.fontFamily.base,
    fontWeight: typography.fontWeight.regular,
    marginTop: spacing.xxs,
    // Empêche la surcharge depuis l'extérieur
    textAlign: 'center',
  },
};

export default CopyButton;

