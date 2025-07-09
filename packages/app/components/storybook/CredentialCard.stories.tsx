import React from 'react';
import { View } from 'react-native';
import { CredentialCard } from '../CredentialCard';
import { LightThemeProvider, DarkThemeProvider } from './ThemeProviders';
import { CredentialDecrypted } from '@app/core/types/types';

export default {
  title: 'Components/CredentialCard',
  component: CredentialCard,
  parameters: {
    layout: 'centered',
  },
};

const mockCredential: CredentialDecrypted = {
  id: '1',
  title: 'Gmail',
  username: 'user@gmail.com',
  password: 'password123',
  url: 'https://gmail.com',
  note: 'Mon compte Gmail principal',
  itemKey: 'decrypted-item-key-1',
  createdDateTime: new Date('2023-01-01'),
  lastUseDateTime: new Date('2023-01-15'),
};

const mockCredentialLong: CredentialDecrypted = {
  ...mockCredential,
  title: 'Compte avec un titre très long qui peut déborder',
  username: 'utilisateur.avec.nom.tres.long@gmail.com',
  url: 'https://example.com/very/long/url/that/might/overflow',
  note: 'Une note très longue qui peut contenir beaucoup de texte et qui pourrait déborder sur plusieurs lignes si nécessaire pour tester l\'affichage des cartes avec du contenu étendu.',
};

export const Default = () => (
  <LightThemeProvider>
    <CredentialCard credential={mockCredential} onPress={() => console.log('Card pressed')} />
  </LightThemeProvider>
);

export const DefaultDark = () => (
  <DarkThemeProvider>
    <CredentialCard credential={mockCredential} onPress={() => console.log('Card pressed')} />
  </DarkThemeProvider>
);

export const LongContent = () => (
  <LightThemeProvider>
    <CredentialCard credential={mockCredentialLong} onPress={() => console.log('Card pressed')} />
  </LightThemeProvider>
);

export const LongContentDark = () => (
  <DarkThemeProvider>
    <CredentialCard credential={mockCredentialLong} onPress={() => console.log('Card pressed')} />
  </DarkThemeProvider>
);

export const NoNote = () => {
  const credentialWithoutNote = { ...mockCredential, note: '' };
  return (
    <LightThemeProvider>
      <CredentialCard credential={credentialWithoutNote} onPress={() => console.log('Card pressed')} />
    </LightThemeProvider>
  );
};

export const NoNoteDark = () => {
  const credentialWithoutNote = { ...mockCredential, note: '' };
  return (
    <DarkThemeProvider>
      <CredentialCard credential={credentialWithoutNote} onPress={() => console.log('Card pressed')} />
    </DarkThemeProvider>
  );
};

export const NoUrl = () => {
  const credentialWithoutUrl = { ...mockCredential, url: '' };
  return (
    <LightThemeProvider>
      <CredentialCard credential={credentialWithoutUrl} onPress={() => console.log('Card pressed')} />
    </LightThemeProvider>
  );
};

export const NoUrlDark = () => {
  const credentialWithoutUrl = { ...mockCredential, url: '' };
  return (
    <DarkThemeProvider>
      <CredentialCard credential={credentialWithoutUrl} onPress={() => console.log('Card pressed')} />
    </DarkThemeProvider>
  );
};

export const CustomColor = () => {
  const credentialWithCustomColor = { ...mockCredential };
  return (
    <LightThemeProvider>
      <CredentialCard credential={credentialWithCustomColor} onPress={() => console.log('Card pressed')} />
    </LightThemeProvider>
  );
};

export const CustomColorDark = () => {
  const credentialWithCustomColor = { ...mockCredential };
  return (
    <DarkThemeProvider>
      <CredentialCard credential={credentialWithCustomColor} onPress={() => console.log('Card pressed')} />
    </DarkThemeProvider>
  );
};

export const MultipleCards = () => (
  <LightThemeProvider>
    <View style={{ gap: 16 }}>
      <CredentialCard credential={mockCredential} onPress={() => console.log('Card 1 pressed')} />
      <CredentialCard credential={mockCredentialLong} onPress={() => console.log('Card 2 pressed')} />
      <CredentialCard credential={mockCredential} onPress={() => console.log('Card 3 pressed')} />
    </View>
  </LightThemeProvider>
);

export const MultipleCardsDark = () => (
  <DarkThemeProvider>
    <View style={{ gap: 16 }}>
      <CredentialCard credential={mockCredential} onPress={() => console.log('Card 1 pressed')} />
      <CredentialCard credential={mockCredentialLong} onPress={() => console.log('Card 2 pressed')} />
      <CredentialCard credential={mockCredential} onPress={() => console.log('Card 3 pressed')} />
    </View>
  </DarkThemeProvider>
); 