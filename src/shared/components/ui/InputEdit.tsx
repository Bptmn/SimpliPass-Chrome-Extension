import React, { useState } from 'react';
import 'shared/styles/input.module.css';

interface InputEditProps {
  label: string;
  initialValue?: string;
  placeholder?: string;
}

const InputEdit: React.FC<InputEditProps> = ({ label, initialValue = '', placeholder = '' }) => {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="input-wrapper">
      <label className="input-label">{label}</label>
      <div className="input-row">
        <input
          type="text"
          className="input-field"
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          style={{ paddingRight: 28 }}
        />
        {value && (
          <button
            type="button"
            className="input-clear-btn"
            aria-label="Effacer"
            onClick={() => setValue('')}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default InputEdit;
