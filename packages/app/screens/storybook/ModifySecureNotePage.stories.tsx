import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ModifySecureNotePage } from '../ModifySecureNotePage';
import { SecureNoteDecrypted } from '@app/core/types/types';

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
  <MemoryRouter initialEntries={[{ pathname: '/modify-secure-note', state: { note: mockNote } }]}> 
    <Routes>
      <Route path="/modify-secure-note" element={<ModifySecureNotePage />} />
    </Routes>
  </MemoryRouter>
); 