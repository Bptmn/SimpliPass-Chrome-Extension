/**
 * Text Styles (Extension / DOM)
 * 
 * Purpose: Centralized text styles organized by semantic categories
 * Best practices: clear hierarchy, minimal variants, semantic naming
 */

import { colors, spacing, typography } from './tokens';

export const textStyles: Record<string, React.CSSProperties> = {
  // ===== HEADINGS =====
  // Use for page titles, section headers
  heading1: {
    color: colors.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.base,
  },
  heading2: {
    color: colors.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.base,
  },
  heading3: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.base,
  },
  
  // ===== BODY TEXT =====
  // Use for main content, paragraphs
  body: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    fontFamily: typography.fontFamily.base,
  },
  bodySmall: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    fontFamily: typography.fontFamily.base,
  },
  
  // ===== LABELS =====
  // Use for form labels, field labels
  label: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.base,
  },
  labelSmall: {
    color: colors.tertiaryText,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular,
    fontFamily: typography.fontFamily.base,
  },
  
  // ===== DESCRIPTIONS =====
  // Use for secondary text, descriptions, metadata
  description: {
    color: colors.tertiary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    fontFamily: typography.fontFamily.base,
  },
  descriptionSmall: {
    color: colors.tertiary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.base,
  },
  
  // ===== ALERTS & STATUS =====
  // Use for errors, warnings, success messages
  error: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    fontFamily: typography.fontFamily.base,
  },
  errorLarge: {
    color: colors.error,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.base,
    marginTop: spacing.lg,
    textAlign: 'center' as const,
  },
  success: {
    color: colors.success,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    fontFamily: typography.fontFamily.base,
  },
  warning: {
    color: colors.warning,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    fontFamily: typography.fontFamily.base,
  },
  
  // ===== INTERACTIVE =====
  // Use for buttons, links, clickable elements
  button: {
    color: colors.whiteText,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.base,
  },
  link: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.base,
    textDecoration: 'underline',
  },
  
  // ===== INPUTS & FIELDS =====
  // Use for form inputs and field values
  input: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    fontFamily: typography.fontFamily.base,
  },
  fieldValue: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    fontFamily: typography.fontFamily.base,
  },
  
  // ===== SPECIAL STATES =====
  // Use for placeholder, empty states, loading
  placeholder: {
    color: colors.secondary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    fontFamily: typography.fontFamily.base,
    fontStyle: 'italic',
    textAlign: 'center' as const,
  },
  loading: {
    color: colors.secondary,
    fontSize: typography.fontSize.md,
    fontStyle: 'italic',
    fontFamily: typography.fontFamily.base,
    marginTop: spacing.lg,
  },
  
  // ===== CARD SPECIFIC =====
  // Use for card components
  cardTitle: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.base,
  },
  cardSubtitle: {
    color: colors.tertiaryText,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular,
    fontFamily: typography.fontFamily.base,
  },
};
