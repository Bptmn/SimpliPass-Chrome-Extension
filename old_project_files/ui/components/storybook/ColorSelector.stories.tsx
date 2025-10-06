import React from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import { ColorSelector } from '../ColorSelector';
import { LightThemeProvider, DarkThemeProvider } from './ThemeProviders';

const meta: Meta<typeof ColorSelector> = {
  title: 'Components/ColorSelector',
  component: ColorSelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

export const Default: StoryFn<typeof ColorSelector> = (args) => {
  return (
    <LightThemeProvider>
      <ColorSelector {...args} />
    </LightThemeProvider>
  );
};

Default.args = {
  title: 'Choisissez une couleur',
  value: '#4f86a2',
  onChange: (color: string) => console.log('Color changed:', color),
};

export const DefaultDark: StoryFn<typeof ColorSelector> = (args) => {
  return (
    <DarkThemeProvider>
      <ColorSelector {...args} />
    </DarkThemeProvider>
  );
}; 