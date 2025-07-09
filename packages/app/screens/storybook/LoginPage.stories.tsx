import React from 'react';
import LoginPage from '../LoginPage';
import { MemoryRouter } from 'react-router-dom';
import { LightScreenThemeProvider, DarkScreenThemeProvider } from '@app/components/storybook/ThemeProviders';

export default {
  title: 'Pages/LoginPage',
  component: LoginPage,
};

export const Default = () => (
  <LightScreenThemeProvider>
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  </LightScreenThemeProvider>
);

export const Dark = () => (
  <DarkScreenThemeProvider>
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  </DarkScreenThemeProvider>
); 