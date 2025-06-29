import React, { useState, useEffect } from 'react';

import { checkPasswordStrength } from 'utils/checkPasswordStrength';
import { passwordGenerator } from 'utils/passwordGenerator';
import '../styles/GeneratorPage.css';
import '../../styles/common.css';
import '../../styles/tokens.css';
import { useToast } from '../components/Toast';

export const GeneratorPage: React.FC = () => {
  const [hasUppercase, setHasUppercase] = useState(true);
  const [hasNumbers, setHasNumbers] = useState(true);
  const [hasLowercase] = useState(true); // Always true as in Flutter code
  const [hasSpecialCharacters, setHasSpecialCharacters] = useState(true);
  const [passwordWidth, setPasswordWidth] = useState(12);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<
    'weak' | 'average' | 'strong' | 'perfect'
  >('weak');
  const { showToast } = useToast();

  // Generate password and check strength on mount and whenever options change
  useEffect(() => {
    const pwd = passwordGenerator(
      hasNumbers,
      hasUppercase,
      hasLowercase,
      hasSpecialCharacters,
      passwordWidth,
    );
    setGeneratedPassword(pwd);
    setPasswordStrength(checkPasswordStrength(pwd));
  }, [hasNumbers, hasUppercase, hasLowercase, hasSpecialCharacters, passwordWidth]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedPassword);
    showToast('Mot de passe copié !');
  };

  const handleRegenerate = () => {
    const pwd = passwordGenerator(
      hasNumbers,
      hasUppercase,
      hasLowercase,
      hasSpecialCharacters,
      passwordWidth,
    );
    setGeneratedPassword(pwd);
    setPasswordStrength(checkPasswordStrength(pwd));
  };

  return (
    <div className="page-container">
      <div className="generator-content">
        <div className="generator-form">
          <div className="generator-item-spacing page-section">
            <div className="section-label">Mot de passe</div>
            <div className="generated-password-card card">
              <div className="password-display">
                <div className="password-text">{generatedPassword}</div>
                <button
                  className="btn-copy"
                  title="Copy password"
                  onClick={handleCopy}
                  aria-label="Copy password for this credential"
                >
                  <div className="btn-copy-container">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      width="22"
                      height="22"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>copier</span>
                  </div>
                </button>
              </div>
              <div className={`strength-label strength-${passwordStrength}`}>
                Sécurité :{' '}
                {passwordStrength === 'weak'
                  ? 'faible'
                  : passwordStrength === 'average'
                    ? 'moyenne'
                    : passwordStrength === 'perfect'
                      ? 'parfaite !'
                      : 'forte'}
              </div>
            </div>
          </div>

          <div className="generator-item-spacing page-section">
            <label className="section-label">Longueur : {passwordWidth}</label>
            <div className="slider-section card">
              <input
                id="password-length"
                type="range"
                min={5}
                max={25}
                value={passwordWidth}
                onChange={(e) => setPasswordWidth(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="generator-item-spacing page-section">
            <div className="section-label">Options</div>
            <div className="options-section card">
              <div className="option-row">
                <span>Lettres majuscules (A-Z)</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={hasUppercase}
                    onChange={(e) => setHasUppercase(e.target.checked)}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>
              <div className="option-row">
                <span>Chiffres (0-9)</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={hasNumbers}
                    onChange={(e) => setHasNumbers(e.target.checked)}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>
              <div className="option-row">
                <span>Symboles (@!&*)</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={hasSpecialCharacters}
                    onChange={(e) => setHasSpecialCharacters(e.target.checked)}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="page-section">
            <button className="btn btn-primary regenerate-btn" onClick={handleRegenerate}>
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M23 4v6h-6" />
                <path d="M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Générer à nouveau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
