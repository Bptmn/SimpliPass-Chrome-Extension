/**
 * Login Prompt Popover Component (React Native Web)
 * Uses centralized colors, spacing, radius, and typography from @ui/design
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeProvider, useThemeMode } from '@common/ui/design/theme';
import { getColors } from '@common/ui/design/colors';
import { spacing, radius } from '@common/ui/design/layout';
import { typography } from '@common/ui/design/typography';
import { Button } from '@common/ui/components/Buttons';

interface LoginPromptPopoverProps {
  onLogin: () => void;
  onCancel: () => void;
}

const LoginPromptInner: React.FC<LoginPromptPopoverProps> = ({ onLogin, onCancel }) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: themeColors.primaryBackground,
      borderColor: themeColors.borderColor,
      borderRadius: radius.md,
      borderWidth: 1,
      padding: spacing.md,
      width: 350,
      maxWidth: 350,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    title: {
      color: themeColors.primary,
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    message: {
      color: themeColors.tertiaryText,
      fontSize: typography.fontSize.sm,
      lineHeight: 20,
      marginBottom: spacing.md,
      textAlign: 'center',
    },
    buttons: {
      flexDirection: 'row',
      gap: spacing.sm, // Increased gap slightly
      justifyContent: 'center',
      width: '100%', // Ensure buttons take full width
    },
    cancelButton: {
      flex: 1, // Make buttons flexible to fit container
      minWidth: 80, // Reduced minimum width
    },
    loginButton: {
      flex: 1, // Make buttons flexible to fit container
      minWidth: 80, // Reduced minimum width
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SimpliPass</Text>
      <Text style={styles.message}>You need to log in to use autofill features.</Text>
      <View style={styles.buttons}>
        <Button
          text="Cancel"
          color={themeColors.secondary}
          onPress={onCancel}
          style={styles.cancelButton}
          testID="cancel-login-prompt"
        />
        <Button
          text="Login"
          color={themeColors.primary}
          onPress={onLogin}
          style={styles.loginButton}
          testID="login-prompt"
        />
      </View>
    </View>
  );
};

export const LoginPromptPopover: React.FC<LoginPromptPopoverProps> = (props) => {
  return (
    <ThemeProvider>
      <LoginPromptInner {...props} />
    </ThemeProvider>
  );
};
