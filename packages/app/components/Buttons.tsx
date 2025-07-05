import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { spacing } from '@design/layout';
import { typography } from '@design/typography';
import { textStyles } from '@design/text';

export type ButtonSize = 'small' | 'medium' | 'big';

interface ButtonProps {
  text: string;
  color: string;
  size?: ButtonSize;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
  accessibilityLabel?: string;
  disabled?: boolean;
}

const getButtonStyle = (size: ButtonSize) => {
  switch (size) {
    case 'small':
      return {
        height: 30,
        paddingHorizontal: spacing.lg,
        fontSize: typography.fontSize.sm,
        borderRadius: 18,
      };
    case 'medium':
    default:
      return {
        height: 42,
        paddingHorizontal: spacing.xl,
        fontSize: typography.fontSize.md,
        borderRadius: 24,
      };
  }
};

export const Button: React.FC<ButtonProps> = ({
  text,
  color,
  size = 'medium',
  onPress,
  style,
  textStyle,
  testID,
  accessibilityLabel,
  disabled = false,
}) => {
  const s = getButtonStyle(size);
  return (
    <Pressable
      style={[
        styles.button,
        {
          backgroundColor: color,
          borderRadius: s.borderRadius,
          height: s.height,
          paddingHorizontal: s.paddingHorizontal,
          opacity: disabled ? 0.6 : 1,
          width: '100%',
        },
        style,
      ]}  
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || text}
      testID={testID}
    >
      <Text
        style={[
          textStyles.textButton,
          {
            fontSize: s.fontSize,
          },
          textStyle,
        ]}
      >
        {text}
      </Text>
    </Pressable>
  );
};

export const ButtonOutline: React.FC<ButtonProps> = ({
  text,
  color,
  size = 'medium',
  onPress,
  style,
  textStyle,
  testID,
  accessibilityLabel,
  disabled = false,
}) => {
  const s = getButtonStyle(size);
  return (
    <Pressable
      style={[
        styles.buttonOutline,
        {
          borderColor: color,
          borderWidth: 2,
          borderRadius: s.borderRadius,
          height: s.height,
          paddingHorizontal: s.paddingHorizontal,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || text}
      testID={testID}
    >
      <Text
        style={[
          textStyles.textButtonOutline,
          {
            color: color,
            fontSize: s.fontSize,
          },
          textStyle,
        ]}
      >
        {text}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    alignSelf: 'baseline',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  buttonOutline: {
    alignItems: 'center',
    alignSelf: 'baseline',
    backgroundColor: 'none',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
}); 