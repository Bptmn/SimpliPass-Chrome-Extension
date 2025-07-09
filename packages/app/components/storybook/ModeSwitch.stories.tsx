import React from 'react';
import { View } from 'react-native';
import { ModeSwitch } from '../ModeSwitch';
import { LightThemeProvider, DarkThemeProvider } from './ThemeProviders';

export default {
  title: 'Components/ModeSwitch',
  component: ModeSwitch,
};

export const Default = () => (
  <LightThemeProvider>
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: 120 }}>
      <ModeSwitch />
    </View>
  </LightThemeProvider>
);

export const DefaultDark = () => (
  <DarkThemeProvider>
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: 120 }}>
      <ModeSwitch />
    </View>
  </DarkThemeProvider>
); 