import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { BankCardDetailsPage } from '../BankCardDetailsPage';
import { BankCardDecrypted } from '@common/core/types/items.types';
import { LightScreenThemeProvider, DarkScreenThemeProvider } from '@ui/components/storybook/ThemeProviders';

export default {
  title: 'Pages/BankCardDetailsPage',
  component: BankCardDetailsPage,
};

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

export const Default = () => (
  <LightScreenThemeProvider>
    <MemoryRouter>
      <BankCardDetailsPage card={mockBankCard} onBack={() => {}} />
    </MemoryRouter>
  </LightScreenThemeProvider>
);

export const Dark = () => (
  <DarkScreenThemeProvider>
    <MemoryRouter>
      <BankCardDetailsPage card={mockBankCard} onBack={() => {}} />
    </MemoryRouter>
  </DarkScreenThemeProvider>
); 