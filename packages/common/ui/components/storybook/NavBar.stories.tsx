import React from 'react';
import { View } from 'react-native';
import NavBar from '../NavBar';
import { MemoryRouter } from 'react-router-dom';
import { LightThemeProvider, DarkThemeProvider } from './ThemeProviders';

export default {
  title: 'Components/NavBar',
  component: NavBar,
  decorators: [
    (Story: React.FC) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export const Default = () => (
  <LightThemeProvider>
    <View style={{ padding: 20 }}>
      <NavBar />
    </View>
  </LightThemeProvider>
);

export const DefaultDark = () => (
  <DarkThemeProvider>
    <View style={{ padding: 20 }}>
      <NavBar />
    </View>
  </DarkThemeProvider>
); 