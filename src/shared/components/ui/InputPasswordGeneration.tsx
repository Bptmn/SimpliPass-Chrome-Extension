import React, { useState } from 'react';
import { checkPasswordStrength } from 'shared/utils/checkPasswordStrength';
import { Icon } from '../ui/Icon';
import 'shared/styles/input.module.css';

interface InputPasswordGenerationProps {
  label: string;
  initialValue?: string;
  placeholder?: string;
}

const strengthColorMap = {
  weak: '#e57373',
  average: '#ffb300',
  strong: 'var(--color-primary)',
  perfect: 'var(--color-secondary)',
};

const InputPasswordGeneration: React.FC<InputPasswordGenerationProps> = ({
  label,
  initialValue = '',
  placeholder = '',
}) => {
  const [value, setValue] = useState(initialValue);
  const [strength, setStrength] = useState(checkPasswordStrength(initialValue));

  const handleGenerate = () => {
    // Simple random password for demo; replace with your generator
    const newPass = Math.random().toString(36).slice(-12);
    setValue(newPass);
    setStrength(checkPasswordStrength(newPass));
  };

  return (
    <div className="input-wrapper">
      <div className="input-label-row">
        <label className="input-label">{label}</label>
        <div
          className="input-strength"
          style={{ color: strengthColorMap[strength] || 'var(--color-primary)' }}
        >
          Sécurité{' '}
          {strength === 'weak'
            ? 'faible'
            : strength === 'average'
              ? 'moyenne'
              : strength === 'perfect'
                ? 'parfaite !'
                : 'forte'}
          <Icon
            name="security"
            size={16}
            color={strengthColorMap[strength] || 'var(--color-primary)'}
          />
        </div>
      </div>
      <input
        type="text"
        className="input-field"
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          setValue(e.target.value);
          setStrength(checkPasswordStrength(e.target.value));
        }}
      />
      <div className="input-actions">
        <button type="button" className="btn btn-secondary" onClick={handleGenerate}>
          Générer un mot de passe
        </button>
        <div style={{ display: 'none' }}>Options avancées (générateur)</div>
      </div>
    </div>
  );
};

export default InputPasswordGeneration;
