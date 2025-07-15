import React from 'react';
import { SettingsPage } from '../SettingsPage';
import { MemoryRouter } from 'react-router-dom';
import { LightScreenThemeProvider, DarkScreenThemeProvider } from '@ui/components/storybook/ThemeProviders';

export default {
  title: 'Pages/SettingsPage',
  component: SettingsPage,
};

export const Default = () => (
  <LightScreenThemeProvider>
    <MemoryRouter>
      <SettingsPage />
    </MemoryRouter>
  </LightScreenThemeProvider>
);

export const Dark = () => (
  <DarkScreenThemeProvider>
    <MemoryRouter>
      <SettingsPage />
    </MemoryRouter>
  </DarkScreenThemeProvider>
); 