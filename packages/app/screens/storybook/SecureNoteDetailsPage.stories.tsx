import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { SecureNoteDetailsPage } from '../SecureNoteDetailsPage';
import { SecureNoteDecrypted } from '@app/core/types/types';
import { LightScreenThemeProvider, DarkScreenThemeProvider } from '@app/components/storybook/ThemeProviders';

export default {
  title: 'Pages/SecureNoteDetailsPage',
  component: SecureNoteDetailsPage,
};

const mockNote: SecureNoteDecrypted = {
  createdDateTime: new Date('2023-02-01T09:00:00Z'),
  lastUseDateTime: new Date('2023-06-10T15:00:00Z'),
  title: 'Code alarme maison',
  note: 'Code : 1234#\nNe pas partager.',
  color: '#43a047',
  itemKey: 'mock-key',
  id: 'mock-id',
};

export const Default = () => (
  <LightScreenThemeProvider>
    <MemoryRouter>
      <SecureNoteDetailsPage note={mockNote} onBack={() => {}} />
    </MemoryRouter>
  </LightScreenThemeProvider>
);

export const Dark = () => (
  <DarkScreenThemeProvider>
    <MemoryRouter>
      <SecureNoteDetailsPage note={mockNote} onBack={() => {}} />
    </MemoryRouter>
  </DarkScreenThemeProvider>
); 