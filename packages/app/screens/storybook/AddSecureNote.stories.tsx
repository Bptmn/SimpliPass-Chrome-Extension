import React from 'react';
import AddSecureNote from '../AddSecureNote';
import { MemoryRouter } from 'react-router-dom';
import { LightThemeProvider, DarkThemeProvider } from '@app/components/storybook/ThemeProviders';

export default {
  title: 'Pages/AddSecureNote',
  component: AddSecureNote,
};

export const Default = () => (
  <LightThemeProvider>
    <MemoryRouter>
      <AddSecureNote />
    </MemoryRouter>
  </LightThemeProvider>
);

export const Dark = () => (
  <DarkThemeProvider>
    <MemoryRouter>
      <AddSecureNote />
    </MemoryRouter>
  </DarkThemeProvider>
); 