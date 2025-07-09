import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryFn } from '@storybook/react';
import { DetailField } from '../DetailField';
import { ThemeProvider } from '@app/core/logic/theme';
import { spacing } from '@design/layout';

export default {
  title: 'Components/DetailField',
  component: DetailField,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <View style={{ padding: spacing.lg, gap: 16 }}>
          <Story />
        </View>
      </ThemeProvider>
    ),
  ],
} as Meta<typeof DetailField>;

// Custom ThemeProvider that forces dark mode
const DarkThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Set dark mode immediately before rendering
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('simplipass_theme_mode', 'dark');
  }

  return (
    <ThemeProvider>
      <View style={{ padding: spacing.lg, gap: 16, minHeight: 200 }}>
        {children}
      </View>
    </ThemeProvider>
  );
};

// Custom ThemeProvider that forces light mode
const LightThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Set light mode immediately before rendering
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('simplipass_theme_mode', 'light');
  }

  return (
    <ThemeProvider>
      <View style={{ padding: spacing.lg, gap: 16 }}>
        {children}
      </View>
    </ThemeProvider>
  );
};

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
Default.decorators = [
  (Story) => (
    <LightThemeProvider>
      <Story />
    </LightThemeProvider>
  ),
];

export const DefaultDark = Template.bind({});
DefaultDark.args = Default.args;
DefaultDark.decorators = [
  (Story) => (
    <DarkThemeProvider>
      <Story />
    </DarkThemeProvider>
  ),
];

export const WithLaunchButton = Template.bind({});
WithLaunchButton.args = {
  label: 'Lien :',
  value: 'https://example.com',
  showLaunchButton: true,
};
WithLaunchButton.decorators = [
  (Story) => (
    <LightThemeProvider>
      <Story />
    </LightThemeProvider>
  ),
];

export const WithLaunchButtonDark = Template.bind({});
WithLaunchButtonDark.args = WithLaunchButton.args;
WithLaunchButtonDark.decorators = [
  (Story) => (
    <DarkThemeProvider>
      <Story />
    </DarkThemeProvider>
  ),
];

export const EmptyValue = Template.bind({});
EmptyValue.args = {
  label: 'Note :',
  value: '',
  showCopyButton: true,
};
EmptyValue.decorators = [
  (Story) => (
    <LightThemeProvider>
      <Story />
    </LightThemeProvider>
  ),
];

export const EmptyValueDark = Template.bind({});
EmptyValueDark.args = EmptyValue.args;
EmptyValueDark.decorators = [
  (Story) => (
    <DarkThemeProvider>
      <Story />
    </DarkThemeProvider>
  ),
];

export const LongValue = Template.bind({});
LongValue.args = {
  label: 'Numéro de carte :',
  value: '1234 5678 9012 3456',
  showCopyButton: true,
  copyText: 'copier',
  ariaLabel: 'Copier le numéro de carte',
};
LongValue.decorators = [
  (Story) => (
    <LightThemeProvider>
      <Story />
    </LightThemeProvider>
  ),
];

export const LongValueDark = Template.bind({});
LongValueDark.args = LongValue.args;
LongValueDark.decorators = [
  (Story) => (
    <DarkThemeProvider>
      <Story />
    </DarkThemeProvider>
  ),
];

export const CVV = Template.bind({});
CVV.args = {
  label: 'CVV :',
  value: '123',
  showCopyButton: true,
  copyText: 'copier',
  ariaLabel: 'Copier le CVV',
};
CVV.decorators = [
  (Story) => (
    <LightThemeProvider>
      <Story />
    </LightThemeProvider>
  ),
];

export const CVVDark = Template.bind({});
CVVDark.args = CVV.args;
CVVDark.decorators = [
  (Story) => (
    <DarkThemeProvider>
      <Story />
    </DarkThemeProvider>
  ),
]; 