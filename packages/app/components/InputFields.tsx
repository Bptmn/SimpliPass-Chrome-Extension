import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { colors } from '@design/colors';
import { spacing } from '@design/layout';
import { radius } from '@design/layout';
import { typography } from '@design/typography';
import { Icon } from './Icon';
import { useInputLogic } from '@app/core/hooks';


// --- Input classique ---
interface InputProps {
  label: string;
  _id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'note';
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
}) => {
  const {
    showPassword,
    inputHeight,
    togglePasswordVisibility,
    handleContentSizeChange,
  } = useInputLogic(type);

  return (
    <View>
      <Text style={inputStyles.inputLabel}>{label}</Text>
      <View style={{ position: 'relative' }}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={colors.tertiary}
          style={[
            inputStyles.inputField,
            type === 'note' && {
              height: inputHeight,
              textAlignVertical: 'top',
              paddingTop: spacing.sm,
              borderRadius: 15,
            },
            type === 'password' && {
              paddingRight: 50, // Space for the eye icon
            },
            error ? inputStyles.inputFieldError : null,
            disabled ? inputStyles.inputFieldDisabled : null,
          ]}
          value={value}
          onChangeText={onChange}
          editable={!disabled}
          secureTextEntry={type === 'password' && !showPassword}
          multiline={type === 'note'}
          numberOfLines={type === 'note' ? undefined : 1}
          onContentSizeChange={type === 'note' ? handleContentSizeChange : undefined}
          accessibilityLabel={label}
          testID={`input-${_id}`}
        />
        {type === 'password' && (
          <Pressable
            style={{
              position: 'absolute',
              right: spacing.sm,
              top: '50%',
              transform: [{ translateY: -12 }],
              padding: spacing.xs,
              zIndex: 1,
            }}
            onPress={togglePasswordVisibility}
            disabled={disabled}
            accessibilityLabel={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            accessibilityRole="button"
            testID={`input-${_id}-toggle-password`}
          >
            <Icon 
              name={showPassword ? 'visibilityOff' : 'visibility'} 
              size={20} 
              color={colors.tertiary} 
            />
          </Pressable>
        )}
      </View>
      {error ? <Text style={inputStyles.inputError}>{error}</Text> : null}
    </View>
  );
};


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
        return colors.error;
      case 'average':
        return colors.warning;
      case 'strong':
      case 'perfect':
        return colors.secondary;
      default:
        return colors.secondary;
    }
  };

  return (
    <View>
        <View style={inputStyles.inputLabelRow}>
        <Text style={inputStyles.inputLabel}>{label}</Text>
        {strength && (
          <View style={inputStyles.inputValidation}>
            <Icon name="security" size={14} color={getStrengthColor()} />
            <Text style={[inputStyles.inputValidationText, { color: getStrengthColor() }]}>
              {strength === 'weak' && 'Faible'}
              {strength === 'average' && 'Moyen'}
              {strength === 'strong' && 'Fort'}
              {strength === 'perfect' && 'Parfait'}
            </Text>
          </View>
        )}
        </View>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={colors.tertiary}
          style={[
            inputStyles.inputField,
            error ? inputStyles.inputFieldError : null,
            disabled ? inputStyles.inputFieldDisabled : null,
          ]}
          value={value}
          onChangeText={onChange}
          editable={!disabled}
          secureTextEntry={false}
          accessibilityLabel={label}
        />
        {error ? <Text style={inputStyles.inputError}>{error}</Text> : null}
    </View>
  );
}; 


// Input-specific styles
const inputStyles = StyleSheet.create({
    inputLabel: {
        color: colors.primary,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        paddingBottom: spacing.xs,
        },
        inputLabelRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingRight: spacing.md,
        },
      inputField: {
        backgroundColor: colors.secondaryBackground,
        borderColor: colors.borderColor,
        borderRadius: radius.xxl,
        borderWidth: 1,
        color: colors.primary,
        fontSize: typography.fontSize.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
      },
    inputFieldDisabled: {
      backgroundColor: colors.disabled,
      color: colors.tertiary,
    },
    inputFieldError: {
    },
    inputError: {
      color: colors.error,
      fontSize: typography.fontSize.sm,
      marginBottom: spacing.xs,
    },
    inputValidation: {
      alignItems: 'center',
      flexDirection: 'row',
      paddingBottom: spacing.xs,
    },
    inputValidationText: {
      color: colors.secondary,
      fontSize: typography.fontSize.sm,
      fontWeight: '500',
      marginLeft: spacing.xs,
    },
  });