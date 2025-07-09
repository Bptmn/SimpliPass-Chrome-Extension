import React from 'react';
import { EmailConfirmationPage } from '../EmailConfirmationPage';
import { MemoryRouter } from 'react-router-dom';
import { LightThemeProvider, DarkThemeProvider } from '@app/components/storybook/ThemeProviders';

export default {
  title: 'Pages/EmailConfirmationPage',
  component: EmailConfirmationPage,
};

export const Default = () => (
  <LightThemeProvider>
    <MemoryRouter>
      <EmailConfirmationPage
        email="user@example.com"
        onConfirm={() => {}}
        onResend={() => {}}
      />
    </MemoryRouter>
  </LightThemeProvider>
);

export const Dark = () => (
  <DarkThemeProvider>
    <MemoryRouter>
      <EmailConfirmationPage
        email="user@example.com"
        onConfirm={() => {}}
        onResend={() => {}}
      />
    </MemoryRouter>
  </DarkThemeProvider>
); 