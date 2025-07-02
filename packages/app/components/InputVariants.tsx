import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { colors } from '@design/colors';
import { radius, spacing } from '@design/layout';
import { typography } from '@design/typography';
import { IconKey } from '@utils/icon';

// --- Input classique ---
export interface InputProps {
  label: string;
  _id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  _autoComplete?: string;
  _required?: boolean;
  error?: string;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  _id,
  value,
  onChange,
  placeholder,
  type = 'text',
  _autoComplete,
  _required = false,
  error,
  disabled = false,
}) => (
  <View style={styles.formSection}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[
        styles.input,
        error ? styles.inputError : null,
        disabled ? styles.inputDisabled : null,
      ]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      editable={!disabled}
      secureTextEntry={type === 'password'}
      accessibilityLabel={label}
    />
    {error ? <Text style={styles.inputErrorMessage}>{error}</Text> : null}
  </View>
);

// --- InputPasswordGenerator ---
export interface InputPasswordGeneratorProps {
  label: string;
  _id?: string;
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  placeholder?: string;
  _required?: boolean;
  passwordStrength?: string;
  _onAdvancedOptions?: () => void;
  Icon?: React.ComponentType<{ name: IconKey; size?: number; color?: string }>;
  error?: string;
}

export const InputPasswordGenerator: React.FC<InputPasswordGeneratorProps> = ({
  label,
  _id,
  value,
  onChange,
  onGenerate,
  placeholder = 'Entrez un mot de passe...',
  _required = false,
  passwordStrength,
  _onAdvancedOptions,
  Icon,
  error,
}) => (
  <View style={styles.formSection}>
    <View style={styles.passwordStrengthContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      {passwordStrength && (
        <View style={styles.passwordStrength}>
          <Text style={styles.passwordStrengthText}>{passwordStrength} </Text>
          {Icon && <Icon name="security" size={18} color={colors.secondary} />}
        </View>
      )}
    </View>
    <TextInput
      style={[
        styles.input,
        error ? styles.inputError : null,
      ]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      accessibilityLabel={label}
    />
    {error ? <Text style={styles.inputErrorMessage}>{error}</Text> : null}
    <View style={styles.flexEnd}>
      <Pressable style={styles.generateBtn} onPress={onGenerate} accessibilityRole="button">
        <Text style={styles.generateBtnText}>Générer un mot de passe</Text>
      </Pressable>
    </View>
  </View>
);

const styles = StyleSheet.create({
  flexEnd: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  formSection: {
    flexDirection: 'column',
    marginBottom: spacing.md,
    width: '100%',
  },
  generateBtn: {
    backgroundColor: colors.secondary,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  generateBtnText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.bgAlt,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    height: 48,
    marginBottom: 2,
    paddingHorizontal: spacing.md,
    width: '100%',
  },
  inputDisabled: {
    backgroundColor: colors.disabled,
    color: colors.textSecondary,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputErrorMessage: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    marginTop: 2,
  },
  inputLabel: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    marginBottom: 2,
  },
  passwordStrength: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  passwordStrengthContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  passwordStrengthText: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
}); 