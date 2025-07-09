import React from 'react';
import { AddCredential2 } from '../AddCredential2';
import { MemoryRouter } from 'react-router-dom';
import { LightThemeProvider, DarkThemeProvider } from '@app/components/storybook/ThemeProviders';

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
  <LightThemeProvider>
    <AddCredential2 title="Example Credential" onSuccess={() => {}} />
  </LightThemeProvider>
);

export const Dark = () => (
  <DarkThemeProvider>
    <AddCredential2 title="Example Credential" onSuccess={() => {}} />
  </DarkThemeProvider>
); 