import React from 'react';
import { View } from 'react-native';
import { CredentialCard } from '../CredentialCard';
import { LightThemeProvider, DarkThemeProvider } from './ThemeProviders';
import { CredentialDecrypted } from '@common/core/types/items.types';

export default {
  title: 'Components/CredentialCard',
  component: CredentialCard,
  parameters: {
    layout: 'centered',
  },
};

const mockCredential: CredentialDecrypted = {
  id: '1',
  itemType: 'credential',
  createdDateTime: new Date(),
  lastUseDateTime: new Date(),
  title: 'Example Website',
  username: 'user@example.com',
  password: 'securepassword123',
  url: 'https://example.com',
  note: 'This is a test credential',
  itemKey: 'mock-key',
};

const mockCredentialWithLongData: CredentialDecrypted = {
  id: '2',
  itemType: 'credential',
  createdDateTime: new Date(),
  lastUseDateTime: new Date(),
  title: 'Very Long Website Name That Might Overflow',
  username: 'verylongusername@verylongdomain.com',
  password: 'verylongpassword123',
  url: 'https://verylongwebsite.com/very/long/path',
  note: 'This is a very long note that might cause layout issues and should be handled gracefully by the component',
  itemKey: 'mock-key',
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
    <CredentialCard credential={mockCredentialWithLongData} onPress={() => console.log('Card pressed')} />
  </LightThemeProvider>
);

export const LongContentDark = () => (
  <DarkThemeProvider>
    <CredentialCard credential={mockCredentialWithLongData} onPress={() => console.log('Card pressed')} />
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
      <CredentialCard credential={mockCredentialWithLongData} onPress={() => console.log('Card 2 pressed')} />
      <CredentialCard credential={mockCredential} onPress={() => console.log('Card 3 pressed')} />
    </View>
  </LightThemeProvider>
);

export const MultipleCardsDark = () => (
  <DarkThemeProvider>
    <View style={{ gap: 16 }}>
      <CredentialCard credential={mockCredential} onPress={() => console.log('Card 1 pressed')} />
      <CredentialCard credential={mockCredentialWithLongData} onPress={() => console.log('Card 2 pressed')} />
      <CredentialCard credential={mockCredential} onPress={() => console.log('Card 3 pressed')} />
    </View>
  </DarkThemeProvider>
); 