import React, { useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { usePasswordGenerator } from '@common/hooks/usePasswordGenerator';
import { Slider } from '@common/ui/components/Slider';
import { Button } from '@common/ui/components/Buttons';
import { useThemeMode } from '@common/ui/design/theme';
import { getColors } from '@common/ui/design/colors';
import { spacing, radius } from '@common/ui/design/layout';
import { typography } from '@common/ui/design/typography';

/**
 * Password Generator Popover Component
 * 
 * Features:
 * - Password generation options (length, character types)
 * - Real-time strength indicator
 * - Accept/regenerate actions
 * - Keyboard shortcuts (Enter to accept, Escape to cancel)
 * - Auto-focus for keyboard navigation
 */
export interface PasswordGeneratorPopoverProps {
  onAccept: (password: string) => void;
  onRegenerate: () => void;
  onCancel: () => void;
  initialOptions?: {
    length: number;
    includeUppercase: boolean;
    includeLowercase: boolean;
    includeNumbers: boolean;
    includeSymbols: boolean;
    excludeSimilar: boolean;
  };
}

export const PasswordGeneratorPopover: React.FC<PasswordGeneratorPopoverProps> = ({
  onAccept,
  onCancel,
  initialOptions,
}) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  
  // Step 1: Initialize password generator hook
  const {
    hasUppercase,
    hasNumbers,
    hasSymbols,
    hasLowercase,
    length,
    password,
    strength,
    setHasUppercase,
    setHasNumbers,
    setHasSymbols,
    setHasLowercase,
    setLength,
    handleRegenerate,
  } = usePasswordGenerator();

  // Step 2: Apply initial options if provided
  useEffect(() => {
    if (initialOptions) {
      setLength(initialOptions.length);
      setHasUppercase(initialOptions.includeUppercase);
      setHasLowercase(initialOptions.includeLowercase);
      setHasNumbers(initialOptions.includeNumbers);
      setHasSymbols(initialOptions.includeSymbols);
    }
  }, [initialOptions, setLength, setHasUppercase, setHasLowercase, setHasNumbers, setHasSymbols]);

  // Step 3: Handle keyboard shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        onAccept(password);
        break;
      case 'Escape':
        event.preventDefault();
        onCancel();
        break;
      case 'r':
      case 'R':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          handleRegenerate();
        }
        break;
    }
  }, [password, onAccept, onCancel, handleRegenerate]);

  // Step 4: Add keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Step 5: Auto-focus on component mount
  useEffect(() => {
    const focusElement = document.querySelector('[data-testid="password-generator"]');
    if (focusElement) {
      (focusElement as HTMLElement).focus();
    }
  }, []);

  // Step 6: Get strength color
  const getStrengthColor = () => {
    switch (strength) {
      case 'weak':
        return themeColors.error;
      case 'average':
        return themeColors.warning;
      case 'strong':
        return themeColors.success;
      case 'perfect':
        return themeColors.primary;
      default:
        return themeColors.error;
    }
  };

  // Step 7: Get strength text
  const getStrengthText = () => {
    switch (strength) {
      case 'weak':
        return 'Faible';
      case 'average':
        return 'Moyen';
      case 'strong':
        return 'Fort';
      case 'perfect':
        return 'Parfait';
      default:
        return 'Faible';
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: themeColors.background,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: themeColors.borderColor,
      padding: spacing.lg,
      width: 320,
      maxWidth: '90vw',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: themeColors.primaryText,
    },
    closeButton: {
      padding: spacing.xs,
    },
    closeText: {
      fontSize: typography.fontSize.xl,
      color: themeColors.tertiaryText,
    },
    passwordContainer: {
      backgroundColor: themeColors.secondaryBackground,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: themeColors.borderColor,
    },
    passwordText: {
      fontSize: typography.fontSize.lg,
      fontFamily: 'monospace',
      color: themeColors.primaryText,
      textAlign: 'center',
      letterSpacing: 1,
    },
    strengthContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    strengthText: {
      fontSize: typography.fontSize.sm,
      color: themeColors.secondaryText,
    },
    strengthIndicator: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    strengthBar: {
      height: 4,
      borderRadius: 2,
      flex: 1,
    },
    optionsContainer: {
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    optionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    optionLabel: {
      fontSize: typography.fontSize.sm,
      color: themeColors.primaryText,
    },
    toggle: {
      width: 44,
      height: 24,
      borderRadius: 12,
      padding: 2,
    },
    toggleActive: {
      backgroundColor: themeColors.primary,
    },
    toggleInactive: {
      backgroundColor: themeColors.secondary,
    },
    toggleThumb: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: themeColors.white,
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    actionButton: {
      flex: 1,
    },
  });

  return (
    <View style={styles.container} data-testid="password-generator">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Générateur de mot de passe</Text>
        <Pressable style={styles.closeButton} onPress={onCancel}>
          <Text style={styles.closeText}>×</Text>
        </Pressable>
      </View>

      {/* Generated Password */}
      <View style={styles.passwordContainer}>
        <Text style={styles.passwordText} selectable>
          {password}
        </Text>
      </View>

      {/* Strength Indicator */}
      <View style={styles.strengthContainer}>
        <Text style={styles.strengthText}>Force du mot de passe</Text>
        <View style={styles.strengthIndicator}>
          <View
            style={[
              styles.strengthBar,
              { backgroundColor: getStrengthColor() },
            ]}
          />
          <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
            {getStrengthText()}
          </Text>
        </View>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {/* Length Slider */}
        <View>
          <Text style={styles.optionLabel}>Longueur: {length}</Text>
          <Slider
            value={length}
            onValueChange={setLength}
            min={8}
            max={64}
            step={1}
            testID="password-length-slider"
          />
        </View>

        {/* Character Type Options */}
        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>Lettres majuscules</Text>
          <Pressable
            style={[
              styles.toggle,
              hasUppercase ? styles.toggleActive : styles.toggleInactive,
            ]}
            onPress={() => setHasUppercase(!hasUppercase)}
          >
            <View
              style={[
                styles.toggleThumb,
                {
                  transform: [{ translateX: hasUppercase ? 20 : 0 }],
                },
              ]}
            />
          </Pressable>
        </View>

        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>Lettres minuscules</Text>
          <Pressable
            style={[
              styles.toggle,
              hasLowercase ? styles.toggleActive : styles.toggleInactive,
            ]}
            onPress={() => setHasLowercase(!hasLowercase)}
          >
            <View
              style={[
                styles.toggleThumb,
                {
                  transform: [{ translateX: hasLowercase ? 20 : 0 }],
                },
              ]}
            />
          </Pressable>
        </View>

        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>Chiffres</Text>
          <Pressable
            style={[
              styles.toggle,
              hasNumbers ? styles.toggleActive : styles.toggleInactive,
            ]}
            onPress={() => setHasNumbers(!hasNumbers)}
          >
            <View
              style={[
                styles.toggleThumb,
                {
                  transform: [{ translateX: hasNumbers ? 20 : 0 }],
                },
              ]}
            />
          </Pressable>
        </View>

        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>Symboles</Text>
          <Pressable
            style={[
              styles.toggle,
              hasSymbols ? styles.toggleActive : styles.toggleInactive,
            ]}
            onPress={() => setHasSymbols(!hasSymbols)}
          >
            <View
              style={[
                styles.toggleThumb,
                {
                  transform: [{ translateX: hasSymbols ? 20 : 0 }],
                },
              ]}
            />
          </Pressable>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Button
          variant="secondary"
          onPress={handleRegenerate}
          style={styles.actionButton}
          testID="regenerate-password"
        >
          <Text>Régénérer</Text>
        </Button>
        <Button
          variant="primary"
          onPress={() => onAccept(password)}
          style={styles.actionButton}
          testID="accept-password"
        >
          <Text>Accepter</Text>
        </Button>
      </View>
    </View>
  );
}; 