/**
 * InputFields.tsx (Extension / DOM)
 *
 * Purpose: Comprehensive input field components with labels, validation, and password visibility
 */

import React, { useState } from 'react';
import { colors, spacing, radius, typography, formStyles, textStyles } from '../design';
import { Icon } from './Icon';

// --- Input classique ---
interface InputProps {
  label: string;
  _id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'note';
  _autoComplete?: string;
  _required?: boolean;
  error?: string;
  disabled?: boolean;
  onBlur?: () => void;
}

export const FormInput: React.FC<InputProps> = ({
  label,
  _id,
  value,
  onChange,
  placeholder,
  type = 'text',
  _autoComplete,
  _required = false,
  error,
  disabled = false,
  onBlur,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div style={styles.inputContainer}>
      <label style={styles.inputLabel} htmlFor={_id}>
        {label}
      </label>
      <div style={styles.inputWrapper}>
        <input
          id={_id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={_autoComplete}
          required={_required}
          disabled={disabled}
          onBlur={onBlur}
          style={{
            ...styles.inputField,
            ...(disabled ? styles.inputFieldDisabled : {}),
            ...(error ? styles.inputFieldError : {}),
            ...(isPassword ? styles.inputFieldWithIcon : {}),
          }}
        />
        {isPassword && (
          <button
            type="button"
            style={styles.passwordToggle}
            onClick={togglePasswordVisibility}
            data-testid={`${_id}-password-toggle`}
          >
            <Icon 
              name={showPassword ? 'visibilityOff' : 'visibility'} 
              size={20} 
              color={colors.tertiary} 
            />
          </button>
        )}
      </div>
      {error && (
        <div style={styles.inputError} data-testid={`${_id}-error`}>
          {error}
        </div>
      )}
    </div>
  );
};

// --- TextArea ---
interface TextAreaProps {
  label: string;
  _id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  _required?: boolean;
  error?: string;
  disabled?: boolean;
  onBlur?: () => void;
  rows?: number;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  _id,
  value,
  onChange,
  placeholder,
  _required = false,
  error,
  disabled = false,
  onBlur,
  rows = 4,
}) => {
  return (
    <div style={styles.inputContainer}>
      <label style={styles.inputLabel} htmlFor={_id}>
        {label}
      </label>
      <textarea
        id={_id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={_required}
        disabled={disabled}
        onBlur={onBlur}
        rows={rows}
        style={{
          ...styles.textAreaField,
          ...(disabled ? styles.inputFieldDisabled : {}),
          ...(error ? styles.inputFieldError : {}),
        }}
      />
      {error && (
        <div style={styles.inputError} data-testid={`${_id}-error`}>
          {error}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  ...formStyles,
  ...textStyles,
  inputContainer: {
    ...formStyles.formField,
    width: '100%',
  },
  inputLabel: {
    ...textStyles.label,
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputField: {
    backgroundColor: colors.secondaryBackground,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: radius.xl,
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.base,
    padding: `${spacing.md}px`,
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  inputFieldWithIcon: {
    paddingRight: 40, // Space for password toggle icon
  },
  inputFieldDisabled: {
    backgroundColor: colors.disabled,
    color: colors.tertiary,
    cursor: 'not-allowed',
  },
  inputFieldError: {
    borderColor: colors.error,
  },
  textAreaField: {
    backgroundColor: colors.secondaryBackground,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: radius.xl,
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.base,
    padding: `${spacing.md}px`,
    width: '100%',
    outline: 'none',
    resize: 'vertical',
    minHeight: 80,
    transition: 'border-color 0.2s',
  },
  passwordToggle: {
    position: 'absolute',
    right: spacing.sm,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  inputError: {
    ...textStyles.error,
  },
};

export default FormInput;
