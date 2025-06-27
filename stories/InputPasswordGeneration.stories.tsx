import 'shared/styles/tokens.css';
import 'shared/styles/AddCredentialPage.css';
import type { Meta, StoryObj } from '@storybook/react';
import InputPasswordGeneration from 'shared/components/ui/InputPasswordGeneration';

const meta = {
  title: 'Components/UI/InputPasswordGeneration',
  component: InputPasswordGeneration,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    initialValue: { control: 'text' },
    isGenerating: { control: 'boolean' },
  },
} satisfies Meta<typeof InputPasswordGeneration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Password',
    placeholder: 'Generate a secure password...',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Generated Password',
    initialValue: 'SecureP@ssw0rd123!',
  },
};

export const Generating: Story = {
  args: {
    label: 'Password',
    isGenerating: true,
    placeholder: 'Generating password...',
  },
};
