import React from 'react';
import LoginPage from 'features/*/components/LoginPage';
import { MemoryRouter } from 'react-router-dom';

export default {
  title: 'Pages/LoginPage',
  component: LoginPage,
  decorators: [
    (Story: React.FC) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export const Default = () => <LoginPage />;
