import React from 'react';
import { EmailConfirmationPage } from '../popup/pages/EmailConfirmationPage';

export default {
  title: 'Pages/EmailConfirmationPage',
  component: EmailConfirmationPage,
};

export const Default = () => (
  <EmailConfirmationPage email="user@example.com" onConfirm={() => {}} onResend={() => {}} />
); 