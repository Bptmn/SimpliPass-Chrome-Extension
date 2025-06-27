import React from 'react';
import { CredentialCard } from 'shared/components/ui/CredentialCard';
import { CredentialVaultDb } from 'types/types';

export default {
  title: 'Components/CredentialCard',
  component: CredentialCard,
};

const mockCred: CredentialVaultDb = {
  document_reference_id: '123',
  title: 'Facebook',
  username: 'user@facebook.com',
  itemKeyCipher: 'cipher',
  passwordCipher: 'cipher',
  url: 'facebook.com',
  note: 'Personal account',
};

export const Default = () => <CredentialCard cred={mockCred} />;
