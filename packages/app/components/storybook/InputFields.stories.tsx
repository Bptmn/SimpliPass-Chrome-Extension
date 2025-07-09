import React, { useState } from 'react';
import { Input, InputPasswordStrength } from '../InputFields';
import { LightThemeProvider, DarkThemeProvider } from './ThemeProviders';

export default {
  title: 'components/InputFields',
};

// --- Input stories ---
export const InputDefault = () => {
  const [value, setValue] = useState('');
  return (
    <LightThemeProvider>
      <Input
        label="Nom"
        _id="name"
        value={value}
        onChange={setValue}
        placeholder="Entrez votre nom"
        type="text"
        _autoComplete="name"
      />
    </LightThemeProvider>
  );
};

export const InputDefaultDark = () => {
  const [value, setValue] = useState('');
  return (
    <DarkThemeProvider>
      <Input
        label="Nom"
        _id="name"
        value={value}
        onChange={setValue}
        placeholder="Entrez votre nom"
        type="text"
        _autoComplete="name"
      />
    </DarkThemeProvider>
  );
};

export const InputWithError = () => {
  const [value, setValue] = useState('');
  return (
    <LightThemeProvider>
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
    </LightThemeProvider>
  );
};

export const InputWithErrorDark = () => {
  const [value, setValue] = useState('');
  return (
    <DarkThemeProvider>
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
    </DarkThemeProvider>
  );
};

export const InputNote = () => {
  const [value, setValue] = useState('');
  return (
    <LightThemeProvider>
      <Input
        label="Note sécurisée"
        _id="note"
        value={value}
        onChange={setValue}
        placeholder="Entrez votre note ici..."
        type="note"
      />
    </LightThemeProvider>
  );
};

export const InputNoteDark = () => {
  const [value, setValue] = useState('');
  return (
    <DarkThemeProvider>
      <Input
        label="Note sécurisée"
        _id="note"
        value={value}
        onChange={setValue}
        placeholder="Entrez votre note ici..."
        type="note"
      />
    </DarkThemeProvider>
  );
};

export const InputNoteWithContent = () => {
  const [value, setValue] = useState('Ceci est une note multi-lignes\navec des sauts de ligne\net du contenu long qui peut grandir automatiquement.');
  return (
    <LightThemeProvider>
      <Input
        label="Note avec contenu"
        _id="note-with-content"
        value={value}
        onChange={setValue}
        placeholder="Entrez votre note ici..."
        type="note"
      />
    </LightThemeProvider>
  );
};

export const InputNoteWithContentDark = () => {
  const [value, setValue] = useState('Ceci est une note multi-lignes\navec des sauts de ligne\net du contenu long qui peut grandir automatiquement.');
  return (
    <DarkThemeProvider>
      <Input
        label="Note avec contenu"
        _id="note-with-content"
        value={value}
        onChange={setValue}
        placeholder="Entrez votre note ici..."
        type="note"
      />
    </DarkThemeProvider>
  );
};

export const InputPassword = () => {
  const [value, setValue] = useState('motdepasse123');
  return (
    <LightThemeProvider>
      <Input
        label="Mot de passe"
        _id="password"
        value={value}
        onChange={setValue}
        placeholder="Entrez votre mot de passe..."
        type="password"
        _autoComplete="current-password"
      />
    </LightThemeProvider>
  );
};

export const InputPasswordDark = () => {
  const [value, setValue] = useState('motdepasse123');
  return (
    <DarkThemeProvider>
      <Input
        label="Mot de passe"
        _id="password"
        value={value}
        onChange={setValue}
        placeholder="Entrez votre mot de passe..."
        type="password"
        _autoComplete="current-password"
      />
    </DarkThemeProvider>
  );
};

export const InputPasswordWithError = () => {
  const [value, setValue] = useState('motdepasse123');
  return (
    <LightThemeProvider>
      <Input
        label="Mot de passe"
        _id="password"
        value={value}
        onChange={setValue}
        placeholder="Entrez votre mot de passe..."
        type="password"
        _autoComplete="current-password"
        error="Mot de passe trop court"
      />
    </LightThemeProvider>
  );
};

export const InputPasswordWithErrorDark = () => {
  const [value, setValue] = useState('motdepasse123');
  return (
    <DarkThemeProvider>
      <Input
        label="Mot de passe"
        _id="password"
        value={value}
        onChange={setValue}
        placeholder="Entrez votre mot de passe..."
        type="password"
        _autoComplete="current-password"
        error="Mot de passe trop court"
      />
    </DarkThemeProvider>
  );
};

// --- Password Strength stories ---
export const PasswordStrengthWeak = () => {
  const [value, setValue] = useState('weak');
  return (
    <LightThemeProvider>
      <InputPasswordStrength
        value={value}
        onChange={setValue}
        label="Mot de passe faible"
        _id="password-weak"
        placeholder="Entrez un mot de passe..."
      />
    </LightThemeProvider>
  );
};

export const PasswordStrengthWeakDark = () => {
  const [value, setValue] = useState('weak');
  return (
    <DarkThemeProvider>
      <InputPasswordStrength
        value={value}
        onChange={setValue}
        label="Mot de passe faible"
        _id="password-weak"
        placeholder="Entrez un mot de passe..."
      />
    </DarkThemeProvider>
  );
};

export const PasswordStrengthAverage = () => {
  const [value, setValue] = useState('average123');
  return (
    <LightThemeProvider>
      <InputPasswordStrength
        value={value}
        onChange={setValue}
        label="Mot de passe moyen"
        _id="password-average"
        placeholder="Entrez un mot de passe..."
      />
    </LightThemeProvider>
  );
};

export const PasswordStrengthAverageDark = () => {
  const [value, setValue] = useState('average123');
  return (
    <DarkThemeProvider>
      <InputPasswordStrength
        value={value}
        onChange={setValue}
        label="Mot de passe moyen"
        _id="password-average"
        placeholder="Entrez un mot de passe..."
      />
    </DarkThemeProvider>
  );
};

export const PasswordStrengthStrong = () => {
  const [value, setValue] = useState('StrongPass123!');
  return (
    <LightThemeProvider>
      <InputPasswordStrength
        value={value}
        onChange={setValue}
        label="Mot de passe fort"
        _id="password-strong"
        placeholder="Entrez un mot de passe..."
      />
    </LightThemeProvider>
  );
};

export const PasswordStrengthStrongDark = () => {
  const [value, setValue] = useState('StrongPass123!');
  return (
    <DarkThemeProvider>
      <InputPasswordStrength
        value={value}
        onChange={setValue}
        label="Mot de passe fort"
        _id="password-strong"
        placeholder="Entrez un mot de passe..."
      />
    </DarkThemeProvider>
  );
};

export const PasswordStrengthPerfect = () => {
  const [value, setValue] = useState('PerfectPass123!@#');
  return (
    <LightThemeProvider>
      <InputPasswordStrength
        value={value}
        onChange={setValue}
        label="Mot de passe parfait"
        _id="password-perfect"
        placeholder="Entrez un mot de passe..."
      />
    </LightThemeProvider>
  );
};

export const PasswordStrengthPerfectDark = () => {
  const [value, setValue] = useState('PerfectPass123!@#');
  return (
    <DarkThemeProvider>
      <InputPasswordStrength
        value={value}
        onChange={setValue}
        label="Mot de passe parfait"
        _id="password-perfect"
        placeholder="Entrez un mot de passe..."
      />
    </DarkThemeProvider>
  );
}; 