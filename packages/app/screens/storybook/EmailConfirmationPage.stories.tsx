import React from 'react';
import { EmailConfirmationPage } from '../EmailConfirmationPage';
import { MemoryRouter } from 'react-router-dom';

export default {
  title: 'Pages/EmailConfirmationPage',
  component: EmailConfirmationPage,
};

export const Default = () => (
  <MemoryRouter>
    <EmailConfirmationPage
      email="user@example.com"
      onConfirm={() => {}}
      onResend={() => {}}
    />
  </MemoryRouter>
); 