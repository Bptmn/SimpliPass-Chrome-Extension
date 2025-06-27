import React from 'react';
import { HelperBar } from 'shared/components/ui/HelperBar';
import { MemoryRouter } from 'react-router-dom';

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

export const Default = () => <HelperBar />;
