/**
 * ColorSelector.tsx (Extension / DOM)
 *
 * Purpose: Color picker component for selecting colors
 */

import React, { useState } from 'react';
import { colors, spacing, cardStyles, textStyles } from '../design';

interface ColorSelectorProps {
  title: string;
  colorsList?: string[];
  value?: string;
  onChange?: (color: string) => void;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  title,
  colorsList,
  value,
  onChange,
}) => {
  const DEFAULT_COLORS = [
    colors.secondary, 
    colors.primary, 
    colors.tertiary, 
    '#c44545', 
    '#b6d43a', 
    '#a259e6'
  ];
  const colorOptions = colorsList || DEFAULT_COLORS;
  const [selected, setSelected] = useState<string>(value || colorOptions[0] || colors.primary);
  
  const handleSelect = (c: string) => {
    setSelected(c);
    onChange?.(c);
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>{title}</div>
      <div style={styles.colorRow}>
        {colorOptions.map((color) => (
          <button
            key={color}
            style={{
              ...styles.colorCircle,
              backgroundColor: color,
            }}
            onClick={() => handleSelect(color)}
            data-testid={`color-selector-${color}`}
            aria-label={`Select color ${color}`}
            type="button"
          >
            {selected === color && (
              <span style={styles.checkMark}>✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  ...cardStyles,
  ...textStyles,
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  title: {
    ...textStyles.label,
  },
  colorRow: {
    ...cardStyles.colorRow,
    alignItems: 'center',
    gap: spacing.sm,
  },
  colorCircle: {
    ...cardStyles.colorCircle,
    border: 'none',
    cursor: 'pointer',
    outline: 'none',
    transition: 'transform 0.1s',
  },
  checkMark: {
    ...cardStyles.checkMark,
  },
};

export default ColorSelector;
