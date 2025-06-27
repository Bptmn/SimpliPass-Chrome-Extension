import React from 'react';
import { AddCredentialPage } from 'features/*/components/AddCredentialPage';
import { MemoryRouter } from 'react-router-dom';

export default {
  title: 'Pages/AddCredentialPage',
  component: AddCredentialPage,
  decorators: [
    (Story: React.FC) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export const Default = () => <AddCredentialPage link="https://example.com" onSuccess={() => {}} />;
