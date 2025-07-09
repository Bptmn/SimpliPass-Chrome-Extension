import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ModifyCredentialPage } from '../ModifyCredentialPage';
import { CredentialDecrypted } from '@app/core/types/types';
import { LightThemeProvider, DarkThemeProvider } from '@app/components/storybook/ThemeProviders';

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
  <LightThemeProvider>
    <MemoryRouter initialEntries={[{ pathname: '/modify-credential', state: { credential: mockCredential } }]}> 
      <Routes>
        <Route path="/modify-credential" element={<ModifyCredentialPage />} />
      </Routes>
    </MemoryRouter>
  </LightThemeProvider>
);

export const Dark = () => (
  <DarkThemeProvider>
    <MemoryRouter initialEntries={[{ pathname: '/modify-credential', state: { credential: mockCredential } }]}> 
      <Routes>
        <Route path="/modify-credential" element={<ModifyCredentialPage />} />
      </Routes>
    </MemoryRouter>
  </DarkThemeProvider>
); 