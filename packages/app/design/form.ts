import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { typography } from './typography';
import { radius, spacing, padding } from './layout';

export const formStyles = StyleSheet.create({
  // Form buttons
  formButtonGroup: {
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
  // Form containers
  formColumn: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    gap: spacing.md,
    padding: padding.lg,
  },
  formErrorLarge: {
    color: colors.error,
    fontSize: typography.fontSize.md,
    marginTop: spacing.sm,
  },
  formField: {
    gap: spacing.xs,
  },
  formFieldGroup: {
    backgroundColor: colors.secondaryBackground,
    borderColor: colors.borderColor,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
    width: '100%',
  },
  formFieldLeft: {
    flex: 1,
  },
  formFieldRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  formGroup: {
    gap: spacing.sm,
  },
  // Form generate button
  formGenerateButton: {
    backgroundColor: colors.secondary,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  formGenerateButtonText: {
    color: colors.whiteText,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  formLabelRequired: {
    color: colors.error,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing.xs,
  },
  
  // Form password strength
  formPasswordStrength: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  formPasswordStrengthText: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  
  // Form flex utilities
  formFlexEnd: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  formLabelLarge: {
    color: colors.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.sm,
  },
  formInputLarge: {
    backgroundColor: colors.secondaryBackground,
    borderColor: colors.borderColor,
    borderRadius: radius.xl,
    borderWidth: 1,
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    height: 48,
    letterSpacing: 8,
    paddingHorizontal: spacing.md,
    textAlign: 'center',
    width: '100%',
  },
  formHelp: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  formTextArea: {
    borderRadius: 15,
    minHeight: 96,
    paddingTop: spacing.sm,
    textAlignVertical: 'top',
  },
}); 