import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './layout';

export const textStyles = StyleSheet.create({
  // tertiary text
  textTertiary: {
    color: colors.tertiary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
  },
  // Text variants
  textBody: {
    color: colors.blackText,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
  },
  textBodyLarge: {
    color: colors.blackText,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.regular,
  },
  textBodySmall: {
    color: colors.blackText,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
  },
  textButton: {
    color: colors.whiteText,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  textButtonOutline: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  textEmptyState: {
    color: colors.secondary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    textAlign: 'center',
  },
  textError: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing.xs,
  },
  textErrorLarge: {
    color: colors.error,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  textFieldLabel: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: 2,
  },
  textFieldValue: {
    color: colors.blackText,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    marginBottom: 2,
  },
  textLabel: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  textLoading: {
    color: colors.secondary,
    fontSize: typography.fontSize.md,
    fontStyle: 'italic',
    marginTop: spacing.lg,
  },
  textSecondary: {
    color: colors.secondary,
    fontSize: typography.fontSize.md,
  },
  textSecondarySmall: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
  },
  textSectionLabel: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
    marginTop: spacing.lg,
  },
  textTitle: {
    color: colors.blackText,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  textSmall: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
  },
  textTitleLarge: {
    color: colors.blackText,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
}); 