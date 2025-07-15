import React from 'react';
import { View } from 'react-native';
import ItemSecureNote from '../ItemSecureNote';
import { SecureNoteDecrypted } from '@common/core/types/items.types';
import { LightThemeProvider, DarkThemeProvider } from './ThemeProviders';
import { spacing } from '@ui/design/layout';

export default {
  title: 'Components/ItemSecureNote',
  component: ItemSecureNote,
};

const mockSecureNote: SecureNoteDecrypted = {
  id: '1',
  itemType: 'secureNote',
  createdDateTime: new Date(),
  lastUseDateTime: new Date(),
  title: 'WiFi Password',
  note: 'Network: MyWiFi\nPassword: mypassword123',
  color: '#007AFF',
  itemKey: 'mock-key',
};

const NoteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LightThemeProvider>
    <View style={{ padding: spacing.lg }}>
      {children}
    </View>
  </LightThemeProvider>
);

const DarkNoteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DarkThemeProvider>
    <View style={{ padding: spacing.lg }}>
      {children}
    </View>
  </DarkThemeProvider>
);

export const Default = () => (
  <NoteWrapper>
    <ItemSecureNote note={mockSecureNote} />
  </NoteWrapper>
);

export const DefaultDark = () => (
  <DarkNoteWrapper>
    <ItemSecureNote note={mockSecureNote} />
  </DarkNoteWrapper>
); 