// CredentialCard.tsx
// This component displays a single credential (title, username, icon) and provides a copy-to-clipboard button for the password.
// Used in both the popup and popover for credential display and interaction.

import React from 'react';

import { ErrorBanner } from '../ui/ErrorBanner';
import { Icon } from '../ui/Icon';
import { CredentialVaultDb } from 'shared/types/types';
import { decryptData } from 'shared/utils/crypto';
import { getUserSecretKey } from 'features/auth/services/user';
import styles from 'shared/styles/CredentialCard.module.css';
import { LazyCredentialIcon } from './LazyCredentialIcon';

// Props for CredentialCard
interface CredentialCardProps {
  cred: CredentialVaultDb;
  onClick?: () => void;
  hideCopyBtn?: boolean;
  onCopy?: () => void;
}

export const CredentialCard: React.FC<CredentialCardProps> = React.memo(
  ({ cred, onClick, hideCopyBtn, onCopy }) => {
    const [error, setError] = React.useState<string | null>(null);
    const iconLetter = cred.title?.charAt(0)?.toUpperCase() || '?';

    // Handles copying the password to clipboard
    const handleCopy = async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        const userSecretKey = await getUserSecretKey();
        if (!userSecretKey) throw new Error('User secret key not found');
        const itemKey = await decryptData(userSecretKey, cred.itemKeyCipher);
        const password = await decryptData(itemKey, cred.passwordCipher);
        await navigator.clipboard.writeText(password);
        if (onCopy) onCopy();
      } catch (e) {
        setError('Erreur lors de la copie du mot de passe.');
      }
    };

    return (
      <>
        {/* Show error banner if copy fails */}
        {error && <ErrorBanner message={error} />}
        <div
          className={styles.credentialCard}
          onClick={() => {
            if (onClick) onClick();
          }}
          tabIndex={0}
          aria-label={`Credential for ${cred.title} (${cred.username})`}
          role="button"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              if (onClick) onClick();
            }
          }}
        >
          <div className={styles.cardLeft}>
            {/* Credential icon (favicon or letter) */}
            <LazyCredentialIcon title={cred.title || ''} url={cred.url} />
            <div className={styles.cardInfo}>
              <div className={styles.cardTitle}>{cred.title || 'Title'}</div>
              <div className={styles.cardUsername}>{cred.username || ''}</div>
            </div>
          </div>
          {/* Copy button, hidden if hideCopyBtn is true */}
          {!hideCopyBtn && (
            <button
              className={styles.btnCopy}
              title="Copy password"
              onClick={handleCopy}
              aria-label="Copy password for this credential"
            >
              <div className={styles.btnCopyContainer}>
                <Icon name="copy" size={25} color={'white'} />
                <span>copier</span>
              </div>
            </button>
          )}
        </div>
      </>
    );
  },
);
