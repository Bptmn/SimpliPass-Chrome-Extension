import React, { useState } from 'react';
import './generatorPage.css';

export const GeneratorPage: React.FC = () => {
  const [length, setLength] = useState(12);
  const [uppercase, setUppercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState('GeneratedPassword123');
  const [strength, setStrength] = useState('Strong');

  // Dummy regenerate handler
  const regenerate = () => {
    setPassword('GeneratedPassword' + Math.floor(Math.random() * 1000));
    setStrength('Strong');
  };

  return (
    <div className="generator-page">
      <div className="header-bar">
        <button className="btn back-btn">←</button>
        <h1>Générateur de mot de passe</h1>
        <div className="spacer"></div>
      </div>
      <div className="generated-password-card card">
        <div className="password-text">{password}</div>
        <div className="strength-label">{strength}</div>
        <button className="btn copy-btn">Copy</button>
      </div>
      <div className="length-slider">
        <label>Longueur : <span id="length-value">{length}</span></label>
        <input
          type="range"
          min={8}
          max={32}
          value={length}
          onChange={e => setLength(Number(e.target.value))}
          id="length-slider"
        />
      </div>
      <div className="options-card card">
        <div className="option-row">
          <label>Uppercase</label>
          <input type="checkbox" checked={uppercase} onChange={e => setUppercase(e.target.checked)} />
        </div>
        <div className="option-row">
          <label>Numbers</label>
          <input type="checkbox" checked={numbers} onChange={e => setNumbers(e.target.checked)} />
        </div>
        <div className="option-row">
          <label>Symbols</label>
          <input type="checkbox" checked={symbols} onChange={e => setSymbols(e.target.checked)} />
        </div>
      </div>
      <button className="btn regenerate-btn" onClick={regenerate}>Regenerate</button>
    </div>
  );
}; 