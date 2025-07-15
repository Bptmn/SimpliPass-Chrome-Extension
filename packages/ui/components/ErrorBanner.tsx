import React from 'react';
import { View, Text } from 'react-native';
import { useThemeMode } from '@common/core/logic/theme';
import { getColors } from '@ui/design/colors';
import { radius, spacing } from '@ui/design/layout';
import { textStyles } from '@ui/design/text';

interface ErrorBannerProps {
  message: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message }) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);

  // Log error with stack trace if available
  React.useEffect(() => {
    if (message) {
      // Try to capture a stack trace for context
      const error = new Error(message);
      // Prefix for easier filtering
      console.error('[SimpliPass ErrorBanner]', message, '\nStack:', error.stack);
    }
  }, [message]);

  // Dynamic styles
  const styles = {
    errorBanner: {
      backgroundColor: themeColors.primaryBackground,
      borderColor: themeColors.error,
      borderRadius: radius.md,
      borderWidth: 1,
      margin: spacing.lg,
      padding: spacing.lg,
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 8,
    },
  };

  return (
    <View style={styles.errorBanner}>
      <Text style={textStyles.textErrorLarge}>Erreur</Text>
      <Text style={textStyles.textSecondary}>{message}</Text>
    </View>
  );
};
