import React from 'react';
import { HelperBar } from '../HelperBar';
import { MemoryRouter } from 'react-router-dom';
import { useUserStore } from '@app/core/states/user';
import { useCategoryStore } from '@app/core/states';

// Mock component to set up store state
const HelperBarWithMocks: React.FC = () => {
  const setUser = useUserStore((state) => state.setUser);
  const setCurrentCategory = useCategoryStore((state) => state.setCurrentCategory);

  React.useEffect(() => {
    // Set up mock user data
    setUser({
      uid: 'mock-user-id',
      email: 'test@example.com',
      created_time: new Date() as any, // Mock timestamp
      salt: 'mock-salt',
    });
    
    // Set up mock category
    setCurrentCategory('credentials');
  }, [setUser, setCurrentCategory]);

  return <HelperBar />;
};

export default {
  title: 'Components/HelperBar',
  component: HelperBar,
  decorators: [
    (Story: React.FC) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export const Default = () => <HelperBarWithMocks />;

export const WithCredentialsCategory = () => {
  const setCurrentCategory = useCategoryStore((state) => state.setCurrentCategory);
  
  React.useEffect(() => {
    setCurrentCategory('credentials');
  }, [setCurrentCategory]);
  
  return <HelperBarWithMocks />;
};

export const WithBankCardsCategory = () => {
  const setCurrentCategory = useCategoryStore((state) => state.setCurrentCategory);
  
  React.useEffect(() => {
    setCurrentCategory('bankCards');
  }, [setCurrentCategory]);
  
  return <HelperBarWithMocks />;
};

export const WithSecureNotesCategory = () => {
  const setCurrentCategory = useCategoryStore((state) => state.setCurrentCategory);
  
  React.useEffect(() => {
    setCurrentCategory('secureNotes');
  }, [setCurrentCategory]);
  
  return <HelperBarWithMocks />;
}; 