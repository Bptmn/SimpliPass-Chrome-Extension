import React from 'react';
import { ItemBankCard } from '../ItemBankCard';
import { BankCardDecrypted } from '@app/core/types/types';

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
  expirationDate: new Date(2030, 0, 1),
  verificationNumber: '123',
  bankName: 'Placeholder Bank',
  bankDomain: 'placeholder.com',
  createdDateTime: new Date(),
  lastUseDateTime: new Date(),
};

export const Default = () => <ItemBankCard cred={mockCard} />; 