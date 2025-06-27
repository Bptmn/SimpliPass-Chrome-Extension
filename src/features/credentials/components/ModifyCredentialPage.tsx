import React, { useState, useEffect } from 'react';
import { CredentialDecrypted } from 'shared/types/types';
import { updateCredential } from 'features/credentials/services/items';
import { checkPasswordStrength } from 'shared/utils/checkPasswordStrength';
import { passwordGenerator } from 'shared/utils/passwordGenerator';
import 'shared/styles/ModifyCredentialPage.css';
import { Icon } from 'shared/components/ui/Icon';
import { useNavigate } from 'react-router-dom';
import InputEdit from 'shared/components/ui/InputEdit';
import InputPasswordGeneration from 'shared/components/ui/InputPasswordGeneration';

interface ModifyCredentialPageProps {
  credential: CredentialDecrypted;
  onSuccess?: () => void;
}

const ModifyCredentialPage: React.FC<ModifyCredentialPageProps> = ({ credential, onSuccess }) => {
  const [title, setTitle] = useState(credential.title);
  const navigate = useNavigate();
  const [username, setUsername] = useState(credential.username);
  const [password, setPassword] = useState(credential.password);
  const [url, setUrl] = useState(credential.url);
  const [note, setNote] = useState(credential.note);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState('');

  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(password));
  }, [password]);

  const handleGeneratePassword = () => {
    setPassword(passwordGenerator(true, true, true, true, 16));
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await updateCredential({
        ...credential,
        title,
        username,
        password,
        url,
        note,
      });
      if (onSuccess) onSuccess();
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const strengthColorMap = {
    weak: '#e57373',
    average: '#ffb300',
    strong: 'var(--color-primary)',
    perfect: 'var(--color-secondary)',
  };
  const iconColor =
    strengthColorMap[passwordStrength as keyof typeof strengthColorMap] || 'var(--color-primary)';

  return (
    <div className="page-container">
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
          <div className="details-title">Modifier un identifiant</div>
        </div>
        <form className="form-container" onSubmit={handleConfirm}>
          {/* Title */}
          <div className="card edit-card">
            <InputEdit
              label="Nom de l'identifiant"
              initialValue={title}
              placeholder="Nom de l'identifiant"
            />
          </div>
          {/* Username */}
          <div className="card edit-card">
            <InputEdit
              label="Email / Nom d'utilisateur"
              initialValue={username}
              placeholder="Email / Nom d'utilisateur"
            />
          </div>
          {/* Password */}
          <div className="card edit-card">
            <InputPasswordGeneration
              label="Mot de passe"
              initialValue={password}
              placeholder="Entrez un mot de passe..."
            />
          </div>
          {/* URL */}
          <div className="card edit-card">
            <InputEdit label="Lien (optionnel)" initialValue={url} placeholder="Lien (optionnel)" />
          </div>
          {/* Note */}
          <div className="card edit-card">
            <InputEdit
              label="Note (optionnel)"
              initialValue={note}
              placeholder="Note (optionnel)"
            />
          </div>
          {error && <div className="errorMessage">{error}</div>}
          <button className="btn btn-primary full-width" type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Confirmer'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModifyCredentialPage;
