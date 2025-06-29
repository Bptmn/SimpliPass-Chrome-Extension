import React from 'react';
import { IconKey } from 'utils/icon';
import '../../styles/common.css';
import '../../styles/tokens.css';
import '../styles/InputVariant.css';

// --- Input classique ---
export interface InputProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  id,
  value,
  onChange,
  placeholder,
  type = 'text',
  autoComplete,
  required = false,
  error,
  disabled = false,
}) => (
  <div className="form-section">
    <label className="input-label" htmlFor={id}>{label}</label>
    <input
      id={id}
      type={type}
      className="input loginInputWrapper"
      placeholder={placeholder}
      autoComplete={autoComplete}
      value={value}
      onChange={e => onChange(e.target.value)}
      required={required}
      disabled={disabled}
    />
    {error && <div className="input-error-message">{error}</div>}
  </div>
);

// --- InputPasswordGenerator ---
export interface InputPasswordGeneratorProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  placeholder?: string;
  required?: boolean;
  passwordStrength?: string;
  onAdvancedOptions?: () => void;
  Icon?: React.ComponentType<{ name: IconKey; size?: number; color?: string }>;
  error?: string;
}

export const InputPasswordGenerator: React.FC<InputPasswordGeneratorProps> = ({
  label,
  id,
  value,
  onChange,
  onGenerate,
  placeholder = 'Entrez un mot de passe...',
  required = false,
  passwordStrength,
  onAdvancedOptions,
  Icon,
  error,
}) => (
  <div className="form-section">
    <div className="password-strength-container">
    <label className="input-label" htmlFor={id}>{label}</label>
    {passwordStrength && (
        <div className="password-strength">
          {passwordStrength} {Icon && <Icon name="security" size={18} color="var(--color-success)" />}
        </div>
      )}
      </div>
    <input
      id={id}
      type="text"
      className="input"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      required={required}
    />
    {error && <div className="input-error-message">{error}</div>}
    <div className="flex-end">
      <button type="button" className="btn btn-secondary" onClick={onGenerate}>
        Générer un mot de passe
      </button>
    </div>
  </div>
); 