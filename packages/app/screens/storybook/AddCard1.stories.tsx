import React from 'react';
import AddCard1 from '../AddCard1';
import { MemoryRouter } from 'react-router-dom';
import { LightScreenThemeProvider, DarkScreenThemeProvider } from '@app/components/storybook/ThemeProviders';

export default {
  title: 'Pages/AddCard1',
  component: AddCard1,
};

export const Default = () => (
  <LightScreenThemeProvider>
    <MemoryRouter>
      <AddCard1 />
    </MemoryRouter>
  </LightScreenThemeProvider>
);

export const Dark = () => (
  <DarkScreenThemeProvider>
    <MemoryRouter>
      <AddCard1 />
    </MemoryRouter>
  </DarkScreenThemeProvider>
); 