import React from 'react';
import { View } from 'react-native';
import CopyButton from '../CopyButton';
import { ThemeProvider } from '@ui/design/theme';
import { useThemeStorage } from '@common/hooks/useThemeStorage';

// Mock the useThemeStorage hook for storybook
const MockThemeProvider: React.FC<{ children: React.ReactNode; mode?: 'light' | 'dark' }> = ({ children, mode }) => {
  const { setStoredTheme } = useThemeStorage();
  
  React.useEffect(() => {
    if (mode) {
      setStoredTheme(mode);
    }
  }, [mode, setStoredTheme]);

  return (
    <ThemeProvider mode={mode}>
      {children}
    </ThemeProvider>
  );
};

export default {
  title: 'Components/CopyButton',
  component: CopyButton,
  decorators: [
    (Story: React.ComponentType) => (
      <MockThemeProvider mode="dark">
        <View style={{ padding: 20, backgroundColor: '#1a1a1a' }}>
          <Story />
        </View>
      </MockThemeProvider>
    ),
  ],
};

export const DarkMode = () => <CopyButton textToCopy="test@example.com" />;

export const LightMode = () => (
  <MockThemeProvider mode="light">
    <View style={{ padding: 20, backgroundColor: '#ffffff' }}>
      <CopyButton textToCopy="test@example.com" />
    </View>
  </MockThemeProvider>
);