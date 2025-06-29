import React, { useState } from 'react';
import '../styles/EmailConfirmationPage.css';
import '../../styles/common.css';
import '../../styles/tokens.css';
import { useNavigate } from 'react-router-dom';

interface EmailConfirmationPageProps {
  email: string;
  onConfirm: (code: string) => void;
  onResend: () => void;
}

export const EmailConfirmationPage: React.FC<EmailConfirmationPageProps> = ({
  email,
  onConfirm,
  onResend,
}) => {
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const navigate = useNavigate();
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
    if (code.some((c) => !c)) {
      setError('Veuillez entrer le code complet.');
      return;
    }
    setError('');
    onConfirm(code.join(''));
  };

  return (
    <div className="page-container">
      <div className="page-content" style={{ gap: '30px' }}>
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
          <div className="details-title">Vérification d'email</div>
        </div>
        <div className="email-confirm-container">
          <div className="email-confirm-label">Vérifier votre adresse email: </div>
          <div className="email-confirm-email">{email}</div>
        </div>
        <div className="email-confirm-code-box">
          <div className="email-confirm-code-label">Entrez le code reçu par email :</div>
          <div className="email-confirm-code-inputs">
            {code.map((c, idx) => (
              <input
                key={idx}
                id={`code-input-${idx}`}
                type="text"
                inputMode="text"
                maxLength={1}
                value={c}
                onChange={(e) => handleInput(e.target.value, idx)}
              />
            ))}
          </div>
        </div>
        {error && <div className="errorMessage">{error}</div>}
        <button className="btn email-confirm-btn" onClick={handleConfirm}>
          Confirmer
        </button>
        <button
          className="email-confirm-btn-outline"
          onClick={onResend}
        >
          Envoyer un nouvel email de confirmation
        </button>
      </div>
    </div>
  );
};
