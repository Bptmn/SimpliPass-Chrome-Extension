import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { SecureNoteDetailsPage } from '../SecureNoteDetailsPage';
import { SecureNoteDecrypted } from '@common/core/types/items.types';
import { LightScreenThemeProvider, DarkScreenThemeProvider } from '@ui/components/storybook/ThemeProviders';

export default {
  title: 'Pages/SecureNoteDetailsPage',
  component: SecureNoteDetailsPage,
};

const mockSecureNote: SecureNoteDecrypted = {
  id: '1',
  itemType: 'secureNote',
  createdDateTime: new Date(),
  lastUseDateTime: new Date(),
  title: 'WiFi Password',
  note: 'Network: MyWiFi\nPassword: mypassword123',
  color: '#007AFF',
  itemKey: 'mock-key',
};

export const Default = () => (
  <LightScreenThemeProvider>
    <MemoryRouter>
      <SecureNoteDetailsPage note={mockSecureNote} onBack={() => {}} />
    </MemoryRouter>
  </LightScreenThemeProvider>
);

export const Dark = () => (
  <DarkScreenThemeProvider>
    <MemoryRouter>
      <SecureNoteDetailsPage note={mockSecureNote} onBack={() => {}} />
    </MemoryRouter>
  </DarkScreenThemeProvider>
); 