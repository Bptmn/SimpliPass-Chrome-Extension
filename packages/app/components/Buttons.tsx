import React from 'react';
import { Pressable, Text, ViewStyle, TextStyle } from 'react-native';
import { useThemeMode } from '@app/components';
import { getColors } from '@design/colors';
import { radius, spacing } from '@design/layout';
import { typography } from '@design/typography';
import { textStyles } from '@design/text';

export type ButtonWidth = 'full' | 'fit';
export type ButtonHeight = 'full' | 'fit';
export type ButtonAlign = 'left' | 'center' | 'right';

interface ButtonProps {
  text: string;
  color: string;
  width?: ButtonWidth;
  height?: ButtonHeight;
  align?: ButtonAlign;
  outline?: boolean;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
  accessibilityLabel?: string;
  disabled?: boolean;
}

const getAlignmentStyle = (align: ButtonAlign) => {
  switch (align) {
    case 'left':
      return { alignSelf: 'flex-start' as const };
    case 'right':
      return { alignSelf: 'flex-end' as const };
    case 'center':
    default:
      return { alignSelf: 'center' as const };
  }
};

export const Button: React.FC<ButtonProps> = ({
  text,
  color,
  width = 'full',
  height = 'full',
  align = 'center',
  outline = false,
  onPress,
  style,
  textStyle,
  testID,
  accessibilityLabel,
  disabled = false,
}) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  
  const alignmentStyle = getAlignmentStyle(align);
  
  const buttonStyle = {
    backgroundColor: outline ? 'transparent' : color,
    borderColor: outline ? color : 'transparent',
    borderWidth: outline ? 2 : 0,
    borderRadius: radius.xl,
    height: height === 'full' ? 40 : 32,
    paddingHorizontal: spacing.lg,
    width: width === 'full' ? '100%' : 'auto',
    opacity: disabled ? 0.6 : 1,
  };

  const textStyleObj = {
    color: outline ? color : themeColors.whiteText,
    fontSize: typography.fontSize.sm,
  };

  // Dynamic styles
  const styles = {
    button: {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
  };

  return (
    <Pressable
      style={[
        styles.button,
        buttonStyle,
        alignmentStyle,
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
          outline ? textStyles.textButtonOutline : textStyles.textButton,
          textStyleObj,
          textStyle,
        ]}
      >
        {text}
      </Text>
    </Pressable>
  );
}; 