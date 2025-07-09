import React, { useState } from 'react';
import { View } from 'react-native';
import { InputEdit } from '../InputEdit';
import { ThemeProvider } from '@app/core/logic/theme';
import { spacing } from '@design/layout';

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

const InputEditWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <View style={{ padding: spacing.lg }}>
      {children}
    </View>
  </ThemeProvider>
);

const DarkInputEditWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <View style={{ padding: spacing.lg, backgroundColor: '#282c30', minHeight: 200 }}>
      {children}
    </View>
  </ThemeProvider>
);

export const Default = (args: any) => {
  const [value, setValue] = useState(args.value || '');
  return (
    <InputEditWrapper>
      <InputEdit
        label={args.label || 'InputTitle'}
        placeholder={args.placeholder || '[inputInitialValue]'}
        value={value}
        onChange={setValue}
        onClear={() => setValue('')}
        isNote={args.isNote}
      />
    </InputEditWrapper>
  );
};

Default.args = {
  label: 'InputTitle',
  placeholder: '[inputInitialValue]',
  value: '[inputInitialValue]',
  isNote: false,
};

export const DefaultDark = (args: any) => {
  const [value, setValue] = useState(args.value || '');
  return (
    <DarkInputEditWrapper>
      <InputEdit
        label={args.label || 'InputTitle'}
        placeholder={args.placeholder || '[inputInitialValue]'}
        value={value}
        onChange={setValue}
        onClear={() => setValue('')}
        isNote={args.isNote}
      />
    </DarkInputEditWrapper>
  );
};

DefaultDark.args = {
  label: 'InputTitle',
  placeholder: '[inputInitialValue]',
  value: '[inputInitialValue]',
  isNote: false,
};

export const NoteInput = (args: any) => {
  const [value, setValue] = useState(args.value || '');
  return (
    <InputEditWrapper>
      <InputEdit
        label={args.label || 'Note'}
        placeholder={args.placeholder || 'Enter your note here...'}
        value={value}
        onChange={setValue}
        onClear={() => setValue('')}
        isNote={true}
      />
    </InputEditWrapper>
  );
};

NoteInput.args = {
  label: 'Note',
  placeholder: 'Enter your note here...',
  value: 'This is a multi-line note\nwith line breaks\nand it can grow as needed.',
};

export const NoteInputDark = (args: any) => {
  const [value, setValue] = useState(args.value || '');
  return (
    <DarkInputEditWrapper>
      <InputEdit
        label={args.label || 'Note'}
        placeholder={args.placeholder || 'Enter your note here...'}
        value={value}
        onChange={setValue}
        onClear={() => setValue('')}
        isNote={true}
      />
    </DarkInputEditWrapper>
  );
};

NoteInputDark.args = {
  label: 'Note',
  placeholder: 'Enter your note here...',
  value: 'This is a multi-line note\nwith line breaks\nand it can grow as needed.',
}; 