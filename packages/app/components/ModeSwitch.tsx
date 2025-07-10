import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useThemeMode } from '@app/core/logic/theme';
import { getColors } from '@design/colors';
import { radius, spacing } from '@design/layout';
import { typography } from '@design/typography';
import { Icon } from './Icon';

export const ModeSwitch: React.FC = () => {
  const { mode, setMode } = useThemeMode();
  const themeColors = getColors(mode);

  // Dynamic styles
  const styles = {
    container: {
      backgroundColor: themeColors.secondaryBackground,
      borderColor: themeColors.borderColor,
      borderRadius: radius.lg,
      borderWidth: 1,
      height: 50,
      padding: spacing.xs,
      width: '90%',
    },
    option: {
      alignItems: 'center' as const,
      borderRadius: radius.md+2,
      borderWidth: 1,
      flex: 1,
      flexDirection: 'row' as const,
      gap: spacing.xs,
      height: '100%',
      justifyContent: 'center' as const,
      padding: spacing.xs,
    },
    optionActive: {
      backgroundColor: themeColors.white,
      borderColor: themeColors.borderColor,
      borderWidth: 1,
    },
    optionInactive: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
    },
    optionTextActiveDark: {
      color: themeColors.primary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
    },
    optionTextActiveLight: {
      color: themeColors.secondary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
    },
    optionTextInactive: {
      color: themeColors.tertiary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
    },
    row: {
      alignItems: 'center' as const,
      flexDirection: 'row' as const,
      flex: 1,
      justifyContent: 'space-between' as const,
    },
  };

  return (
    <View style={styles.container}
      testID="mode-switch-container"
      accessibilityLabel="Mode Switch Container"
    >
      <View style={styles.row}>
        <Pressable
          style={[
            styles.option,
            mode === 'light' ? styles.optionActive : styles.optionInactive,
          ]}
          onPress={() => setMode('light')}
          testID="light-mode-button"
          accessibilityLabel="Switch to light mode"
        >
          <Icon name="sun" size={20} color={mode === 'light' ? themeColors.secondary : themeColors.tertiary} />
          <Text style={mode === 'light' ? styles.optionTextActiveLight : styles.optionTextInactive}>Mode clair</Text>
        </Pressable>
        
        <Pressable
          style={[
            styles.option,
            mode === 'dark' ? styles.optionActive : styles.optionInactive,
          ]}
          onPress={() => setMode('dark')}
          testID="dark-mode-button"
          accessibilityLabel="Switch to dark mode"
        >
          <Icon name="moon" size={20} color={mode === 'dark' ? themeColors.primary : themeColors.tertiary} />
          <Text style={mode === 'dark' ? styles.optionTextActiveDark : styles.optionTextInactive}>Mode sombre</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ModeSwitch; 