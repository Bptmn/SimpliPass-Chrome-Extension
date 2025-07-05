import React from 'react';
import ItemSecureNote from '../ItemSecureNote';
import { SecureNoteDecrypted } from '@app/core/types/types';

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

export const Default = () => <ItemSecureNote note={mockNote} />; 