import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './layout';

export const textStyles = StyleSheet.create({
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
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  textButtonOutline: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  textCardTitle: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  textCardUsername: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
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
    fontWeight: typography.fontWeight.regular,
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
  },
  textFieldValue: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
  },
  textHeader: {
    color: colors.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  textInput: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
  },
  textLabel: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  textLink: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    textDecorationLine: 'underline',
  },
  textLoading: {
    color: colors.secondary,
    fontSize: typography.fontSize.md,
    fontStyle: 'italic',
    marginTop: spacing.lg,
  },
  textPrimary: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
  },
  textSecondary: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
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
  textSmall: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
  },
  textTertiary: {
    color: colors.tertiary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  textTitle: {
    color: colors.blackText,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  textTitleLarge: {
    color: colors.blackText,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
}); 