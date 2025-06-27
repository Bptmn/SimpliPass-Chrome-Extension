import React from 'react';
import InputEdit from 'shared/components/ui/InputEdit';

export default {
  title: 'Components/InputEdit',
  component: InputEdit,
};

export const Default = () => <InputEdit label="Nom de l'identifiant" />;
export const WithInitialValue = () => (
  <InputEdit label="Nom de l'identifiant" initialValue="Facebook" />
);
export const WithPlaceholder = () => (
  <InputEdit label="Nom de l'identifiant" placeholder="Entrez un nom..." />
);
