import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useThemeMode } from '@app/core/logic/theme';
import { colors, getColors } from '@design/colors';
import { Icon } from './Icon';

export const ModeSwitch: React.FC = () => {
  const { mode, setMode } = useThemeMode();
  const colors = getColors(mode);

  return (
    <View style={[styles.container]}
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
    borderRadius: 18,
    borderWidth: 1,
    height: 60,
    width: '90%',
    padding: 6,
    backgroundColor: colors.secondaryBackground,
    borderColor: colors.borderColor,
  },
  option: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    marginHorizontal: 3,
    height: '100%',
  },
  optionActive: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  optionInactive: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  optionTextActiveLight: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
    color: colors.secondary,
  },
  optionTextActiveDark: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
    color: colors.primary,
  },
  optionTextInactive: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
    color: colors.tertiary,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
});

export default ModeSwitch; 