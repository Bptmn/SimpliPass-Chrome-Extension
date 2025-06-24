import React from 'react';
import './PopoverCredentialPicker.css';

// Minimal popover-specific CredentialCard
interface PopoverCredentialCardProps {
  cred: { id: string; title: string; username: string; url?: string };
  onClick?: () => void;
  hideCopyBtn?: boolean;
}
const PopoverCredentialCard: React.FC<PopoverCredentialCardProps> = ({ cred, onClick, hideCopyBtn }) => (
  <div className="popover-credential-card" onClick={onClick} tabIndex={0} role="button">
    <div className="popover-card-info">
      <div className="popover-card-title">{cred.title || 'Title'}</div>
      <div className="popover-card-username">{cred.username || ''}</div>
    </div>
    {/* No copy button for popover, or add if needed */}
  </div>
);

// Minimal popover-specific ErrorBanner
const PopoverErrorBanner: React.FC<{ message: string }> = ({ message }) => (
  <div className="popover-error-banner" role="alert" aria-live="assertive">
    <span>{message}</span>
  </div>
);

interface PopoverCredentialPickerProps {
  credentials: Array<{ id: string; title: string; username: string; url?: string; itemKeyCipher: string; passwordCipher: string; }>;
  onPick: (credential: { id: string; title: string; username: string; url?: string; itemKeyCipher: string; passwordCipher: string; }) => void;
  onClose: () => void;
}

export const PopoverCredentialPicker: React.FC<PopoverCredentialPickerProps> = ({ credentials, onPick, onClose }) => {
  const [error, setError] = React.useState<string | null>(null);

  return (
    <div className="inpage-picker-root">
      {error && <PopoverErrorBanner message={error} />}
      <button className="inpage-picker-close" onClick={onClose} aria-label="Fermer">×</button>
      <div className="inpage-picker-title">Suggestion</div>
      <div className="inpage-picker-list">
        {credentials.slice(0, 2).map(cred => (
          <div key={cred.id} className="inpage-picker-card" onClick={() => onPick(cred)} tabIndex={0} role="button" aria-label={`Utiliser l'identifiant pour ${cred.title} (${cred.username})`} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onPick(cred); }}>
            <PopoverCredentialCard cred={{...cred, url: cred.url || ''}} hideCopyBtn={true} />
          </div>
        ))}
      </div>
    </div>
  );
}; 