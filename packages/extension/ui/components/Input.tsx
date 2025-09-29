/**
 * Input.tsx (Extension / DOM)
 *
 * Purpose: Typed text input with minimal styles.
 */

import React from 'react';

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
  borderRadius: 8,
  border: '1px solid #D1D5DB',
  padding: '10px 12px',
  fontSize: 14,
  outline: 'none',
};

export default Input;


