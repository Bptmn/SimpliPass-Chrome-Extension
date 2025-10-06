/**
 * Slider.tsx (Extension / DOM)
 *
 * Purpose: Range slider for numeric input
 */

import React from 'react';
import { colors, spacing, typography } from '../design/tokens';

export interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label?: string;
  testID?: string;
  accessibilityLabel?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  label,
  testID,
  accessibilityLabel,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange(Number(event.target.value));
  };

  return (
    <div style={styles.container}>
      {label && <div style={styles.label}>{label}</div>}
      <div style={styles.sliderRow}>
        <div style={styles.minLabel}>{min}</div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          style={styles.slider}
          data-testid={testID}
          aria-label={accessibilityLabel || label}
        />
        <div style={styles.maxLabel}>{max}</div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
  },
  label: {
    color: colors.tertiaryText,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.base,
  },
  sliderRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  slider: {
    flex: 1,
    appearance: 'none',
    height: 4,
    borderRadius: 2,
    background: `linear-gradient(to right, ${colors.primary} 0%, ${colors.primary} var(--value), ${colors.secondary} var(--value), ${colors.secondary} 100%)`,
    outline: 'none',
    cursor: 'pointer',
  },
  minLabel: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.base,
    minWidth: spacing.lg * 2,
    textAlign: 'center',
  },
  maxLabel: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.base,
    minWidth: spacing.lg * 2,
    textAlign: 'center',
  },
};

export default Slider;

