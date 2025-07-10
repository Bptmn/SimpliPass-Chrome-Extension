import React from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import { InputEdit } from '../InputEdit';
import { LightThemeProvider, DarkThemeProvider } from './ThemeProviders';

const meta: Meta<typeof InputEdit> = {
  title: 'Components/InputEdit',
  component: InputEdit,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

export const Default: StoryFn<typeof InputEdit> = (args) => {
  return (
    <LightThemeProvider>
      <InputEdit {...args} />
    </LightThemeProvider>
  );
};

Default.args = {
  label: 'Label',
  value: '',
  onChange: (value: string) => console.log('Value changed:', value),
  placeholder: 'Placeholder',
  onClear: () => console.log('Clear clicked'),
};

export const DefaultDark: StoryFn<typeof InputEdit> = (args) => {
  return (
    <DarkThemeProvider>
      <InputEdit {...args} />
    </DarkThemeProvider>
  );
};

DefaultDark.args = {
  label: 'Label',
  value: '',
  onChange: (value: string) => console.log('Value changed:', value),
  placeholder: 'Placeholder',
  onClear: () => console.log('Clear clicked'),
};

export const NoteInput: StoryFn<typeof InputEdit> = (args) => {
  return (
    <LightThemeProvider>
      <InputEdit {...args} />
    </LightThemeProvider>
  );
};

NoteInput.args = {
  label: 'Note',
  value: '',
  onChange: (value: string) => console.log('Value changed:', value),
  placeholder: 'Entrez votre note...',
  onClear: () => console.log('Clear clicked'),
  isNote: true,
};

export const NoteInputDark: StoryFn<typeof InputEdit> = (args) => {
  return (
    <DarkThemeProvider>
      <InputEdit {...args} />
    </DarkThemeProvider>
  );
};

NoteInputDark.args = {
  label: 'Note',
  value: '',
  onChange: (value: string) => console.log('Value changed:', value),
  placeholder: 'Entrez votre note...',
  onClear: () => console.log('Clear clicked'),
  isNote: true,
}; 