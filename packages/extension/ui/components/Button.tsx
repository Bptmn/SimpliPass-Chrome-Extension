/**
 * Button.tsx (Extension / DOM)
 *
 * Purpose: Small, typed, DOM-only button for the extension UI.
 * - Keeps UI layer independent from React Native Web.
 */

import React from 'react';
import { colors, radius, spacing, typography } from '../design/tokens';

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
  borderRadius: radius.sm,
  padding: `${spacing.sm}px ${spacing.md}px`,
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.bold,
  fontFamily: typography.fontFamily.base,
  cursor: 'pointer',
  transition: 'opacity 0.2s',
};

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: { backgroundColor: colors.primary, color: colors.white },
  secondary: { backgroundColor: colors.secondary, color: colors.white },
  danger: { backgroundColor: colors.error, color: colors.white },
  ghost: { backgroundColor: 'transparent', color: colors.primary, border: `1px solid ${colors.borderColor}` },
};

export default Button;


