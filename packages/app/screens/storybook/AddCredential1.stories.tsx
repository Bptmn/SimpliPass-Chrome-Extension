import React from 'react';
import AddCredential1 from '../AddCredential1';
import { MemoryRouter } from 'react-router-dom';

export default {
  title: 'Pages/AddCredential1',
  component: AddCredential1,
  decorators: [
    (Story: React.FC) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export const Default = () => <AddCredential1 />; 