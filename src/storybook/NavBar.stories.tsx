import React from 'react';
import NavBar from '../popup/components/NavBar';
import { MemoryRouter } from 'react-router-dom';

export default {
  title: 'Components/NavBar',
  component: NavBar,
  decorators: [
    (Story: React.FC) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export const Default = () => <NavBar />; 