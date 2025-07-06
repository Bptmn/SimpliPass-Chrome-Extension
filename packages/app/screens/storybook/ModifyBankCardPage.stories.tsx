import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ModifyBankCardPage } from '../ModifyBankCardPage';
import { BankCardDecrypted } from '@app/core/types/types';

const mockCard: BankCardDecrypted = {
  createdDateTime: new Date(),
  lastUseDateTime: new Date(),
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

export default {
  title: 'Pages/ModifyBankCardPage',
  component: ModifyBankCardPage,
};

export const Default = () => (
  <MemoryRouter initialEntries={[{ pathname: '/modify-bank-card', state: { cred: mockCard } }]}> 
    <Routes>
      <Route path="/modify-bank-card" element={<ModifyBankCardPage />} />
    </Routes>
  </MemoryRouter>
); 