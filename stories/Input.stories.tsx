import React from 'react';
import Input from 'shared/components/ui/Input';

export default {
  title: 'Components/Input',
  component: Input,
};

export const Text = () => <Input label="Nom" initialValue="Jean" placeholder="Votre nom" />;
export const Password = () => (
  <Input label="Mot de passe" password initialValue="secret" placeholder="Mot de passe" />
);
export const Placeholder = () => <Input label="Ville" placeholder="Entrez votre ville" />;
