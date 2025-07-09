import React from 'react';
import { View } from 'react-native';
import ItemBankCard from '../ItemBankCard';
import { BankCardDecrypted } from '@app/core/types/types';
import { ThemeProvider } from '@app/core/logic/theme';
import { spacing } from '@design/layout';

export default {
  title: 'Components/ItemBankCard',
  component: ItemBankCard,
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

const CardWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <View style={{ padding: spacing.lg }}>
      {children}
    </View>
  </ThemeProvider>
);

const DarkCardWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <View style={{ padding: spacing.lg, backgroundColor: '#282c30', minHeight: 200 }}>
      {children}
    </View>
  </ThemeProvider>
);

export const Default = () => (
  <CardWrapper>
    <ItemBankCard cred={mockCard} />
  </CardWrapper>
);

export const DefaultDark = () => (
  <DarkCardWrapper>
    <ItemBankCard cred={mockCard} />
  </DarkCardWrapper>
); 