import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { BankCardDetailsPage } from '../BankCardDetailsPage';
import { BankCardDecrypted } from '@app/core/types/types';
import { LightScreenThemeProvider, DarkScreenThemeProvider } from '@app/components/storybook/ThemeProviders';

export default {
  title: 'Pages/BankCardDetailsPage',
  component: BankCardDetailsPage,
};

const mockCard: BankCardDecrypted = {
  id: 'card1',
  title: 'Title',
  owner: 'Owner',
  note: '',
  color: '#5B8CA9',
  itemKey: 'key',
  cardNumber: '1234567890000000',
  expirationDate: { month: 1, year: 2030 },
  verificationNumber: '123',
  bankName: 'Placeholder Bank',
  bankDomain: 'placeholder.com',
  createdDateTime: new Date(),
  lastUseDateTime: new Date(),
};

export const Default = () => (
  <LightScreenThemeProvider>
    <MemoryRouter>
      <BankCardDetailsPage card={mockCard} onBack={() => {}} />
    </MemoryRouter>
  </LightScreenThemeProvider>
);

export const Dark = () => (
  <DarkScreenThemeProvider>
    <MemoryRouter>
      <BankCardDetailsPage card={mockCard} onBack={() => {}} />
    </MemoryRouter>
  </DarkScreenThemeProvider>
); 