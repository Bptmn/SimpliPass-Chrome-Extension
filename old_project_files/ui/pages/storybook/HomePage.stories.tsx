import React from 'react';
import { HomePage } from '../HomePage';
import { MemoryRouter } from 'react-router-dom';
import { LightScreenThemeProvider, DarkScreenThemeProvider } from '@ui/components/storybook/ThemeProviders';

export default {
  title: 'Pages/HomePage',
  component: HomePage,
};

const mockProps = {
  user: { uid: '1', email: 'user@example.com' },
  pageState: null,
  onInjectCredential: () => {},
};

export const Default = () => (
  <LightScreenThemeProvider>
    <MemoryRouter>
      <HomePage {...mockProps} />
    </MemoryRouter>
  </LightScreenThemeProvider>
);

export const Dark = () => (
  <DarkScreenThemeProvider>
    <MemoryRouter>
      <HomePage {...mockProps} />
    </MemoryRouter>
  </DarkScreenThemeProvider>
); 