/**
 * InputEdit.tsx (Extension / DOM)
 *
 * Purpose: Editable input field with label and optional clear button
 */

import React, { useState } from 'react';
import { colors, spacing, radius, textStyles, cardStyles } from '../design';
import { Icon } from './Icon';

interface InputEditProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  onClear?: () => void;
  testID?: string;
  isNote?: boolean;
}

export const InputEdit: React.FC<InputEditProps> = ({
  value,
  onChange,
  label,
  placeholder,
  onClear,
  testID,
  isNote = false,
}) => {
  const [inputHeight, setInputHeight] = useState(isNote ? 72 : 48);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  const InputComponent = isNote ? 'textarea' : 'input';
  const inputProps = {
    value,
    onChange: handleInputChange,
    placeholder,
    style: {
      ...styles.input,
      height: isNote ? inputHeight : 'auto',
    },
    'data-testid': testID,
  };

  return (
    <div style={styles.container} data-testid={testID}>
      <div style={styles.label}>{label}</div>
      <div style={styles.inputRow}>
        {React.createElement(InputComponent, {
          ...inputProps,
          ...(isNote ? { rows: 3 } : { type: 'text' }),
        })}
        {value && onClear && (
          <button
            style={styles.clearButton}
            onClick={handleClear}
            aria-label="Clear input"
            data-testid={`${testID}-clear`}
          >
            <Icon name="close" size={16} color={colors.tertiary} />
          </button>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  ...textStyles,
  ...cardStyles,
  container: {
    ...cardStyles.card,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: radius.md + 4,
    padding: spacing.sm,
  },
  label: {
    ...textStyles.labelSmall,
    marginBottom: spacing.xxs,
  },
  inputRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    ...textStyles.input,
    backgroundColor: 'transparent',
    border: 'none',
    width: '100%',
    outline: 'none',
    resize: 'vertical' as const,
  },
  clearButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
};

export default InputEdit;
