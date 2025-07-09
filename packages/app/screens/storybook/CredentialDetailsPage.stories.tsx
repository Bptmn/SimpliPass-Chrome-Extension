import React from 'react';
import { CredentialDetailsPage } from '../CredentialDetailsPage';
import { CredentialDecrypted } from '@app/core/types/types';
import { MemoryRouter } from 'react-router-dom';
import { LightScreenThemeProvider, DarkScreenThemeProvider } from '@app/components/storybook/ThemeProviders';

export default {
  title: 'Pages/CredentialDetailsPage',
  component: CredentialDetailsPage,
};

const mockCredential: CredentialDecrypted = {
  createdDateTime: new Date(),
  lastUseDateTime: new Date(),
  title: 'Facebook',
  username: 'user@facebook.com',
  password: 'password123',
  note: 'Personal account',
  url: 'facebook.com',
  itemKey: 'mockItemKey',
  id: 'mock-id',
};

export const Default = () => (
  <LightScreenThemeProvider>
    <MemoryRouter>
      <CredentialDetailsPage credential={mockCredential} onBack={() => {}} />
    </MemoryRouter>
  </LightScreenThemeProvider>
);

export const Dark = () => (
  <DarkScreenThemeProvider>
    <MemoryRouter>
      <CredentialDetailsPage credential={mockCredential} onBack={() => {}} />
    </MemoryRouter>
  </DarkScreenThemeProvider>
); 