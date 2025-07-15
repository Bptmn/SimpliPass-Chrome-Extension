import React from 'react';
import { View } from 'react-native';
import CopyButton from '../CopyButton';
import { ThemeProvider } from '@common/core/logic/theme';
import { spacing } from '@ui/design/layout';

export default {
  title: 'components/CopyButton',
  component: CopyButton,
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
  <LightThemeProvider>
    <CopyButton textToCopy="Text to copy" onClick={() => console.log('Copy clicked')} />
  </LightThemeProvider>
);

export const DefaultDark = () => (
  <DarkThemeProvider>
    <CopyButton textToCopy="Text to copy" onClick={() => console.log('Copy clicked')} />
  </DarkThemeProvider>
);