import React from 'react';
import { View } from 'react-native';
import ItemSecureNote from '../ItemSecureNote';
import { SecureNoteDecrypted } from '@app/core/types/types';
import { ThemeProvider } from '@app/core/logic/theme';
import { spacing } from '@design/layout';

export default {
  title: 'Components/ItemSecureNote',
  component: ItemSecureNote,
};

const mockNote: SecureNoteDecrypted = {
  id: 'note1',
  title: 'Title',
  note: 'This is a secure note.',
  color: '#5B8CA9',
  itemKey: 'key',
  createdDateTime: new Date(),
  lastUseDateTime: new Date(),
};

const NoteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <View style={{ padding: spacing.lg }}>
      {children}
    </View>
  </ThemeProvider>
);

const DarkNoteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <View style={{ padding: spacing.lg, backgroundColor: '#282c30', minHeight: 200 }}>
      {children}
    </View>
  </ThemeProvider>
);

export const Default = () => (
  <NoteWrapper>
    <ItemSecureNote note={mockNote} />
  </NoteWrapper>
);

export const DefaultDark = () => (
  <DarkNoteWrapper>
    <ItemSecureNote note={mockNote} />
  </DarkNoteWrapper>
); 