import React, { useState } from 'react';
import { Input, InputPasswordGenerator } from '../InputVariants';
import { Icon } from '../Icon';

export default {
  title: 'components/InputVariants',
};

// --- Input stories ---
export const InputDefault = () => {
  const [value, setValue] = useState('');
  return (
    <Input
      label="Nom"
      _id="name"
      value={value}
      onChange={setValue}
      placeholder="Entrez votre nom"
      type="text"
      _autoComplete="name"
    />
  );
};

export const InputWithError = () => {
  const [value, setValue] = useState('');
  return (
    <Input
      label="Email"
      _id="email"
      value={value}
      onChange={setValue}
      placeholder="Entrez votre email"
      type="email"
      _autoComplete="email"
      error="Email invalide"
    />
  );
};

// --- InputPasswordGenerator stories ---
export const PasswordGeneratorDefault = () => {
  const [value, setValue] = useState('');
  const handleGenerate = () => setValue('motdepasse123!');
  return (
    <InputPasswordGenerator
      label="Mot de passe"
      _id="password"
      value={value}
      onChange={setValue}
      onGenerate={handleGenerate}
      placeholder="Entrez un mot de passe..."
      _required
      passwordStrength="Sécurité forte"
      Icon={Icon}
      _onAdvancedOptions={() => alert('Options avancées')}
    />
  );
};

export const PasswordGeneratorWithError = () => {
  const [value, setValue] = useState('');
  const handleGenerate = () => setValue('motdepasse123!');
  return (
    <InputPasswordGenerator
      label="Mot de passe"
      _id="password-error"
      value={value}
      onChange={setValue}
      onGenerate={handleGenerate}
      placeholder="Entrez un mot de passe..."
      _required
      passwordStrength="Sécurité faible"
      Icon={Icon}
      _onAdvancedOptions={() => alert('Options avancées')}
      error="Mot de passe trop faible"
    />
  );
}; 