/**
 * CredentialCard.tsx (Extension / DOM)
 *
 * Purpose: Display a single credential with title, username, and copy button
 */

import React, { useState } from 'react';
import type { CredentialDecrypted } from '@common/core/types/items.types';
import { colors, spacing, radius, typography } from '../design/tokens';
import { useClipboard } from '@common/hooks/useClipboard';

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
  const { copyToClipboard } = useClipboard();

  // Handle copying the password to clipboard
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    try {
      await copyToClipboard(credential.password, "Mot de passe copié !");
      if (onCopy) onCopy();
    } catch {
      setError('Impossible de copier le mot de passe');
    }
  };

  return (
    <div style={styles.credentialCard} onClick={onPress} data-testid={testID}>
      <div style={styles.credentialCardLeft}>
        {/* Favicon / Icon */}
        {!disableFavicon && credential.domain && (
          <img
            src={`https://www.google.com/s2/favicons?domain=${credential.domain}&sz=32`}
            alt=""
            style={styles.favicon}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        {!credential.domain && (
          <div style={styles.placeholderIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke={colors.primary} strokeWidth="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}

        {/* Info */}
        <div style={styles.credentialCardInfo}>
          <div style={styles.credentialCardTitle}>{credential.title}</div>
          <div style={styles.credentialCardUsername}>{credential.username}</div>
        </div>
      </div>

      {/* Copy Button */}
      {!hideCopyBtn && (
        <button style={styles.copyButton} onClick={handleCopy} data-testid={`${testID}-copy`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {/* Error (if any) */}
      {error && (
        <div style={styles.errorTooltip}>{error}</div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  credentialCard: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.secondaryBackground,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: radius.md,
    padding: 6,
    width: '100%',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s',
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
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.base,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  credentialCardUsername: {
    color: colors.tertiaryText,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.base,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  favicon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
  },
  placeholderIcon: {
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.sm,
  },
  copyButton: {
    appearance: 'none',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    transition: 'background 0.2s',
  },
  errorTooltip: {
    position: 'absolute',
    top: -30,
    right: 0,
    backgroundColor: colors.error,
    color: colors.white,
    fontSize: typography.fontSize.xs,
    padding: `${spacing.xs}px ${spacing.sm}px`,
    borderRadius: radius.sm,
    whiteSpace: 'nowrap',
  },
};

export default CredentialCard;

