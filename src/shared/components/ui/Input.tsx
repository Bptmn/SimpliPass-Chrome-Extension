// Input Component - Reusable form input with password toggle and validation support
import React, { useState } from 'react';
import 'shared/styles/input.module.css';

interface InputProps {
  label: string;
  password?: boolean;
  initialValue?: string;
  placeholder?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  password = false,
  initialValue = '',
  placeholder = '',
}) => {
  // === HOOKS: State Management ===
  const [value, setValue] = useState(initialValue);
  const [show, setShow] = useState(false);

  // === RENDERING ===
  return (
    <div className="input-wrapper">
      {/* === SECTION: Label === */}
      <label className="input-label">{label}</label>

      <div className="input-row">
        {/* === SECTION: Input Field === */}
        <input
          type={password && !show ? 'password' : 'text'}
          className="input-field"
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
        />

        {/* === SECTION: Password Toggle Button === */}
        {password && (
          <button
            type="button"
            className="input-eye-btn"
            aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            onClick={() => setShow((s) => !s)}
          >
            {/* === SECTION: Toggle Icons === */}
            {show ? (
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                <path
                  d="M1.5 10S4.5 4.5 10 4.5 18.5 10 18.5 10 15.5 15.5 10 15.5 1.5 10 1.5 10Z"
                  stroke="#74787a"
                  strokeWidth="2"
                />
                <circle cx="10" cy="10" r="3" stroke="#74787a" strokeWidth="2" />
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                <path
                  d="M1.5 10S4.5 4.5 10 4.5 18.5 10 18.5 10 15.5 15.5 10 15.5 1.5 10 1.5 10Z"
                  stroke="#74787a"
                  strokeWidth="2"
                />
                <path d="M4 4l12 12" stroke="#74787a" strokeWidth="2" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;
