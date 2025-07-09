import React from 'react';
import { GeneratorPage } from '../GeneratorPage';
import { LightScreenThemeProvider, DarkScreenThemeProvider } from '@app/components/storybook/ThemeProviders';

export default {
  title: 'Pages/GeneratorPage',
  component: GeneratorPage,
};

export const Default = () => (
  <LightScreenThemeProvider>
    <GeneratorPage />
  </LightScreenThemeProvider>
);

export const Dark = () => (
  <DarkScreenThemeProvider>
    <GeneratorPage />
  </DarkScreenThemeProvider>
); 