import React from 'react';
import { View } from 'react-native';
import { HelperBar } from '../HelperBar';
import { ThemeProvider } from '@app/components';
import { spacing } from '@design/layout';
import { MemoryRouter } from 'react-router';

export default {
  title: 'components/HelperBar',
  component: HelperBar,
};

// Custom ThemeProvider that forces dark mode
const DarkThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Set dark mode immediately before rendering
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('simplipass_theme_mode', 'dark');
  }

  return (
    <ThemeProvider>
      <View style={{ padding: spacing.lg, minHeight: 200 }}>
        {children}
      </View>
    </ThemeProvider>
  );
};

// Custom ThemeProvider that forces light mode
const LightThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Set light mode immediately before rendering
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('simplipass_theme_mode', 'light');
  }

  return (
    <ThemeProvider>
      <View style={{ padding: spacing.lg }}>
        {children}
      </View>
    </ThemeProvider>
  );
};

export const Default = () => (
  <MemoryRouter>
    <LightThemeProvider>
      <HelperBar />
    </LightThemeProvider>
  </MemoryRouter>
);

export const DefaultDark = () => (
  <MemoryRouter>
    <DarkThemeProvider>
      <HelperBar />
    </DarkThemeProvider>
  </MemoryRouter>
); 