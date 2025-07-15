import React from 'react';
import { GeneratorPage } from '../GeneratorPage';
import { LightScreenThemeProvider, DarkScreenThemeProvider } from '@ui/components/storybook/ThemeProviders';

export default {
  title: 'Pages/GeneratorPage',
  component: GeneratorPage,
};

export const Default = () => (
  <LightScreenThemeProvider>
    <GeneratorPage onBack={() => {}} />
  </LightScreenThemeProvider>
);

export const Dark = () => (
  <DarkScreenThemeProvider>
    <GeneratorPage onBack={() => {}} />
  </DarkScreenThemeProvider>
); 