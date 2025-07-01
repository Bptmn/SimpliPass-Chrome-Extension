import React from 'react';
import { CredentialCard } from '../CredentialCard';
import { CredentialFromVaultDb } from '@app/core/types/types';

export default {
  title: 'Components/CredentialCard',
  component: CredentialCard,
};

const mockCred: CredentialFromVaultDb = {
  id: '1',
  title: 'Facebook',
  username: 'user@facebook.com',
  itemKeyCipher: 'cipher',
  passwordCipher: 'cipher',
  url: 'facebook.com',
  note: 'Personal account',
};

export const Default = () => (
  <CredentialCard cred={mockCred} />
); 