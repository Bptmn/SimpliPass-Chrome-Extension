import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ModifyCredentialPage } from '../ModifyCredentialPage';
import { CredentialDecrypted } from '@app/core/types/types';

const mockCredential: CredentialDecrypted = {
  createdDateTime: new Date(),
  lastUseDateTime: new Date(),
  title: 'Compte Google',
  username: 'user@gmail.com',
  password: 'password123',
  note: 'Note de test',
  url: 'https://google.com',
  itemKey: 'mockItemKey',
  id: 'mockId',
};

export default {
  title: 'Pages/ModifyCredentialPage',
  component: ModifyCredentialPage,
};

export const Default = () => (
  <MemoryRouter initialEntries={[{ pathname: '/modify', state: { credential: mockCredential } }]}> 
    <Routes>
      <Route path="/modify" element={<ModifyCredentialPage />} />
    </Routes>
  </MemoryRouter>
); 