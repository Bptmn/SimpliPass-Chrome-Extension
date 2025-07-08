import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HomePage } from '../HomePage';
import { UserProvider } from '../../core/hooks/useUser';
import { useUserStore } from '../../core/states/user';
import { Timestamp } from 'firebase/firestore';

export default {
  title: 'Pages/HomePage',
  component: HomePage,
  parameters: {
    layout: 'fullscreen',
  },
};

const mockUser = {
  uid: '1',
  email: 'user@example.com',
  created_time: Timestamp.fromDate(new Date()),
  salt: 'mock-salt'
};

export const Default = () => {
  // Set up the user store
  useUserStore.getState().setUser(mockUser);
  
  return (
    <BrowserRouter>
      <UserProvider value={mockUser}>
        <HomePage 
          user={mockUser} 
          pageState={null} 
          onInjectCredential={() => {}} 
        />
      </UserProvider>
    </BrowserRouter>
  );
}; 