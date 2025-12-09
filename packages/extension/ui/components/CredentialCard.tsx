/**
 * CredentialCard.tsx (Extension / DOM)
 *
 * Purpose: Display a single credential with title, username, and copy button
 */

import React, { useState } from 'react';
import type { CredentialDecrypted } from '@common/types/items.types';
import { colors, spacing, radius, shadow, cardStyles, textStyles } from '../design';
import { LazyCredentialIcon } from './LazyCredentialIcon';
import { CopyButton } from './CopyButton';

interface CredentialCardProps {
  credential: CredentialDecrypted;
  onPress: () => void;
  testID?: string;
  hideCopyBtn?: boolean;
  onCopy?: () => void;
  disableFavicon?: boolean;
}

export const CredentialCard: React.FC<CredentialCardProps> = ({
  credential,
  onPress,
  testID,
  hideCopyBtn,
  onCopy,
  disableFavicon = false,
}) => {
  const [error, setError] = useState<string | null>(null);

  return (
    <div style={styles.credentialCard} onClick={onPress} data-testid={testID}>
      <div style={styles.credentialCardLeft}>
        {/* Lazy Credential Icon */}
        <LazyCredentialIcon 
          title={credential.title} 
          url={credential.url || ''} 
          disableFavicon={disableFavicon}
          style={styles.iconContainer}
        />

        {/* Info */}
        <div style={styles.credentialCardInfo}>
          <div style={styles.credentialCardTitle}>{credential.title}</div>
          <div style={styles.credentialCardUsername}>{credential.username}</div>
        </div>
      </div>

      {/* Copy Button */}
      {!hideCopyBtn && (
        <div onClick={(e) => e.stopPropagation()}>
          <CopyButton
            textToCopy={credential.password}
            onClick={() => {
              if (onCopy) onCopy();
            }}
          />
        </div>
      )}

      {/* Error (if any) */}
      {error && (
        <div style={styles.errorTooltip}>{error}</div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  ...cardStyles,
  ...textStyles,
  credentialCard: {
    ...cardStyles.card,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 6,
    width: '100%',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s',
    boxSizing: 'border-box',
  },
  credentialCardLeft: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0, // Allow text truncation
  },
  credentialCardInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    minWidth: 0,
    maxWidth: 200,
  },
  credentialCardTitle: {
    ...textStyles.cardTitle,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  credentialCardUsername: {
    ...textStyles.cardSubtitle,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    flexShrink: 0,
  },
  errorTooltip: {
    ...textStyles.error,
    position: 'absolute' as const,
    top: -30,
    right: 0,
    backgroundColor: colors.error,
    color: colors.white,
    padding: `${spacing.xs}px ${spacing.sm}px`,
    borderRadius: radius.sm,
    whiteSpace: 'nowrap' as const,
  },
};

export default CredentialCard;


