import React, { useState } from 'react';
import { InputEdit } from '../InputEdit';

export default {
  title: 'Components/InputEdit',
  component: InputEdit,
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    value: { control: 'text' },
    isNote: { control: 'boolean' },
  },
};

export const Default = (args: any) => {
  const [value, setValue] = useState(args.value || '');
  return (
      <InputEdit
        label={args.label || 'InputTitle'}
        placeholder={args.placeholder || '[inputInitialValue]'}
        value={value}
        onChange={setValue}
        onClear={() => setValue('')}
        isNote={args.isNote}
      />
  );
};

Default.args = {
  label: 'InputTitle',
  placeholder: '[inputInitialValue]',
  value: '[inputInitialValue]',
  isNote: false,
};

export const NoteInput = (args: any) => {
  const [value, setValue] = useState(args.value || '');
  return (
      <InputEdit
        label={args.label || 'Note'}
        placeholder={args.placeholder || 'Enter your note here...'}
        value={value}
        onChange={setValue}
        onClear={() => setValue('')}
        isNote={true}
      />
  );
};

NoteInput.args = {
  label: 'Note',
  placeholder: 'Enter your note here...',
  value: 'This is a multi-line note\nwith line breaks\nand it can grow as needed.',
}; 