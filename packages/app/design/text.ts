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
    color: colors.textBlack,
    fontSize: typography.fontSize.md,
    fontWeight: '400',
  },
  textBodyLarge: {
    color: colors.textBlack,
    fontSize: typography.fontSize.lg,
    fontWeight: '400',
  },
  textBodySmall: {
    color: colors.textBlack,
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
  textEmptyState: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
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
  textFieldLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    marginBottom: 2,
  },
  textFieldValue: {
    color: colors.textBlack,
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    marginBottom: 2,
  },
  textLabel: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  textLoading: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    fontStyle: 'italic',
    marginTop: spacing.lg,
  },
  textSecondary: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
  },
  textSecondarySmall: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  textSectionLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    marginTop: spacing.lg,
  },
  textTitle: {
    color: colors.textBlack,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  textSmall: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  textTitleLarge: {
    color: colors.textBlack,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
}); 