import React from 'react';
import AddSecureNote from '../AddSecureNote';
import { MemoryRouter } from 'react-router-dom';
import { LightScreenThemeProvider, DarkScreenThemeProvider } from '@app/components/storybook/ThemeProviders';

export default {
  title: 'Pages/AddSecureNote',
  component: AddSecureNote,
};

export const Default = () => (
  <LightScreenThemeProvider>
    <MemoryRouter>
      <AddSecureNote />
    </MemoryRouter>
  </LightScreenThemeProvider>
);

export const Dark = () => (
  <DarkScreenThemeProvider>
    <MemoryRouter>
      <AddSecureNote />
    </MemoryRouter>
  </DarkScreenThemeProvider>
); 