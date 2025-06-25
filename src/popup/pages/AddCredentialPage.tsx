import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from 'hooks/useUser';
import { passwordGenerator } from 'utils/passwordGenerator';
import { createCredential } from 'logic/items';
import { getUserSecretKey } from 'logic/user';
import { CredentialDecrypted } from 'types/types';
import { ErrorBanner } from '../components/ErrorBanner';
import { Icon } from '../components/Icon';
import Toast, { useToast } from '../components/Toast';
import '../styles/HomePage.css';
import '../styles/AddCredentialPage.css';
import { generateItemKey } from 'utils/crypto';
import { LazyCredentialIcon } from 'popup/components/LazyCredentialIcon';

interface AddCredentialPageProps {
  link?: string;
  onSuccess?: () => void;
}

export const AddCredentialPage: React.FC<AddCredentialPageProps> = ({ link = '', onSuccess }) => {
  const user = useUser();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState(user?.email || '');
  const [password, setPassword] = useState(passwordGenerator(true, true, true, true, 16));
  const [url, setUrl] = useState(link);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast, showToast } = useToast();

  const handleGeneratePassword = () => {
    setPassword(passwordGenerator(true, true, true, true, 16));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const cred: CredentialDecrypted = {
        createdDateTime: new Date(),
        lastUseDateTime: new Date(),
        title,
        username,
        password,
        note,
        url,
        itemKey: generateItemKey(), // Generate a random itemKey
        document_reference: null,
      };
      await createCredential(cred);
      showToast('Identifiant ajouté avec succès');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        navigate('/');
      }, 1200);
    } catch (e: any) {
      setError(e.message || 'Erreur lors de l\'ajout de l\'identifiant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {error && <ErrorBanner message={error} />}
      <Toast message={toast} />
      <div className="page-content">
      <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/')} aria-label="Retour">
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
          <div className="details-title">Ajouter un identifiant</div>
        </div>
        <form className="form-container" onSubmit={handleSubmit}>
        <div className="form-section">
          <label className="inputLabel" htmlFor="title">Nom de l'identifiant</label>
          <input
            id="title"
            type="text"
            className="input"
            placeholder="[credentialsTitle]"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-section">
          <label className="inputLabel" htmlFor="username">Email / Nom d'utilisateur</label>
          <input
            id="username"
            type="email"
            className="input loginInputWrapper"
            placeholder="[userEmail]"
            autoComplete="email"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-section">
          <label className="inputLabel" htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="text"
              className="input"
              placeholder="Entrez un mot de passe..."
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <div className="flex-end">
            <button type="button" className="btn btn-secondary" onClick={handleGeneratePassword}>
              Générer un mot de passe
            </button>
          <div className="password-strength font-md-primary">Sécurité forte <Icon name="security" size={18} color="var(--color-success)" /></div>
          <div className="advanced-options">Options avancées (générateur)</div>
        </div>
        </div>
        <div className="form-section">
          <label className="inputLabel" htmlFor="url">Lien <span className="optional">(optionnel)</span></label>
          <input
            id="url"
            type="text"
            className="input"
            placeholder="[credentialUrl]"
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
        </div>
        <div className="form-section">
          <label className="inputLabel" htmlFor="note">Note <span className="optional">(optionnel)</span></label>
          <input
            id="note"
            type="text"
            className="input"
            placeholder="Entrez une note..."
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>
        <button className="btn btn-primary full-width" type="submit" disabled={loading}>
          Ajouter
        </button>
        </form>
      </div>
    </div>
  );
}; 