import React from 'react';
import { CredentialCard } from '../CredentialCard';
import { CredentialDecrypted } from '@app/core/types/types';

export default {
  title: 'Components/CredentialCard',
  component: CredentialCard,
};

const mockCredential: CredentialDecrypted = {
  id: '1',
  title: 'Facebook',
  username: 'user@facebook.com',
  password: 'decrypted-password',
  url: 'facebook.com',
  note: 'Personal account',
  itemKey: 'decrypted-item-key',
  createdDateTime: new Date(),
  lastUseDateTime: new Date(),
};

export const Default = () => (
  <CredentialCard 
    credential={mockCredential} 
    onPress={() => console.log('Credential pressed')}
  />
); 