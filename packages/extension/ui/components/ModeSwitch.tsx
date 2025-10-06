/**
 * ModeSwitch.tsx (Extension / DOM)
 *
 * Purpose: Toggle switch for light/dark mode (currently light mode only for extension)
 */

import React from 'react';
import { colors, radius, spacing, typography } from '../design/tokens';

export const ModeSwitch: React.FC = () => {
  // For now, extension only supports light mode
  const mode = 'light';

  return (
    <div style={styles.container} data-testid="mode-switch-container">
      <div style={styles.row}>
        <button
          style={{
            ...styles.option,
            ...(mode === 'light' ? styles.optionActive : styles.optionInactive),
          }}
          data-testid="light-mode-button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="5" stroke={mode === 'light' ? colors.secondary : colors.tertiary} strokeWidth="2"/>
            <line x1="12" y1="1" x2="12" y2="3" stroke={mode === 'light' ? colors.secondary : colors.tertiary} strokeWidth="2"/>
            <line x1="12" y1="21" x2="12" y2="23" stroke={mode === 'light' ? colors.secondary : colors.tertiary} strokeWidth="2"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke={mode === 'light' ? colors.secondary : colors.tertiary} strokeWidth="2"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke={mode === 'light' ? colors.secondary : colors.tertiary} strokeWidth="2"/>
            <line x1="1" y1="12" x2="3" y2="12" stroke={mode === 'light' ? colors.secondary : colors.tertiary} strokeWidth="2"/>
            <line x1="21" y1="12" x2="23" y2="12" stroke={mode === 'light' ? colors.secondary : colors.tertiary} strokeWidth="2"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke={mode === 'light' ? colors.secondary : colors.tertiary} strokeWidth="2"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke={mode === 'light' ? colors.secondary : colors.tertiary} strokeWidth="2"/>
          </svg>
          <span style={mode === 'light' ? styles.optionTextActiveLight : styles.optionTextInactive}>
            Clair
          </span>
        </button>
        <button
          style={{
            ...styles.option,
            ...(mode === 'dark' ? styles.optionActive : styles.optionInactive),
          }}
          disabled
          data-testid="dark-mode-button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke={colors.tertiary} strokeWidth="2"/>
          </svg>
          <span style={styles.optionTextInactive}>
            Sombre
          </span>
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: colors.secondaryBackground,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: radius.lg,
    height: 50,
    padding: spacing.xs,
    width: '90%',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  option: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    flex: 1,
    height: '100%',
    padding: spacing.xs,
    borderRadius: radius.md + 2,
    cursor: 'pointer',
    border: 'none',
    transition: 'background 0.2s',
  },
  optionActive: {
    backgroundColor: colors.white,
    border: `1px solid ${colors.borderColor}`,
  },
  optionInactive: {
    backgroundColor: 'transparent',
    border: 'none',
  },
  optionTextActiveLight: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.base,
  },
  optionTextActiveDark: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.base,
  },
  optionTextInactive: {
    color: colors.tertiary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.base,
  },
};

export default ModeSwitch;

