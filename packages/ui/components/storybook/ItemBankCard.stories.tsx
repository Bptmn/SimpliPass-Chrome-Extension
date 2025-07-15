import React from 'react';
import { View } from 'react-native';
import ItemBankCard from '../ItemBankCard';
import { BankCardDecrypted } from '@common/core/types/items.types';
import { LightThemeProvider, DarkThemeProvider } from './ThemeProviders';
import { spacing } from '@ui/design/layout';

export default {
  title: 'Components/ItemBankCard',
  component: ItemBankCard,
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

const CardWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LightThemeProvider>
    <View style={{ padding: spacing.lg }}>
      {children}
    </View>
  </LightThemeProvider>
);

const DarkCardWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DarkThemeProvider>
    <View style={{ padding: spacing.lg }}>
      {children}
    </View>
  </DarkThemeProvider>
);

export const Default = () => (
  <CardWrapper>
    <ItemBankCard cred={mockBankCard} />
  </CardWrapper>
);

export const DefaultDark = () => (
  <DarkCardWrapper>
    <ItemBankCard cred={mockBankCard} />
  </DarkCardWrapper>
); 