import React from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useThemeMode } from '@common/ui/design/theme';
import { getColors } from '@ui/design/colors';
import { spacing } from '@ui/design/layout';
import { radius } from '@ui/design/layout';
import { typography } from '@ui/design/typography';
import { Icon } from './Icon';
import { useInputLogic } from '@common/hooks/useInputLogic';

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
  onBlur?: () => void;
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
  onBlur,
}) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  
  const {
    showPassword,
    inputHeight,
    togglePasswordVisibility,
    handleContentSizeChange,
  } = useInputLogic(type);

  // Dynamic styles
  const inputStyles = {
    inputError: {
      color: themeColors.error,
      fontSize: typography.fontSize.sm,
      marginBottom: spacing.xs,
    },
    inputField: {
      backgroundColor: themeColors.secondaryBackground,
      borderColor: themeColors.borderColor,
      borderRadius: radius.xxl,
      borderWidth: 1,
      color: themeColors.primary,
      fontSize: typography.fontSize.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    inputFieldDisabled: {
      backgroundColor: themeColors.disabled,
      color: themeColors.tertiary,
    },
    inputFieldError: {
    },
    inputLabel: {
      color: themeColors.primary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      paddingBottom: spacing.xs,
    },
    inputLabelRow: {
      alignItems: 'center' as const,
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      paddingRight: spacing.md,
    },
    inputValidation: {
      alignItems: 'center' as const,
      flexDirection: 'row' as const,
      paddingBottom: spacing.xs,
    },
    inputValidationText: {
      color: themeColors.secondary,
      fontSize: typography.fontSize.sm,
      fontWeight: '500' as const,
      marginLeft: spacing.xs,
    },
    placeholderTextSize: {
      fontSize: typography.fontSize.xs,
    },
  };

  return (
    <View>
      <Text style={inputStyles.inputLabel}>{label}</Text>
      <View style={{ position: 'relative' }}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={themeColors.tertiary}
          style={[
            inputStyles.inputField,
            inputStyles.placeholderTextSize,
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
          onBlur={onBlur}
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
              color={themeColors.tertiary} 
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
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);

  const getStrengthColor = () => {
    switch (strength) {
      case 'weak':
        return themeColors.error;
      case 'average':
        return themeColors.warning;
      case 'strong':
      case 'perfect':
        return themeColors.secondary;
      default:
        return themeColors.secondary;
    }
  };

  // Dynamic styles
  const inputStyles = {
    inputError: {
      color: themeColors.error,
      fontSize: typography.fontSize.sm,
      marginBottom: spacing.xs,
    },
    inputField: {
      backgroundColor: themeColors.secondaryBackground,
      borderColor: themeColors.borderColor,
      borderRadius: radius.xxl,
      borderWidth: 1,
      color: themeColors.primary,
      fontSize: typography.fontSize.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    inputFieldDisabled: {
      backgroundColor: themeColors.disabled,
      color: themeColors.tertiary,
    },
    inputFieldError: {
    },
    inputLabel: {
      color: themeColors.primary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      paddingBottom: spacing.xs,
    },
    inputLabelRow: {
      alignItems: 'center' as const,
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      paddingRight: spacing.md,
    },
    inputValidation: {
      alignItems: 'center' as const,
      flexDirection: 'row' as const,
      paddingBottom: spacing.xs,
    },
    inputValidationText: {
      color: themeColors.secondary,
      fontSize: typography.fontSize.sm,
      fontWeight: '500' as const,
      marginLeft: spacing.xs,
    },
    placeholderTextSize: {
      fontSize: typography.fontSize.xs,
    },
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
          placeholderTextColor={themeColors.tertiary}
          style={[
            inputStyles.inputField,
            inputStyles.placeholderTextSize,
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