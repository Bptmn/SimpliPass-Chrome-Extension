import React from 'react';
import { View, Text } from 'react-native';
import { useThemeMode } from '@app/core/logic/theme';
import { getColors } from '@design/colors';
import { radius, spacing } from '@design/layout';
import { textStyles } from '@design/text';

interface ErrorBannerProps {
  message: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message }) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);

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
