import React from 'react';
import { View } from 'react-native';
import { ThemeProvider } from '@app/components';
import { getPageStyles } from '@design/layout';

// Theme providers for COMPONENTS (with wrappers for background/layout)
export const DarkThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pageStyles = getPageStyles('dark');
  
  return (
    <ThemeProvider mode="dark">
      <View style={[pageStyles.pageContainer, { width: '100%' }]}>
        <View style={[pageStyles.pageContent, { width: '100%' }]}>
          {children}
        </View>
      </View>
    </ThemeProvider>
  );
};

export const LightThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pageStyles = getPageStyles('light');
  
  return (
    <ThemeProvider mode="light">
      <View style={[pageStyles.pageContainer, { width: '100%' }]}>
        <View style={[pageStyles.pageContent, { width: '100%' }]}>
          {children}
        </View>
      </View>
    </ThemeProvider>
  );
};

// Theme providers for SCREENS (without wrappers - screens handle their own layout)
export const DarkScreenThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider mode="dark">
      {children}
    </ThemeProvider>
  );
};

export const LightScreenThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider mode="light">
      {children}
    </ThemeProvider>
  );
}; 