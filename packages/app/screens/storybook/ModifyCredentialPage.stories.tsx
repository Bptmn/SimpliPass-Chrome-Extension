import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ModifyCredentialPage } from '../ModifyCredentialPage';
import { CredentialDecrypted } from '@app/core/types/types';
import { LightScreenThemeProvider, DarkScreenThemeProvider } from '@app/components/storybook/ThemeProviders';

const mockCredential: CredentialDecrypted = {
  createdDateTime: new Date(),
  lastUseDateTime: new Date(),
  title: 'Compte Google',
  username: 'user@gmail.com',
  password: 'password123',
  url: 'https://google.com',
  note: 'Note de test',
  itemKey: 'mock-key',
  id: 'mock-id',
};

export default {
  title: 'Pages/ModifyCredentialPage',
  component: ModifyCredentialPage,
};

export const Default = () => (
  <LightScreenThemeProvider>
    <MemoryRouter initialEntries={[{ pathname: '/modify-credential', state: { credential: mockCredential } }]}> 
      <Routes>
        <Route path="/modify-credential" element={<ModifyCredentialPage />} />
      </Routes>
    </MemoryRouter>
  </LightScreenThemeProvider>
);

export const Dark = () => (
  <DarkScreenThemeProvider>
    <MemoryRouter initialEntries={[{ pathname: '/modify-credential', state: { credential: mockCredential } }]}> 
      <Routes>
        <Route path="/modify-credential" element={<ModifyCredentialPage />} />
      </Routes>
    </MemoryRouter>
  </DarkScreenThemeProvider>
); 