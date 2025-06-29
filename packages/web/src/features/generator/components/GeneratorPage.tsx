import React, { useState } from 'react';
import '../../../styles/GeneratorPage.css';

export const GeneratorPage: React.FC = () => {
  const [password, setPassword] = useState('SecurePassword123!');
  const [length, setLength] = useState(16);
  const [hasUppercase, setHasUppercase] = useState(true);
  const [hasNumbers, setHasNumbers] = useState(true);
  const [hasSpecialChars, setHasSpecialChars] = useState(true);

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let charset = chars;
    if (hasUppercase) charset += upperChars;
    if (hasNumbers) charset += numbers;
    if (hasSpecialChars) charset += special;
    
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(result);
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(password);
  };

  return (
    <div className="page-container">
      <div className="generator-content">
        <div className="generator-form">
          <div className="generator-item-spacing page-section">
            <div className="section-label">Mot de passe</div>
            <div className="generated-password-card card">
              <div className="password-display">
                <div className="password-text">{password}</div>
                <button className="btn-copy" onClick={copyPassword}>
                  📋
                </button>
              </div>
              <div className="strength-label strength-strong">
                Sécurité : forte
              </div>
            </div>
          </div>

          <div className="generator-item-spacing page-section">
            <label className="section-label">Longueur : {length}</label>
            <div className="slider-section card">
              <input
                type="range"
                min={8}
                max={32}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
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
                    checked={hasSpecialChars}
                    onChange={(e) => setHasSpecialChars(e.target.checked)}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="page-section">
            <button className="btn btn-primary regenerate-btn" onClick={generatePassword}>
              🔄 Générer à nouveau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};