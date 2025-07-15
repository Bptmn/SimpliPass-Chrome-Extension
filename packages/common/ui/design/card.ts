import { StyleSheet } from 'react-native';
import { getColors } from './colors';
import { radius, spacing } from './layout';

export function getCardStyles(mode: 'light' | 'dark') {
  const colors = getColors(mode);
  
  return StyleSheet.create({
    card: {
      backgroundColor: colors.secondaryBackground,
      borderColor: colors.borderColor,
      borderRadius: radius.md,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
    },
    cardHover: {
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    checkMark: {
      color: colors.whiteText,
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    colorCircle: {
      alignItems: 'center',
      borderRadius: 20,
      height: 35,
      justifyContent: 'center',
      marginRight: spacing.md,
      width: 35,
    },
    colorRow: {
      flexDirection: 'row',
      marginBottom: spacing.lg,
      marginTop: spacing.sm,
    },
    passwordDisplay: {
      alignItems: 'center',
      flexDirection: 'row',
      marginBottom: spacing.sm,
    },
    passwordText: {
      backgroundColor: colors.primaryBackground,
      borderColor: colors.borderColor,
      borderRadius: radius.md,
      borderWidth: 1,
      color: colors.secondary,
      flex: 1,
      fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace',
      fontSize: 16,
      minHeight: 20,
      padding: spacing.sm,
    },
  });
}

// Default export for backward compatibility (light mode)
export const cardStyles = getCardStyles('light'); 