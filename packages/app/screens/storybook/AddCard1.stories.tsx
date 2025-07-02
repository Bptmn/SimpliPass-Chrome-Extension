import React from 'react';
import AddCard1 from '../AddCard1';
import { MemoryRouter } from 'react-router-dom';

export default {
  title: 'Pages/AddCard1',
  component: AddCard1,
};

export const Default = () => (
  <MemoryRouter>
    <AddCard1 />
  </MemoryRouter>
); 