import React from 'react';
import { EmailConfirmationPage } from 'features/*/components/EmailConfirmationPage';

export default {
  title: 'Pages/EmailConfirmationPage',
  component: EmailConfirmationPage,
};

export const Default = () => (
  <EmailConfirmationPage email="user@example.com" onConfirm={() => {}} onResend={() => {}} />
);
