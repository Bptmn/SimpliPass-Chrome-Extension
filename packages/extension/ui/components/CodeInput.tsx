/**
 * CodeInput.tsx (Extension / DOM)
 *
 * Purpose: OTP/verification code input with individual digit boxes
 */

import React, { useRef } from 'react';
import { colors, spacing, radius, typography } from '../design/tokens';

interface CodeInputProps {
  value: string;
  length?: number;
  onChange: (code: string) => void;
}

export const CodeInput: React.FC<CodeInputProps> = ({ value, length = 6, onChange }) => {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (text: string, idx: number) => {
    let newValue = value.split('');
    if (text.length > 1) {
      // Handle paste
      newValue = text.split('').slice(0, length);
      onChange(newValue.join(''));
      if (inputs.current[newValue.length - 1]) {
        inputs.current[newValue.length - 1]?.focus();
      }
      return;
    }
    if (text) {
      newValue[idx] = text;
      onChange(newValue.join('').slice(0, length));
      if (idx < length - 1) {
        inputs.current[idx + 1]?.focus();
      }
    } else {
      newValue[idx] = '';
      onChange(newValue.join(''));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace' && !value[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  return (
    <div style={styles.container}>
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={ref => (inputs.current[idx] = ref)}
          style={styles.box}
          value={value[idx] || ''}
          onChange={(e) => handleChange(e.target.value, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          data-testid={`code-input-${idx}`}
        />
      ))}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.md,
    width: '80%',
  },
  box: {
    backgroundColor: colors.primaryBackground,
    border: `2px solid ${colors.borderColor}`,
    borderRadius: radius.md,
    color: colors.blackText,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.base,
    height: spacing.lg * 2,
    textAlign: 'center',
    width: spacing.lg * 2,
    outline: 'none',
    transition: 'border-color 0.2s',
  },
};

export default CodeInput;
