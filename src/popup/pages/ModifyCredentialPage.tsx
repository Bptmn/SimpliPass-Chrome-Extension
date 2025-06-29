import React, { useState } from 'react';
import { CredentialDecrypted } from '../../types/types';
import { updateCredential } from '../../logic/items';
import { checkPasswordStrength } from '../../utils/checkPasswordStrength';
import { passwordGenerator } from '../../utils/passwordGenerator';
import './ModifyCredentialPage.css';
import '../../styles/common.css';
import '../../styles/tokens.css';

interface ModifyCredentialPageProps {
  credential: CredentialDecrypted;
  credentialId: string;
  onSuccess?: () => void;
}

const ModifyCredentialPage: React.FC<ModifyCredentialPageProps> = ({
  credential,
  credentialId,
  onSuccess,
}) => {
  // Local state for form fields
  const [title, setTitle] = useState(credential.title);
  const [username, setUsername] = useState(credential.username);
  const [password, setPassword] = useState(credential.password);
  const [url, setUrl] = useState(credential.url);
  const [note, setNote] = useState(credential.note);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<string>('');

  React.useEffect(() => {
    setPasswordStrength(checkPasswordStrength(password));
  }, [password]);

  const handleGeneratePassword = () => {
    const newPassword = passwordGenerator(true, true, true, true, 16);
    setPassword(newPassword);
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await updateCredential(credentialId, {
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

  return (
    <div className="modify-credential-page">
      <div className="modify-credential-header">
        <button className="modify-credential-back-btn" aria-label="Retour">←</button>
        <h2 className="modify-credential-title">Modifier un identifiant</h2>
      </div>
      {/* Title */}
      <Field label="Nom de l'identifiant" value={title} onChange={setTitle} onClear={() => setTitle('')} />
      {/* Username */}
      <Field label="Email / Nom d'utilisateur :" value={username} onChange={setUsername} onClear={() => setUsername('')} />
      {/* Password */}
      <div className="modify-credential-field">
        <div className="modify-credential-field-header">
          <label className="modify-credential-label">Mot de passe</label>
          <span className="modify-credential-password-strength">
            {passwordStrength} <span>🛡️</span>
          </span>
        </div>
        <div className="modify-credential-input-container">
          <input
            className="modify-credential-input"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button
            className="modify-credential-btn"
            type="button"
            aria-label="Afficher/Masquer le mot de passe"
            onClick={() => setShowPassword(v => !v)}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
          <button
            className="modify-credential-btn"
            type="button"
            aria-label="Effacer"
            onClick={() => setPassword('')}
          >
            ×
          </button>
        </div>
        <button
          className="modify-credential-generate-btn"
          type="button"
          onClick={handleGeneratePassword}
        >
          Générer un mot de passe
        </button>
        <div className="modify-credential-advanced-link">Options avancées (générateur)</div>
      </div>
      {/* URL */}
      <Field label="Lien :" value={url} onChange={setUrl} onClear={() => setUrl('')} />
      {/* Note */}
      <Field label="Note :" value={note} onChange={setNote} onClear={() => setNote('')} />
      {/* Error */}
      {error && <div className="modify-credential-error">{error}</div>}
      {/* Confirm Button */}
      <button
        className="modify-credential-confirm-btn"
        type="button"
        onClick={handleConfirm}
        disabled={loading}
      >
        {loading ? 'Enregistrement...' : 'Confirmer'}
      </button>
    </div>
  );
};

// Reusable field component
interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
}
const Field: React.FC<FieldProps> = ({ label, value, onChange, onClear }) => (
  <div className="modify-credential-field">
    <label className="modify-credential-label">{label}</label>
    <div className="modify-credential-input-container">
      <input
        className="modify-credential-input"
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      {value && (
        <button
          className="modify-credential-btn"
          type="button"
          aria-label="Effacer"
          onClick={onClear}
        >
          ×
        </button>
      )}
    </div>
  </div>
);

export default ModifyCredentialPage; 