import React from 'react';
import { View } from 'react-native';
import NavBar from '../NavBar';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@app/core/logic/theme';

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
  <ThemeProvider>
    <View style={{ padding: 20 }}>
      <NavBar />
    </View>
  </ThemeProvider>
);

export const DefaultDark = () => (
  <ThemeProvider>
    <View style={{ padding: 20, backgroundColor: '#282c30', minHeight: 100 }}>
      <NavBar />
    </View>
  </ThemeProvider>
); 