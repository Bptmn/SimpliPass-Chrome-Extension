import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@design/colors';
import { radius } from '@design/layout';
import { textStyles } from '@design/text';

interface ErrorBannerProps {
  message: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message }) => {
  return (
    <View style={styles.errorBanner}>
      <Text style={textStyles.textErrorLarge}>Erreur</Text>
      <Text style={textStyles.textSecondary}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  errorBanner: {
    backgroundColor: colors.bg,
    borderColor: colors.error,
    borderRadius: radius.md,
    borderWidth: 1,
    margin: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
});
