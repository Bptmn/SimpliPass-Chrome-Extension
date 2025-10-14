/**
 * Card Styles (Extension / DOM)
 * 
 * Purpose: Centralized card styles for consistent card components
 * Adapted from React Native Web design system to DOM/CSS-in-JS
 */

import { colors, spacing, radius, shadow, typography } from './tokens';

export const cardStyles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: colors.secondaryBackground,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: radius.md,
    boxShadow: shadow.card,
  },
  cardHover: {
    boxShadow: shadow.cardHover,
  },
  
  // Color circle for secure notes
  colorCircle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    height: 35,
    width: 35,
    marginRight: spacing.md,
  },
  
  // Checkmark for selections
  checkMark: {
    color: colors.whiteText,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: typography.fontFamily.base,
    textAlign: 'center' as const,
  },
  
  // Color selection row
  colorRow: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  
  // Password display
  passwordDisplay: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  passwordText: {
    backgroundColor: colors.primaryBackground,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: radius.md,
    color: colors.secondary,
    flex: 1,
    fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace',
    fontSize: 16,
    minHeight: 20,
    padding: spacing.sm,
  },
};

