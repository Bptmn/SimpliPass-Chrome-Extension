import React, { useState } from 'react';
import { CredentialDecrypted } from '../../types/types';
import { updateCredential } from '../../logic/items';
import { checkPasswordStrength } from '../../utils/checkPasswordStrength';
import { passwordGenerator } from '../../utils/passwordGenerator';

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
    <div className="flex flex-col items-center px-4 py-6 w-full max-w-md mx-auto">
      <div className="flex items-center w-full mb-6">
        <button className="mr-2 text-2xl text-blue-400" aria-label="Retour">←</button>
        <h2 className="text-2xl font-semibold text-blue-600 flex-1 text-center">Modifier un identifiant</h2>
      </div>
      {/* Title */}
      <Field label="Nom de l'identifiant" value={title} onChange={setTitle} onClear={() => setTitle('')} />
      {/* Username */}
      <Field label="Email / Nom d'utilisateur :" value={username} onChange={setUsername} onClear={() => setUsername('')} />
      {/* Password */}
      <div className="w-full mb-4">
        <div className="flex justify-between items-center mb-1">
          <label className="text-gray-600 font-medium">Mot de passe</label>
          <span className="text-green-500 flex items-center gap-1 text-sm">
            {passwordStrength} <span className="inline-block">🛡️</span>
          </span>
        </div>
        <div className="relative flex items-center bg-gray-100 rounded-xl px-4 py-3 mb-1">
          <input
            className="flex-1 bg-transparent outline-none text-blue-700 text-base font-medium"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button
            className="ml-2 text-gray-400 hover:text-gray-600"
            type="button"
            aria-label="Afficher/Masquer le mot de passe"
            onClick={() => setShowPassword(v => !v)}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
          <button
            className="ml-2 text-gray-400 hover:text-gray-600"
            type="button"
            aria-label="Effacer"
            onClick={() => setPassword('')}
          >
            ×
          </button>
        </div>
        <button
          className="w-full bg-blue-500 text-white rounded-full py-2 font-semibold shadow mb-1 mt-2"
          type="button"
          onClick={handleGeneratePassword}
        >
          Générer un mot de passe
        </button>
        <div className="text-center text-blue-500 text-sm cursor-pointer mb-2">Options avancées (générateur)</div>
      </div>
      {/* URL */}
      <Field label="Lien :" value={url} onChange={setUrl} onClear={() => setUrl('')} />
      {/* Note */}
      <Field label="Note :" value={note} onChange={setNote} onClear={() => setNote('')} />
      {/* Error */}
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      {/* Confirm Button */}
      <button
        className="w-full bg-teal-500 text-white rounded-full py-3 font-semibold text-lg mt-4 shadow disabled:opacity-60"
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
  <div className="w-full mb-4">
    <label className="text-gray-600 font-medium mb-1 block">{label}</label>
    <div className="flex items-center bg-gray-100 rounded-xl px-4 py-3">
      <input
        className="flex-1 bg-transparent outline-none text-blue-700 text-base font-medium"
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      {value && (
        <button
          className="ml-2 text-gray-400 hover:text-gray-600"
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