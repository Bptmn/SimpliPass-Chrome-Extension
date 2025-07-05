import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './layout';

export const textStyles = StyleSheet.create({
  // Accent text
  textAccent: {
    color: colors.accent,
    fontSize: typography.fontSize.sm,
    fontWeight: '400',
  },
  // Text variants
  textBody: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: '400',
  },
  textBodyLarge: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: '400',
  },
  textBodySmall: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: '400',
  },
  textButton: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  textButtonOutline: {
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  textError: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    marginTop: spacing.xs,
  },
  textErrorLarge: {
    color: colors.error,
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  textEmptyState: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    textAlign: 'center',
  },
  textLabel: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  textSecondarySmall: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
  },
  textSectionLabel: {
    color: colors.accent,
    fontSize: typography.fontSize.xs,
    fontWeight: '500',
    margin: 0,
  },
  textTitle: {
    color: colors.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  
  // Title styles
  textTitleLarge: {
    color: colors.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  
  // Loading text
  textLoading: {
    color: colors.secondary,
    fontSize: typography.fontSize.md,
    margin: spacing.lg,
    textAlign: 'center',
  },
  
  // Meta text (for timestamps, etc.)
  textMeta: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginBottom: 2,
  },
  
  // Field labels
  textFieldLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    marginBottom: 2,
  },
  
  // Field values
  textFieldValue: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
  textSecondary: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
  },
}); 