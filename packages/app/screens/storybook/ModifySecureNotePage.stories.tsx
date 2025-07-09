import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ModifySecureNotePage } from '../ModifySecureNotePage';
import { SecureNoteDecrypted } from '@app/core/types/types';
import { LightThemeProvider, DarkThemeProvider } from '@app/components/storybook/ThemeProviders';

const mockNote: SecureNoteDecrypted = {
  createdDateTime: new Date(),
  lastUseDateTime: new Date(),
  title: 'Code alarme maison',
  note: 'Code : 1234#\nNe pas partager.',
  color: '#43a047',
  itemKey: 'mock-key',
  id: 'mock-id',
};

export default {
  title: 'Pages/ModifySecureNotePage',
  component: ModifySecureNotePage,
};

export const Default = () => (
  <LightThemeProvider>
    <MemoryRouter initialEntries={[{ pathname: '/modify-secure-note', state: { note: mockNote } }]}> 
      <Routes>
        <Route path="/modify-secure-note" element={<ModifySecureNotePage />} />
      </Routes>
    </MemoryRouter>
  </LightThemeProvider>
);

export const Dark = () => (
  <DarkThemeProvider>
    <MemoryRouter initialEntries={[{ pathname: '/modify-secure-note', state: { note: mockNote } }]}> 
      <Routes>
        <Route path="/modify-secure-note" element={<ModifySecureNotePage />} />
      </Routes>
    </MemoryRouter>
  </DarkThemeProvider>
); 