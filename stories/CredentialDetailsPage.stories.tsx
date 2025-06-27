import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { CredentialDetailsPage } from 'features/*/components/CredentialDetailsPage';
import { CredentialDecrypted } from 'types/types';
import { DocumentReference } from 'firebase/firestore';

export default {
  title: 'Pages/CredentialDetailsPage',
  component: CredentialDetailsPage,
  decorators: [
    (Story: React.FC) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
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
  document_reference: { id: '123' } as DocumentReference,
};

export const Default = () => (
  <CredentialDetailsPage credential={mockCredential} onBack={() => {}} />
);
