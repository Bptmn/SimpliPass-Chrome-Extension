/**
 * Input.tsx (Extension / DOM)
 *
 * Purpose: Typed text input with minimal styles.
 */

import React from 'react';
import { colors, radius, spacing, typography } from '../design/tokens';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  fullWidth?: boolean;
};

export const Input: React.FC<InputProps> = ({ fullWidth = false, style, ...rest }) => {
  return (
    <input
      {...rest}
      style={{
        ...baseStyle,
        width: fullWidth ? '100%' : undefined,
        ...(style as React.CSSProperties),
      }}
    />
  );
};

const baseStyle: React.CSSProperties = {
  appearance: 'none',
  borderRadius: radius.sm,
  border: `1px solid ${colors.borderColor}`,
  padding: `${spacing.sm}px ${spacing.md}px`,
  fontSize: typography.fontSize.sm,
  fontFamily: typography.fontFamily.base,
  outline: 'none',
  backgroundColor: colors.primaryBackground,
  color: colors.blackText,
  transition: 'border-color 0.2s',
};

export default Input;


