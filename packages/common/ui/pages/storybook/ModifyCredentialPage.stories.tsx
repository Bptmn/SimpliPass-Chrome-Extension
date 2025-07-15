import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ModifyCredentialPage } from '../ModifyCredentialPage';
import { CredentialDecrypted } from '@common/core/types/items.types';
import { DarkScreenThemeProvider } from '@ui/components/storybook/ThemeProviders';

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

export default {
  title: 'Pages/ModifyCredentialPage',
  component: ModifyCredentialPage,
};

export const Default = () => (
  <ModifyCredentialPage credential={mockCredential} onBack={() => {}} />
);

export const Dark = () => (
  <DarkScreenThemeProvider>
    <MemoryRouter initialEntries={[{ pathname: '/modify-credential', state: { cred: mockCredential } }]}> 
      <Routes>
        <Route path="/modify-credential" element={<ModifyCredentialPage credential={mockCredential} onBack={() => {}} />} />
      </Routes>
    </MemoryRouter>
  </DarkScreenThemeProvider>
); 