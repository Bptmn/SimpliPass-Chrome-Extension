import React from 'react';
import { View } from 'react-native';
import { ModeSwitch } from '../ModeSwitch';
import { ThemeProvider } from '@app/core/logic/theme';

export default {
  title: 'Components/ModeSwitch',
  component: ModeSwitch,
};

export const Default = () => (
  <ThemeProvider>
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: 120 }}>
      <ModeSwitch />
    </View>
  </ThemeProvider>
);

export const DefaultDark = () => (
  <ThemeProvider>
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: 120, backgroundColor: '#282c30' }}>
      <ModeSwitch />
    </View>
  </ThemeProvider>
); 