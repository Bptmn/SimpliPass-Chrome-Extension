import React, { useState } from 'react';
import { Input, InputPasswordGenerator } from '../popup/components/InputVariants';
import { Icon } from '../popup/components/Icon';
import '../styles/common.css';

export default {
  title: 'components/InputVariants',
};

// --- Input stories ---
export const InputDefault = () => {
  const [value, setValue] = useState('');
  return (
    <Input
      label="Nom"
      id="name"
      value={value}
      onChange={setValue}
      placeholder="Entrez votre nom"
      type="text"
      autoComplete="name"
    />
  );
};

export const InputWithError = () => {
  const [value, setValue] = useState('');
  return (
    <Input
      label="Email"
      id="email"
      value={value}
      onChange={setValue}
      placeholder="Entrez votre email"
      type="email"
      autoComplete="email"
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
      id="password"
      value={value}
      onChange={setValue}
      onGenerate={handleGenerate}
      placeholder="Entrez un mot de passe..."
      required
      passwordStrength="Sécurité forte"
      Icon={Icon}
      onAdvancedOptions={() => alert('Options avancées')}
    />
  );
};

export const PasswordGeneratorWithError = () => {
  const [value, setValue] = useState('');
  const handleGenerate = () => setValue('motdepasse123!');
  return (
    <InputPasswordGenerator
      label="Mot de passe"
      id="password-error"
      value={value}
      onChange={setValue}
      onGenerate={handleGenerate}
      placeholder="Entrez un mot de passe..."
      required
      passwordStrength="Sécurité faible"
      Icon={Icon}
      onAdvancedOptions={() => alert('Options avancées')}
      error="Mot de passe trop faible"
    />
  );
}; 