import React from 'react';
import AddCard2 from '../AddCard2';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

export default {
  title: 'Pages/AddCard2',
  component: AddCard2,
};

export const Default = () => (
  <MemoryRouter initialEntries={[{ pathname: '/add-card-2', state: { title: 'Carte Perso', bankName: 'Ma Banque' } }]}> 
    <Routes>
      <Route path="/add-card-2" element={<AddCard2 />} />
    </Routes>
  </MemoryRouter>
); 