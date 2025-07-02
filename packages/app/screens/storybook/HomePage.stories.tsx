import React, { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from '../HomePage';
import { UserProvider } from '../../hooks/useUser';
import { useUserStore } from '../../core/states/user';

const mockUser = {
  uid: '1',
  email: 'user@example.com',
};

export default {
  title: 'Pages/HomePage',
  component: HomePage,
};

export const Default = () => {
  useEffect(() => {
    useUserStore.getState().setUser(mockUser);
  }, []);
  return (
    <MemoryRouter>
      <UserProvider value={mockUser}>
        <HomePage user={mockUser} pageState={null} onInjectCredential={() => {}} />
      </UserProvider>
    </MemoryRouter>
  );
}; 