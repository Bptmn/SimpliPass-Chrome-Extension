import React from 'react';
import { CredentialDetailsPage } from '../popup/pages/CredentialDetailsPage';
import { CredentialDecrypted } from 'types/types';

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
  document_reference: null,
};

export const Default = () => (
  <CredentialDetailsPage credential={mockCredential} onBack={() => {}} />
); 