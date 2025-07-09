import React from 'react';
import AddCredential1 from '../AddCredential1';
import { MemoryRouter } from 'react-router-dom';
import { LightScreenThemeProvider, DarkScreenThemeProvider } from '@app/components/storybook/ThemeProviders';

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

export const Default = () => (
  <LightScreenThemeProvider>
    <AddCredential1 />
  </LightScreenThemeProvider>
);

export const Dark = () => (
  <DarkScreenThemeProvider>
    <AddCredential1 />
  </DarkScreenThemeProvider>
); 