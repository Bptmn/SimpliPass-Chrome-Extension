/**
 * ColorSelector.tsx (Extension / DOM)
 *
 * Purpose: Color picker component for selecting colors
 */

import React, { useState } from 'react';
import { colors, spacing, typography } from '../design/tokens';

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
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  title: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.base,
  },
  colorRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  colorCircle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    height: 35,
    width: 35,
    border: 'none',
    cursor: 'pointer',
    outline: 'none',
    transition: 'transform 0.1s',
  },
  checkMark: {
    color: colors.whiteText,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.base,
  },
};

export default ColorSelector;
