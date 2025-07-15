import React from 'react';
import Toast from '../Toast';
import { LightThemeProvider, DarkThemeProvider } from './ThemeProviders';

export default {
  title: 'Components/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
  },
};

export const Default = () => (
  <LightThemeProvider>
    <Toast message="Message de succès" />
  </LightThemeProvider>
);

export const DefaultDark = () => (
  <DarkThemeProvider>
    <Toast message="Message de succès" />
  </DarkThemeProvider>
); 