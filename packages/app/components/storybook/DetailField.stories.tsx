import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryFn } from '@storybook/react';
import { DetailField } from '../DetailField';
import { ThemeProvider } from '@app/core/logic/theme';

export default {
  title: 'Components/DetailField',
  component: DetailField,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <View style={{ padding: 20, gap: 16 }}>
          <Story />
        </View>
      </ThemeProvider>
    ),
  ],
} as Meta<typeof DetailField>;

const Template: StoryFn<React.ComponentProps<typeof DetailField>> = (args) => (
  <DetailField {...args} />
);

export const Default = Template.bind({});
Default.args = {
  label: 'Titulaire :',
  value: 'John Doe',
  showCopyButton: true,
  copyText: 'copier',
  ariaLabel: 'Copier le titulaire',
};

export const WithLaunchButton = Template.bind({});
WithLaunchButton.args = {
  label: 'Lien :',
  value: 'https://example.com',
  showLaunchButton: true,
};

export const EmptyValue = Template.bind({});
EmptyValue.args = {
  label: 'Note :',
  value: '',
  showCopyButton: true,
};

export const LongValue = Template.bind({});
LongValue.args = {
  label: 'Numéro de carte :',
  value: '1234 5678 9012 3456',
  showCopyButton: true,
  copyText: 'copier',
  ariaLabel: 'Copier le numéro de carte',
};

export const CVV = Template.bind({});
CVV.args = {
  label: 'CVV :',
  value: '123',
  showCopyButton: true,
  copyText: 'copier',
  ariaLabel: 'Copier le CVV',
}; 