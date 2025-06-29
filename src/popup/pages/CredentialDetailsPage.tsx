import React, { useState } from 'react';

import { CredentialDecrypted } from 'types/types';
import { LazyCredentialIcon } from '../components/LazyCredentialIcon';
import '../styles/CredentialDetailsPage.css';
import { ErrorBanner } from '../components/ErrorBanner';
import { Icon } from '../components/Icon';
import '../../styles/common.css';
import '../../styles/tokens.css';
import { useToast } from '../components/Toast';

interface CredentialDetailsPageProps {
  credential: CredentialDecrypted;
  onBack: () => void;
}

export const CredentialDetailsPage: React.FC<CredentialDetailsPageProps> = ({
  credential,
  onBack,
}) => {
  const [showMeta, setShowMeta] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { showToast } = useToast();

  const handleCopy = (value: string, label: string) => {
    try {
      navigator.clipboard.writeText(value);
      showToast(`${label} copié !`);
    } catch {
      setError('Erreur lors de la copie.');
    }
  };

  const handleLaunch = (url: string) => {
    try {
      const normalizedUrl = url.match(/^https?:\/\//i) ? url : `https://${url}`;
      window.open(normalizedUrl, '_blank');
    } catch {
      setError("Erreur lors de l'ouverture du lien.");
    }
  };

  return (
    <div className="page-container">
      {error && <ErrorBanner message={error} />}
      <div className="page-content">
        <div className="page-header-container">
        <button className="back-btn" onClick={onBack} aria-label="Retour" style={{ position: 'unset'}}>
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        <div className="page-header details-header">
          <div className="details-icon-center">
            <LazyCredentialIcon title={credential.title} url={credential.url} />
          </div>
          <div className="details-title">{credential.title}</div>
        </div>
        </div>

        {/* Credential fields (email and password) */}
        <div className="card grouped-fields">
          {/* Email/Nom d'utilisateur */}
          <div className="details-credential-fields">
            <div className="details-field-left">
              <div className="details-field-label">Email/Nom d'utilisateur :</div>
              <div className="details-field-value">{credential.username}</div>
            </div>
            {credential.username && (
              <button
                className="btn-copy details-copy-btn"
                onClick={() => handleCopy(credential.username, "Nom d'utilisateur")}
                aria-label="Copier le titulaire"
              >
                <div className="btn-copy-container">
                  <Icon name="copy" size={25} color={'white'} />
                  <span>copier</span>
                </div>
              </button>
            )}
          </div>
          <div className="details-field-divider"></div>
          {/* Mot de passe */}
          <div className="details-credential-fields">
            <div className="details-field-left">
              <div className="details-field-label">Mot de passe :</div>
              <div className="details-field-value">
                {showPassword ? credential.password : '••••••••'}
                <button
                  className="loginEyeBtn"
                  type="button"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  onClick={() => setShowPassword((v) => !v)}
                  style={{ background: 'none', border: 'none', marginLeft: 8, cursor: 'pointer', verticalAlign: 'middle' }}
                >
                  <Icon name={showPassword ? 'visibilityOff' : 'visibility'} size={22} color={'var(--color-accent)'} />
                </button>
              </div>
            </div>
            {credential.password && (
              <button
                className="btnCopy"
                onClick={() => handleCopy(credential.password, "Mot de passe")}
                aria-label="Copier le numéro de carte"
              >
                <div className="btnCopyContainer">
                  <Icon name="copy" size={25} color={'white'} />
                  <span>copier</span>
                </div>
              </button>
            )}
          </div>
        </div>
        {/* Lien */}
        <div className="card details-field-card">
          <div className="details-field-left">
            <div className="details-field-label">Lien :</div>
            <div className="details-field-value">{credential.url}</div>
          </div>
          <button
            className="details-launch-btn"
            onClick={() => handleLaunch(credential.url)}
            aria-label="Ouvrir le lien dans un nouvel onglet"
          >
            <Icon name="launch" size={25} color={'var(--color-secondary)'} />
          </button>
        </div>
        {/* Note */}
        <div className="card details-field-card">
          <div className="details-field-left">
            <div className="details-field-label">Note :</div>
            <div className="details-field-value">{credential.note}</div>
          </div>
          {credential.note && (
            <button
              className="btn-copy details-copy-btn"
              onClick={() => handleCopy(credential.note, "Note")}
              aria-label="Copier la note"
            >
              <div className="btn-copy-container">
                <Icon name="copy" size={25} color={'white'} />
                <span>copier</span>
              </div>
            </button>
          )}
        </div>
        <div className="details-actions-row">
          <button className="details-edit-btn action-btn">Modifier</button>
          <button className="details-delete-btn action-btn">Supprimer</button>
        </div>
        <div
          className="details-info-row"
          onClick={() => setShowMeta((v) => !v)}
          tabIndex={0}
          role="button"
          aria-expanded={showMeta}
          aria-label="Afficher plus d'informations"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setShowMeta((v) => !v);
          }}
        >
          <div className="details-info-row-content">
            <span className="details-info-icon">
              <Icon name="info" size={18} color={'var(--color-primary)'} />
            </span>
            <span className="details-info-label">Plus d'informations</span>
            <span className="details-info-arrow">
              {showMeta ? (
                <Icon name="arrowDown" size={18} color={'var(--color-primary)'} />
              ) : (
                <Icon name="arrowRight" size={18} color={'var(--color-primary)'} />
              )}
            </span>
          </div>
          {showMeta && (
            <div className="details-meta-row">
              <div>Dernière utilisation : {credential.lastUseDateTime.toLocaleDateString()}</div>
              <div>Date de création : {credential.createdDateTime.toLocaleDateString()}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
