import React, { useState, useEffect } from 'react';
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
import { Input, InputPasswordGenerator } from '../components/InputVariants';
import '../../styles/common.css';
import '../../styles/tokens.css';

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

  useEffect(() => {
    if (user?.email) {
      setUsername(user.email);
    }
  }, [user?.email]);

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
          <Input
            label="Nom de l'identifiant"
            id="title"
            type="text"
            value={title}
            onChange={setTitle}
            placeholder="[credentialsTitle]"
            required
          />
          <Input
            label="Email / Nom d'utilisateur"
            id="username"
            type="email"
            value={username}
            onChange={setUsername}
            placeholder="[userEmail]"
            autoComplete="email"
            required
          />
          <InputPasswordGenerator
            label="Mot de passe"
            id="password"
            value={password}
            onChange={setPassword}
            onGenerate={handleGeneratePassword}
            placeholder="Entrez un mot de passe..."
            required
            passwordStrength="Sécurité forte"
            Icon={Icon}
            onAdvancedOptions={() => {}}
          />
          <Input
            label="Lien"
            id="url"
            type="text"
            value={url}
            onChange={setUrl}
            placeholder="[credentialUrl]"
          />
          <Input
            label="Note"
            id="note"
            type="text"
            value={note}
            onChange={setNote}
            placeholder="Entrez une note..."
          />
          <button className="btn btn-primary full-width" type="submit" disabled={loading}>
            Ajouter
          </button>
        </form>
      </div>
    </div>
  );
}; 