import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ModifyBankCardPage } from '../ModifyBankCardPage';
import { BankCardDecrypted } from '@app/core/types/types';
import { LightThemeProvider, DarkThemeProvider } from '@app/components/storybook/ThemeProviders';

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

export default {
  title: 'Pages/ModifyBankCardPage',
  component: ModifyBankCardPage,
};

export const Default = () => (
  <LightThemeProvider>
    <MemoryRouter initialEntries={[{ pathname: '/modify-bank-card', state: { cred: mockCard } }]}> 
      <Routes>
        <Route path="/modify-bank-card" element={<ModifyBankCardPage />} />
      </Routes>
    </MemoryRouter>
  </LightThemeProvider>
);

export const Dark = () => (
  <DarkThemeProvider>
    <MemoryRouter initialEntries={[{ pathname: '/modify-bank-card', state: { cred: mockCard } }]}> 
      <Routes>
        <Route path="/modify-bank-card" element={<ModifyBankCardPage />} />
      </Routes>
    </MemoryRouter>
  </DarkThemeProvider>
); 