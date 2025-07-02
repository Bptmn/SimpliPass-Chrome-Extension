import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@design/colors';
import { radius } from '@design/layout';

interface ErrorBannerProps {
  message: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message }) => (
  <View style={styles.errorBanner} accessibilityRole="alert" accessibilityLiveRegion="assertive">
    <Text style={styles.errorTitle}>Erreur</Text>
    <Text style={styles.errorText}>{message}</Text>
  </View>
);

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
  errorText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  errorTitle: {
    color: colors.error,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
});
