/**
 * Button.tsx (Extension / DOM)
 *
 * Purpose: Small, typed, DOM-only button for the extension UI.
 * - Keeps UI layer independent from React Native Web.
 */

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  style,
  ...rest
}) => {
  return (
    <button
      {...rest}
      style={{
        ...baseStyle,
        ...variantStyles[variant],
        width: fullWidth ? '100%' : undefined,
        ...(style as React.CSSProperties),
      }}
    >
      {children}
    </button>
  );
};

const baseStyle: React.CSSProperties = {
  appearance: 'none',
  border: 'none',
  borderRadius: 8,
  padding: '10px 14px',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: { background: '#2D6CDF', color: '#FFFFFF' },
  secondary: { background: '#EEF2FF', color: '#1E3A8A' },
  danger: { background: '#DC2626', color: '#FFFFFF' },
  ghost: { background: 'transparent', color: '#1F2937', border: '1px solid #D1D5DB' },
};

export default Button;


