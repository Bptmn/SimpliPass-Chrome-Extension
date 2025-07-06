import React from 'react';
import { AddCredential2 } from '../AddCredential2';
import { MemoryRouter } from 'react-router-dom';

export default {
  title: 'Pages/AddCredential2',
  component: AddCredential2,
  decorators: [
    (Story: React.FC) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export const Default = () => <AddCredential2 title="Example Credential" onSuccess={() => {}} />; 