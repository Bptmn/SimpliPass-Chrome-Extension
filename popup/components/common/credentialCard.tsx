import React from 'react';
import { CachedCredential } from '../../../src/types';
import { getUserSecretKey } from '../../../utils/indexdb';
import { decryptData } from '../../../utils/crypto';
import './credentialCard.css';

interface CredentialCardProps {
  cred: CachedCredential;
}

export const CredentialCard: React.FC<CredentialCardProps> = ({ cred }) => {
  const iconLetter = cred.title?.charAt(0)?.toUpperCase() || '?';

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const userSecretKey = await getUserSecretKey();
      if (!userSecretKey) throw new Error('User secret key not found');
      const itemKey = await decryptData(userSecretKey, cred.itemKeyCipher);
      const password = await decryptData(itemKey, cred.passwordCipher);
      await navigator.clipboard.writeText(password);
      // Optionally show toast
    } catch (e) {
      // Optionally show error toast
      console.error(e);
    }
  };

  const handleClick = () => {
    // Optionally show credential details
  };

  return (
    <div className="credential-card" onClick={handleClick}>
      <div className="card-left">
        <div className="card-icon">{iconLetter}</div>
        <div className="card-info">
          <div className="card-title">{cred.title || 'Title'}</div>
          <div className="card-username">{cred.username || ''}</div>
        </div>
      </div>
      <button className="copy-btn" title="Copy password" onClick={handleCopy} aria-label="Copy password">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        <span className="copy-btn-text">Copy</span>
      </button>
    </div>
  );
}; 