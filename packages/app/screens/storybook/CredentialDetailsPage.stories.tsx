import React from 'react';
import { CredentialDetailsPage } from '../CredentialDetailsPage';
import { CredentialDecrypted } from '@app/core/types/types';
import { MemoryRouter } from 'react-router-dom';
import { LightThemeProvider, DarkThemeProvider } from '@app/components/storybook/ThemeProviders';

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
  <LightThemeProvider>
    <MemoryRouter>
      <CredentialDetailsPage credential={mockCredential} onBack={() => {}} />
    </MemoryRouter>
  </LightThemeProvider>
);

export const Dark = () => (
  <DarkThemeProvider>
    <MemoryRouter>
      <CredentialDetailsPage credential={mockCredential} onBack={() => {}} />
    </MemoryRouter>
  </DarkThemeProvider>
); 