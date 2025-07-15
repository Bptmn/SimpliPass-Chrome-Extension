import React from 'react';
import { CredentialDetailsPage } from '../CredentialDetailsPage';
import { CredentialDecrypted } from '@common/core/types/items.types';
import { MemoryRouter } from 'react-router-dom';
import { LightScreenThemeProvider, DarkScreenThemeProvider } from '@ui/components/storybook/ThemeProviders';

export default {
  title: 'Pages/CredentialDetailsPage',
  component: CredentialDetailsPage,
};

const mockCredential: CredentialDecrypted = {
  id: '1',
  itemType: 'credential',
  createdDateTime: new Date(),
  lastUseDateTime: new Date(),
  title: 'Gmail Account',
  username: 'user@gmail.com',
  password: 'securepassword123',
  url: 'https://gmail.com',
  note: 'Personal email account',
  itemKey: 'mock-key',
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