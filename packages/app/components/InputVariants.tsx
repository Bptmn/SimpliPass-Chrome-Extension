import React from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { colors } from '@design/colors';
import { formStyles } from '@design/form';
import { Icon } from './Icon';

// --- Input classique ---
interface InputProps {
  label: string;
  _id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password';
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
  <View style={formStyles.formSection}>
    <Text style={formStyles.formLabel}>{label}</Text>
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={colors.accent}
      style={[
        formStyles.formInput,
        error ? formStyles.formInputError : null,
        disabled ? formStyles.formInputDisabled : null,
      ]}
      value={value}
      onChangeText={onChange}
      editable={!disabled}
      secureTextEntry={type === 'password'}
      accessibilityLabel={label}
    />
    {error ? <Text style={formStyles.formError}>{error}</Text> : null}
  </View>
);

// --- InputPasswordGenerator ---
interface InputPasswordGeneratorProps {
  label: string;
  _id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  _autoComplete?: string;
  _required?: boolean;
  error?: string;
  disabled?: boolean;
  onGeneratePassword?: () => void;
}

export const InputPasswordGenerator: React.FC<InputPasswordGeneratorProps> = ({
  label,
  _id,
  value,
  onChange,
  placeholder,
  _autoComplete,
  _required = false,
  error,
  disabled = false,
  onGeneratePassword,
}) => (
  <View style={formStyles.formSection}>
    <View style={formStyles.formPasswordStrength}>
      <Text style={formStyles.formLabel}>{label}</Text>
      {onGeneratePassword && (
        <Pressable style={formStyles.formGenerateButton} onPress={onGeneratePassword}>
          <Text style={formStyles.formGenerateButtonText}>Générer</Text>
        </Pressable>
      )}
    </View>
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={colors.accent}
      style={[
        formStyles.formInput,
        error ? formStyles.formInputError : null,
        disabled ? formStyles.formInputDisabled : null,
      ]}
      value={value}
      onChangeText={onChange}
      editable={!disabled}
      secureTextEntry={true}
      accessibilityLabel={label}
    />
    {error ? <Text style={formStyles.formError}>{error}</Text> : null}
  </View>
);

interface InputPasswordStrengthProps {
  label: string;
  _id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  _autoComplete?: string;
  _required?: boolean;
  error?: string;
  disabled?: boolean;
  strength?: 'weak' | 'average' | 'strong' | 'perfect';
}

export const InputPasswordStrength: React.FC<InputPasswordStrengthProps> = ({
  label,
  _id,
  value,
  onChange,
  placeholder,
  _autoComplete,
  _required = false,
  error,
  disabled = false,
  strength,
}) => {
  const getStrengthColor = () => {
    switch (strength) {
      case 'weak':
        return '#e57373';
      case 'average':
        return '#ffb300';
      case 'strong':
        return colors.primary;
      case 'perfect':
        return colors.secondary;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <View style={formStyles.formSection}>
      <Text style={formStyles.formLabel}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.accent}
        style={[
          formStyles.formInput,
          error ? formStyles.formInputError : null,
          disabled ? formStyles.formInputDisabled : null,
        ]}
        value={value}
        onChangeText={onChange}
        editable={!disabled}
        secureTextEntry={true}
        accessibilityLabel={label}
      />
      {strength && (
        <View style={formStyles.formValidation}>
          <Icon name="security" size={16} color={getStrengthColor()} />
          <Text style={[formStyles.formValidationText, { color: getStrengthColor() }]}>
            {strength === 'weak' && 'Faible'}
            {strength === 'average' && 'Moyen'}
            {strength === 'strong' && 'Fort'}
            {strength === 'perfect' && 'Parfait'}
          </Text>
        </View>
      )}
      {error ? <Text style={formStyles.formError}>{error}</Text> : null}
    </View>
  );
}; 