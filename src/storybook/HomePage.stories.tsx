import React from 'react';
import { HomePage } from '../popup/pages/HomePage';
import { HomePageProps } from 'types/types';

export default {
  title: 'Pages/HomePage',
  component: HomePage,
};

const mockUser = {
  uid: '1',
  email: 'user@example.com',
};

export const Default = () => <HomePage user={mockUser} pageState={null} suggestions={[]} onInjectCredential={() => {}} />; 