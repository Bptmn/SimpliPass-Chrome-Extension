import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ModifySecureNotePage } from '../ModifySecureNotePage';
import { SecureNoteDecrypted } from '@common/core/types/items.types';
import { DarkScreenThemeProvider } from '@ui/components/storybook/ThemeProviders';

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

export default {
  title: 'Pages/ModifySecureNotePage',
  component: ModifySecureNotePage,
};

export const Default = () => (
  <ModifySecureNotePage secureNote={mockSecureNote} onBack={() => {}} />
);

export const Dark = () => (
  <DarkScreenThemeProvider>
    <MemoryRouter initialEntries={[{ pathname: '/modify-secure-note', state: { note: mockSecureNote } }]}> 
      <Routes>
        <Route path="/modify-secure-note" element={<ModifySecureNotePage secureNote={mockSecureNote} onBack={() => {}} />} />
      </Routes>
    </MemoryRouter>
  </DarkScreenThemeProvider>
); 