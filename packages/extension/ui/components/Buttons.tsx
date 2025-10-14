/**
 * Buttons.tsx (Extension / DOM)
 *
 * Purpose: Comprehensive button component with multiple variants and styles
 */

import React from 'react';
import { colors, spacing, radius, typography } from '../design';

export type ButtonWidth = 'full' | 'fit';
export type ButtonHeight = 'full' | 'fit';
export type ButtonAlign = 'left' | 'center' | 'right';
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger' | 'success';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  width?: ButtonWidth;
  height?: ButtonHeight;
  align?: ButtonAlign;
  onClick: () => void;
  style?: React.CSSProperties;
  textStyle?: React.CSSProperties;
  testID?: string;
  accessibilityLabel?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

const getAlignmentStyle = (align: ButtonAlign) => {
  switch (align) {
    case 'left':
      return { alignSelf: 'flex-start' };
    case 'right':
      return { alignSelf: 'flex-end' };
    case 'center':
    default:
      return { alignSelf: 'center' };
  }
};

const getVariantStyles = (variant: ButtonVariant) => {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: colors.primary,
        color: colors.whiteText,
        border: 'none',
      };
    case 'secondary':
      return {
        backgroundColor: colors.secondary,
        color: colors.whiteText,
        border: 'none',
      };
      case 'tertiary':
        return {
          backgroundColor: colors.tertiary,
          color: colors.whiteText,
          border: 'none',
        };
    case 'ghost':
      return {
        backgroundColor: 'transparent',
        color: colors.primary,
        border: `1px solid ${colors.borderColor}`,
      };
    case 'danger':
      return {
        backgroundColor: colors.error,
        color: colors.whiteText,
        border: 'none',
      };
    case 'success':
      return {
        backgroundColor: colors.success,
        color: colors.whiteText,
        border: 'none',
      };
    default:
      return {
        backgroundColor: colors.primary,
        color: colors.whiteText,
        border: 'none',
      };
  }
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  width = 'full',
  height = 'full',
  align = 'center',
  onClick,
  style,
  textStyle,
  testID,
  accessibilityLabel,
  disabled = false,
  fullWidth = false,
}) => {
  const alignmentStyle = getAlignmentStyle(align);
  const variantStyles = getVariantStyles(variant);
  
  const buttonStyle = {
    ...variantStyles,
    borderRadius: radius.xl,
    height: height === 'full' ? 40 : 32,
    paddingHorizontal: spacing.lg,
    width: width === 'full' || fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.base,
    outline: 'none',
    transition: 'opacity 0.2s, transform 0.1s',
    ...alignmentStyle,
    ...style,
  };

  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      style={buttonStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={accessibilityLabel}
      data-testid={testID}
      type="button"
    >
      <span style={textStyle}>{children}</span>
    </button>
  );
};

// Convenience components for common variants
export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="primary" />
);

export const SecondaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="secondary" />
);

export const TertiaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="tertiary" />
);

export const GhostButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="ghost" />
);

export const DangerButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="danger" />
);

export const SuccessButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="success" />
);

export default Button;
