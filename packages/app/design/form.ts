import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { typography } from './typography';
import { radius, spacing } from './layout';

export const formStyles = StyleSheet.create({
  // Form containers
  formColumn: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
  },
  formError: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  formErrorLarge: {
    color: colors.error,
    fontSize: typography.fontSize.md,
    marginTop: spacing.sm,
  },
  // Form field groups
  formFieldGroup: {
    backgroundColor: colors.bgAlt,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
    width: '100%',
  },
  formFieldRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  formInput: {
    backgroundColor: colors.bgAlt,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    height: 48,
    marginBottom: 2,
    paddingHorizontal: spacing.md,
    width: '100%',
  },
  formInputDisabled: {
    backgroundColor: colors.disabled,
    color: colors.textSecondary,
  },
  formInputError: {
    borderColor: colors.error,
  },
  formLabel: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  formLabelRequired: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  formFieldLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  formTextArea: {
    minHeight: 96,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
    borderRadius: 15,
  },
  
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
  
  // Form validation
  formValidation: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  formValidationText: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    marginLeft: spacing.xs,
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
  
  // Form generate button
  formGenerateButton: {
    backgroundColor: colors.secondary,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  formGenerateButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
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
    backgroundColor: colors.bgAlt,
    borderColor: colors.border,
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
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
}); 