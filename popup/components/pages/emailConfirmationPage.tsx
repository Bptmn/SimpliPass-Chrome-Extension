import React, { useState } from 'react';
import './loginPage.css';

interface EmailConfirmationPageProps {
  email: string;
  onConfirm: (code: string) => void;
  onResend: () => void;
}

export const EmailConfirmationPage: React.FC<EmailConfirmationPageProps> = ({ email, onConfirm, onResend }) => {
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState('');

  const handleInput = (value: string, idx: number) => {
    if (!/^[0-9a-zA-Z]?$/.test(value)) return;
    const newCode = [...code];
    newCode[idx] = value;
    setCode(newCode);
    if (value && idx < 5) {
      const next = document.getElementById(`code-input-${idx + 1}`);
      if (next) (next as HTMLInputElement).focus();
    }
  };

  const handleConfirm = () => {
    if (code.some(c => !c)) {
      setError('Veuillez entrer le code complet.');
      return;
    }
    setError('');
    onConfirm(code.join(''));
  };

  return (
    <div className="loginBackground">
      <div className="loginCard">
        <div className="loginLabel" style={{ marginBottom: 8 }}>Vérifier votre adresse email:</div>
        <div className="loginInput" style={{ marginBottom: 16, fontSize: 13 }}>{email}</div>
        <div className="loginLabel" style={{ marginBottom: 8, fontWeight: 600, fontSize: 15 }}>Entrez le code reçu par email :</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
          {code.map((c, idx) => (
            <input
              key={idx}
              id={`code-input-${idx}`}
              type="text"
              inputMode="text"
              maxLength={1}
              value={c}
              onChange={e => handleInput(e.target.value, idx)}
              style={{ width: 36, height: 36, textAlign: 'center', fontSize: 20, borderRadius: 8, border: '1px solid #d0d0d0', background: 'var(--secondary-background)' }}
            />
          ))}
        </div>
        {error && <div className="errorMessage">{error}</div>}
        <button className="btn btn-primary" style={{ marginBottom: 12 }} onClick={handleConfirm}>Confirmer</button>
        <button className="btn btn-secondary" style={{ background: 'none', border: '1px solid var(--color-secondary)', color: 'var(--color-secondary)' }} onClick={onResend}>Envoyer un nouvel email de confirmation</button>
      </div>
    </div>
  );
}; 