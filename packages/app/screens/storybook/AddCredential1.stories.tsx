import React from 'react';
import AddCredential1 from '../AddCredential1';
import { MemoryRouter } from 'react-router-dom';
import { LightThemeProvider, DarkThemeProvider } from '@app/components/storybook/ThemeProviders';

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
  <LightThemeProvider>
    <AddCredential1 />
  </LightThemeProvider>
);

export const Dark = () => (
  <DarkThemeProvider>
    <AddCredential1 />
  </DarkThemeProvider>
); 