import 'shared/styles/Dialog.module.css';
import 'shared/styles/tokens.css';
import type { Meta, StoryObj } from '@storybook/react';
import { Dialog } from 'shared/components/ui';

const meta = {
  title: 'Components/UI/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: { control: 'boolean' },
    title: { control: 'text' },
    onClose: { action: 'onClose' },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    title: 'Sample Dialog',
    children: <p>This is the dialog content.</p>,
  },
};

export const WithLongContent: Story = {
  args: {
    isOpen: true,
    title: 'Dialog with Long Content',
    children: (
      <div>
        <p>This dialog contains a lot of content to demonstrate scrolling behavior.</p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua.
        </p>
        <p>
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
          commodo consequat.
        </p>
      </div>
    ),
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    title: 'Closed Dialog',
    children: <p>This dialog is closed.</p>,
  },
};
