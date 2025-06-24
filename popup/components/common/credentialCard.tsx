import React from 'react';
import { CachedCredential } from '../../../src/types';
import { getUserSecretKey } from '../../../utils/indexdb';
import { decryptData } from '../../../utils/crypto';
import './credentialCard.css';
import { CredentialIcon } from './CredentialIcon';
import { Icon } from './Icon';
import { ErrorBanner } from './ErrorBanner';

interface CredentialCardProps {
  cred: CachedCredential;
  onClick?: () => void;
  hideCopyBtn?: boolean;
  onCopy?: () => void;
}

export const CredentialCard: React.FC<CredentialCardProps> = ({ cred, onClick, hideCopyBtn, onCopy }) => {
  const [error, setError] = React.useState<string | null>(null);
  const iconLetter = cred.title?.charAt(0)?.toUpperCase() || '?';

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
      {error && <ErrorBanner message={error} />}
      <div
        className="credential-card"
        onClick={() => { onClick && onClick(); }}
        tabIndex={0}
        aria-label={`Credential for ${cred.title} (${cred.username})`}
        role="button"
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick && onClick();
          }
        }}
      >
        <div className="card-left">
          <CredentialIcon
            title={cred.title || ''}
            url={cred.url}
          />
          <div className="card-info">
            <div className="card-title">{cred.title || 'Title'}</div>
            <div className="card-username">{cred.username || ''}</div>
          </div>
        </div>
        {!hideCopyBtn && (
          <button className="btn-copy" title="Copy password" onClick={handleCopy} aria-label="Copy password for this credential">
            <div className="btn-copy-container">
              <Icon name="copy" size={25} color={'white'} />
              <span>copier</span>
            </div>
          </button>
        )}
      </div>
    </>
  );
}; 