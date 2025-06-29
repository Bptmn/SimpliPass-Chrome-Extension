import React from 'react';
import { HomePage } from '../popup/pages/HomePage';
import { UserProvider } from '../hooks/useUser';

const mockUser = {
  uid: '1',
  email: 'user@example.com',
};

export default {
  title: 'Pages/HomePage',
  component: HomePage,
};

export const Default = () => (
  <UserProvider value={mockUser}>
    <HomePage user={mockUser} pageState={null} suggestions={[]} onInjectCredential={() => {}} />
  </UserProvider>
); 