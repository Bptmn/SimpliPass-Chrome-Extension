import React from 'react';
import { AddCredential2 } from '../AddCredential2';
import { MemoryRouter } from 'react-router-dom';
import { LightScreenThemeProvider, DarkScreenThemeProvider } from '@ui/components/storybook/ThemeProviders';

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

export const Default = () => (
  <LightScreenThemeProvider>
    <AddCredential2 title="Example Credential" onSuccess={() => {}} />
  </LightScreenThemeProvider>
);

export const Dark = () => (
  <DarkScreenThemeProvider>
    <AddCredential2 title="Example Credential" onSuccess={() => {}} />
  </DarkScreenThemeProvider>
); 