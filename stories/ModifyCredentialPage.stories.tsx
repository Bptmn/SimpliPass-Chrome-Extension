import 'shared/styles/tokens.css';
import 'shared/styles/HomePage.css';
import 'shared/styles/AddCredentialPage.css';
import type { Meta, StoryObj } from '@storybook/react';
import { ModifyCredentialPage } from 'features/credentials';
import { CredentialDecrypted } from '../types/types';

const mockCredential: CredentialDecrypted = {
  createdDateTime: new Date(),
  lastUseDateTime: new Date(),
  title: 'Facebook',
  username: 'user@facebook.com',
  password: 'password123',
  note: 'Personal account',
  url: 'facebook.com',
  itemKey: 'mockItemKey',
  document_reference: { id: '123' } as any,
};

const meta = {
  title: 'Pages/ModifyCredentialPage',
  component: ModifyCredentialPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ModifyCredentialPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const DefaultCredential = () => (
  <ModifyCredentialPage
    credential={mockCredential}
    onSuccess={() => alert('Modification réussie!')}
  />
);
