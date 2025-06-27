import React from 'react';
import { NavBar } from 'shared/components/layout';
import { MemoryRouter } from 'react-router-dom';

export default {
  title: 'Components/Layout/NavBar',
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
