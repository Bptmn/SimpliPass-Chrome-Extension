import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from 'shared/hooks/useUser';
import { passwordGenerator } from 'shared/utils/passwordGenerator';
import { createCredential } from 'features/credentials/services/items';
import { getUserSecretKey } from 'features/auth/services/user';
import { CredentialDecrypted } from 'shared/types/types';
import { ErrorBanner } from 'shared/components/ui/ErrorBanner';
import { Icon } from 'shared/components/ui/Icon';
import Toast, { useToast } from 'shared/components/ui/Toast';
import 'shared/styles/HomePage.css';
import 'shared/styles/AddCredentialPage.css';
import { generateItemKey } from 'shared/utils/crypto';
import { LazyCredentialIcon } from 'shared/components/domain/LazyCredentialIcon';
import { checkPasswordStrength } from 'shared/utils/checkPasswordStrength';
import { DocumentReference } from 'firebase/firestore';
import Input from 'shared/components/ui/Input';
import InputPasswordGeneration from 'shared/components/ui/InputPasswordGeneration';

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
  const [passwordStrength, setPasswordStrength] = useState<
    'weak' | 'average' | 'strong' | 'perfect'
  >('weak');

  const strengthColorMap = {
    weak: '#e57373',
    average: '#ffb300',
    strong: 'var(--color-primary)',
    perfect: 'var(--color-secondary)',
  };
  const iconColor = strengthColorMap[passwordStrength];

  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(password));
  }, [password]);

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
        document_reference: {} as DocumentReference,
      };
      await createCredential(cred);
      showToast('Identifiant ajouté avec succès');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        navigate('/');
      }, 1200);
    } catch (e: any) {
      setError(e.message || "Erreur lors de l'ajout de l'identifiant.");
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
            <Input
              label="Nom de l'identifiant"
              initialValue={title}
              placeholder="[credentialsTitle]"
            />
          </div>
          <div className="form-section">
            <Input
              label="Email / Nom d'utilisateur"
              initialValue={username}
              placeholder="[userEmail]"
            />
          </div>
          <div className="form-section">
            <InputPasswordGeneration
              label="Mot de passe"
              initialValue={password}
              placeholder="Entrez un mot de passe..."
            />
          </div>
          <div className="form-section">
            <Input label="Lien (optionnel)" initialValue={url} placeholder="[credentialUrl]" />
          </div>
          <div className="form-section">
            <Input label="Note (optionnel)" initialValue={note} placeholder="Entrez une note..." />
          </div>
          <button className="btn btn-primary full-width" type="submit" disabled={loading}>
            Ajouter
          </button>
        </form>
      </div>
    </div>
  );
};
