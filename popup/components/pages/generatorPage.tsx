import React, { useState, useEffect } from 'react';
import { passwordGenerator } from '../../../utils/passwordGenerator';
import { checkPasswordStrength } from '../../../utils/checkPasswordStrength';
import './generatorPage.css';

export const GeneratorPage: React.FC = () => {
  const [hasUppercase, setHasUppercase] = useState(true);
  const [hasNumbers, setHasNumbers] = useState(true);
  const [hasLowercase] = useState(true); // Always true as in Flutter code
  const [hasSpecialCharacters, setHasSpecialCharacters] = useState(true);
  const [passwordWidth, setPasswordWidth] = useState(12);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'average' | 'strong' | 'perfect'>('weak');
  const [toast, setToast] = useState('');

  // Generate password and check strength on mount and whenever options change
  useEffect(() => {
    const pwd = passwordGenerator(
      hasNumbers,
      hasUppercase,
      hasLowercase,
      hasSpecialCharacters,
      passwordWidth
    );
    setGeneratedPassword(pwd);
    setPasswordStrength(checkPasswordStrength(pwd));
  }, [hasNumbers, hasUppercase, hasLowercase, hasSpecialCharacters, passwordWidth]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedPassword);
    setToast('Mot de passe copié');
    setTimeout(() => setToast(''), 2000);
  };

  const handleRegenerate = () => {
    const pwd = passwordGenerator(
      hasNumbers,
      hasUppercase,
      hasLowercase,
      hasSpecialCharacters,
      passwordWidth
    );
    setGeneratedPassword(pwd);
    setPasswordStrength(checkPasswordStrength(pwd));
  };

  return (
    <div className="generator-page">
      <h2>Générateur de mots de passe</h2>
      <div className="generated-password-card">
        <div className="password-label">Mot de passe</div>
        <div className="password-text">{generatedPassword}</div>
        <div className="strength-label strength-{passwordStrength}">
          Sécurité : {passwordStrength === 'weak' ? 'faible' : passwordStrength === 'average' ? 'moyenne' : passwordStrength === 'perfect' ? 'parfaite !' : 'forte'}
        </div>
        <button className="copy-btn" onClick={handleCopy} aria-label="Copier le mot de passe">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          <span>Copier</span>
        </button>
      </div>
      <div className="slider-section">
        <label htmlFor="password-length">Longueur : {passwordWidth}</label>
        <input
          id="password-length"
          type="range"
          min={5}
          max={25}
          value={passwordWidth}
          onChange={e => setPasswordWidth(Number(e.target.value))}
        />
      </div>
      <div className="options-section">
        <div className="option-row">
          <span>Lettres majuscules (A-Z)</span>
          <input type="checkbox" checked={hasUppercase} onChange={e => setHasUppercase(e.target.checked)} />
        </div>
        <div className="option-row">
          <span>Chiffres (0-9)</span>
          <input type="checkbox" checked={hasNumbers} onChange={e => setHasNumbers(e.target.checked)} />
        </div>
        <div className="option-row">
          <span>Symboles (@!&*)</span>
          <input type="checkbox" checked={hasSpecialCharacters} onChange={e => setHasSpecialCharacters(e.target.checked)} />
        </div>
      </div>
      <button className="regenerate-btn" onClick={handleRegenerate}>
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M23 4v6h-6" />
          <path d="M1 20v-6h6" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
        Générer à nouveau
      </button>
      {toast && <div className="toast show">{toast}</div>}
    </div>
  );
}; 