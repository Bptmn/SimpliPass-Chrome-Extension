import React from 'react';
import AddSecureNote from '../AddSecureNote';
import { MemoryRouter } from 'react-router-dom';

export default {
  title: 'Pages/AddSecureNote',
  component: AddSecureNote,
};

export const Default = () => (
  <MemoryRouter>
    <AddSecureNote />
  </MemoryRouter>
); 