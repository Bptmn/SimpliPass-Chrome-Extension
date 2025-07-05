import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { BankCardDetailsPage } from '../BankCardDetailsPage';
import { BankCardDecrypted } from '@app/core/types/types';

export default {
  title: 'Pages/BankCardDetailsPage',
  component: BankCardDetailsPage,
};

const mockCard: BankCardDecrypted = {
  createdDateTime: new Date('2023-01-01T10:00:00Z'),
  lastUseDateTime: new Date('2023-06-01T12:00:00Z'),
  title: 'Carte Visa Pro',
  owner: 'Jean Dupont',
  note: 'Carte professionnelle principale',
  color: '#1976d2',
  itemKey: 'mock-key',
  cardNumber: '4111 1111 1111 1111',
  expirationDate: new Date('2026-12-31T00:00:00Z'),
  verificationNumber: '123',
  bankName: 'BNP Paribas',
  bankDomain: 'bnp.fr',
  id: 'mock-id',
};

export const Default = () => (
  <MemoryRouter>
    <BankCardDetailsPage card={mockCard} onBack={() => {}} />
  </MemoryRouter>
); 