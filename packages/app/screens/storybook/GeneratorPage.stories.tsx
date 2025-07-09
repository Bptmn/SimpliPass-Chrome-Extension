import React from 'react';
import { GeneratorPage } from '../GeneratorPage';
import { LightThemeProvider, DarkThemeProvider } from '@app/components/storybook/ThemeProviders';

export default {
  title: 'Pages/GeneratorPage',
  component: GeneratorPage,
};

export const Default = () => (
  <LightThemeProvider>
    <GeneratorPage />
  </LightThemeProvider>
);

export const Dark = () => (
  <DarkThemeProvider>
    <GeneratorPage />
  </DarkThemeProvider>
); 