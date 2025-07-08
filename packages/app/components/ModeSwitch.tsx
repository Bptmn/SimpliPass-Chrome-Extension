import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useThemeMode } from '@app/core/logic/theme';
import { colors, getColors } from '@design/colors';
import { radius, spacing } from '@design/layout';
import { typography } from '@design/typography';
import { Icon } from './Icon';

export const ModeSwitch: React.FC = () => {
  const { mode, setMode } = useThemeMode();
  const colors = getColors(mode);

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
          <Icon name="sun" size={20} color={mode === 'light' ? colors.secondary : colors.tertiary} />
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
          <Icon name="moon" size={20} color={mode === 'dark' ? colors.primary : colors.tertiary} />
          <Text style={mode === 'dark' ? styles.optionTextActiveDark : styles.optionTextInactive}>Mode sombre</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.secondaryBackground,
    borderColor: colors.borderColor,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 50,
    padding: spacing.xs,
    width: '90%',
  },
  option: {
    alignItems: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    height: '100%',
    justifyContent: 'center',
    marginHorizontal: spacing.xs,
  },
  optionActive: {
    backgroundColor: colors.white,
    borderColor: colors.borderColor,
    borderWidth: 1,
  },
  optionInactive: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
  },

  optionTextActiveDark: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.xs,
  },
  optionTextActiveLight: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.xs,
  },
  optionTextInactive: {
    color: colors.tertiary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.xs,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
});

export default ModeSwitch; 