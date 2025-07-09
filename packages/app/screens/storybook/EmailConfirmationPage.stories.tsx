import React from 'react';
import { EmailConfirmationPage } from '../EmailConfirmationPage';
import { MemoryRouter } from 'react-router-dom';
import { LightScreenThemeProvider, DarkScreenThemeProvider } from '@app/components/storybook/ThemeProviders';

export default {
  title: 'Pages/EmailConfirmationPage',
  component: EmailConfirmationPage,
};

export const Default = () => (
  <LightScreenThemeProvider>
    <MemoryRouter>
      <EmailConfirmationPage
        email="user@example.com"
        onConfirm={() => {}}
        onResend={() => {}}
      />
    </MemoryRouter>
  </LightScreenThemeProvider>
);

export const Dark = () => (
  <DarkScreenThemeProvider>
    <MemoryRouter>
      <EmailConfirmationPage
        email="user@example.com"
        onConfirm={() => {}}
        onResend={() => {}}
      />
    </MemoryRouter>
  </DarkScreenThemeProvider>
); 