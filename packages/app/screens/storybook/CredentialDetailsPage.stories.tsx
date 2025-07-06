import React from 'react';
import { CredentialDetailsPage } from '../CredentialDetailsPage';
import { CredentialDecrypted } from '@app/core/types/types';
import { MemoryRouter } from 'react-router-dom';

export default {
  title: 'Pages/CredentialDetailsPage',
  component: CredentialDetailsPage,
};

const mockCredential: CredentialDecrypted = {
  createdDateTime: new Date(),
  lastUseDateTime: new Date(),
  title: 'Facebook',
  username: 'user@facebook.com',
  password: 'password123',
  note: 'Personal account',
  url: 'facebook.com',
  itemKey: 'mockItemKey',
  id: 'mock-id',
};

export const Default = () => (
  <MemoryRouter>
    <CredentialDetailsPage credential={mockCredential} onBack={() => {}} />
  </MemoryRouter>
); 