import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ModifyBankCardPage } from '../ModifyBankCardPage';
import { BankCardDecrypted } from '@common/core/types/items.types';
import { DarkScreenThemeProvider } from '@ui/components/storybook/ThemeProviders';

const mockBankCard: BankCardDecrypted = {
  id: '1',
  itemType: 'bankCard',
  createdDateTime: new Date(),
  lastUseDateTime: new Date(),
  title: 'Chase Credit Card',
  owner: 'John Doe',
  cardNumber: '4111111111111111',
  expirationDate: { month: 12, year: 2025 },
  verificationNumber: '123',
  bankName: 'Chase Bank',
  bankDomain: 'chase.com',
  note: 'Primary credit card',
  color: '#007AFF',
  itemKey: 'mock-key',
};

export default {
  title: 'Pages/ModifyBankCardPage',
  component: ModifyBankCardPage,
};

export const Default = () => (
  <ModifyBankCardPage bankCard={mockBankCard} onBack={() => {}} />
);

export const Dark = () => (
  <DarkScreenThemeProvider>
    <MemoryRouter initialEntries={[{ pathname: '/modify-bank-card', state: { cred: mockBankCard } }]}> 
      <Routes>
        <Route path="/modify-bank-card" element={<ModifyBankCardPage bankCard={mockBankCard} onBack={() => {}} />} />
      </Routes>
    </MemoryRouter>
  </DarkScreenThemeProvider>
); 