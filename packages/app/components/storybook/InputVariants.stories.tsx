import React, { useState } from 'react';
import { Input, InputPasswordGenerator, InputPasswordStrength } from '../InputVariants';

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

export const InputNote = () => {
  const [value, setValue] = useState('');
  return (
    <Input
      label="Note sécurisée"
      _id="note"
      value={value}
      onChange={setValue}
      placeholder="Entrez votre note ici..."
      type="note"
    />
  );
};

export const InputNoteWithContent = () => {
  const [value, setValue] = useState('Ceci est une note multi-lignes\navec des sauts de ligne\net du contenu long qui peut grandir automatiquement.');
  return (
    <Input
      label="Note avec contenu"
      _id="note-with-content"
      value={value}
      onChange={setValue}
      placeholder="Entrez votre note ici..."
      type="note"
    />
  );
};

export const InputPassword = () => {
  const [value, setValue] = useState('motdepasse123');
  return (
    <Input
      label="Mot de passe"
      _id="password"
      value={value}
      onChange={setValue}
      placeholder="Entrez votre mot de passe..."
      type="password"
      _autoComplete="current-password"
    />
  );
};

export const InputPasswordWithError = () => {
  const [value, setValue] = useState('weak');
  return (
    <Input
      label="Mot de passe"
      _id="password-error"
      value={value}
      onChange={setValue}
      placeholder="Entrez votre mot de passe..."
      type="password"
      _autoComplete="current-password"
      error="Mot de passe trop faible"
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
      onGeneratePassword={handleGenerate}
      placeholder="Entrez un mot de passe..."
      _required
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
      onGeneratePassword={handleGenerate}
      placeholder="Entrez un mot de passe..."
      _required
      error="Mot de passe trop faible"
    />
  );
};

// --- InputPasswordStrength stories ---
export const PasswordStrengthWeak = () => {
  const [value, setValue] = useState('weak');
  return (
    <InputPasswordStrength
      label="Mot de passe"
      _id="password-strength-weak"
      value={value}
      onChange={setValue}
      placeholder="Entrez un mot de passe..."
      strength="weak"
    />
  );
};

export const PasswordStrengthAverage = () => {
  const [value, setValue] = useState('average123');
  return (
    <InputPasswordStrength
      label="Mot de passe"
      _id="password-strength-average"
      value={value}
      onChange={setValue}
      placeholder="Entrez un mot de passe..."
      strength="average"
    />
  );
};

export const PasswordStrengthStrong = () => {
  const [value, setValue] = useState('StrongPass123!');
  return (
    <InputPasswordStrength
      label="Mot de passe"
      _id="password-strength-strong"
      value={value}
      onChange={setValue}
      placeholder="Entrez un mot de passe..."
      strength="strong"
    />
  );
};

export const PasswordStrengthPerfect = () => {
  const [value, setValue] = useState('PerfectPass123!@#');
  return (
    <InputPasswordStrength
      label="Mot de passe"
      _id="password-strength-perfect"
      value={value}
      onChange={setValue}
      placeholder="Entrez un mot de passe..."
      strength="perfect"
    />
  );
}; 