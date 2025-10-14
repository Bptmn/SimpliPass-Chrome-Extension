/**
 * Form Styles (Extension / DOM)
 * 
 * Purpose: Centralized form styles for consistent form elements
 * Adapted from React Native Web design system to DOM/CSS-in-JS
 */

import { colors, spacing, radius, typography } from './tokens';

export const formStyles: Record<string, React.CSSProperties> = {
  // Form fields
  formField: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
  },
  formFieldGroup: {
    backgroundColor: colors.secondaryBackground,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: radius.md,
    padding: spacing.md,
    width: '100%',
    marginBottom: spacing.md,
  },
  formFieldRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  formFieldLeft: {
    flex: 1,
  },
  
  // Form buttons
  formButtonGroup: {
    display: 'flex',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  formButtonPrimary: {
    flex: 1,
  },
  formButtonSecondary: {
    flex: 1,
  },
  
  // Form groups
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  formRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  formColumn: {
    flex: 1,
  },
  
  // Form labels
  formLabelRequired: {
    color: colors.error,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.base,
    marginTop: spacing.xs,
  },
  formLabelLarge: {
    color: colors.blackText,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.base,
    marginBottom: spacing.sm,
  },
  
  // Form password strength
  formPasswordStrength: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  formPasswordStrengthText: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    fontFamily: typography.fontFamily.base,
  },
  
  // Form inputs
  formInputLarge: {
    backgroundColor: colors.secondaryBackground,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: radius.xl,
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    fontFamily: typography.fontFamily.base,
    height: 48,
    letterSpacing: 8,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    textAlign: 'center' as const,
    width: '100%',
    outline: 'none',
  },
  
  // Form text area
  formTextArea: {
    borderRadius: radius.md,
    minHeight: 96,
    paddingTop: spacing.sm,
  },
  
  // Form help text
  formHelp: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.base,
    marginTop: spacing.xs,
  },
  
  // Form error
  formErrorLarge: {
    color: colors.error,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.base,
    marginTop: spacing.sm,
  },
  
  // Form generate button
  formGenerateButton: {
    backgroundColor: colors.secondary,
    borderRadius: radius.lg,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 8,
    paddingBottom: 8,
    border: 'none',
    cursor: 'pointer',
  },
  formGenerateButtonText: {
    color: colors.whiteText,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    fontFamily: typography.fontFamily.base,
  },
  
  // Form flex utilities
  formFlexEnd: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
};

