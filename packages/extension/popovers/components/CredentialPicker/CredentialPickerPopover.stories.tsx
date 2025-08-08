/**
 * Credential Picker Popover Storybook Stories
 * 
 * This file contains stories for the CredentialPickerPopover component,
 * showcasing different credential scenarios and interactions with CredentialCard.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CredentialPickerPopover } from './CredentialPickerPopover';

// Type for credential data used in stories
type CredentialData = {
  id: string;
  title: string;
  username: string;
  url?: string;
  itemKeyCipher: string;
  passwordCipher: string;
};

const meta: Meta<typeof CredentialPickerPopover> = {
  title: 'Extension/Popovers/CredentialPicker',
  component: CredentialPickerPopover,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Credential picker popover that displays matching credentials for autofill. This popover appears when clicking on login fields and credentials are available.'
      }
    }
  },
  argTypes: {
    credentials: {
      description: 'Array of matching credentials to display',
      control: { type: 'object' }
    },
    onSelectCredential: {
      description: 'Callback when a credential is selected',
      action: 'credential-picked'
    },
    onCancel: {
      description: 'Callback when cancel button is clicked',
      action: 'close-clicked'
    }
  },
  decorators: [
    (Story) => (
      <Story />
    )
  ]
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Sample credentials for testing
 */
const sampleCredentials = [
  {
    id: '1',
    title: 'Facebook',
    username: 'john.doe@example.com',
    url: 'https://facebook.com',
    itemKeyCipher: 'encrypted-key-1',
    passwordCipher: 'encrypted-password-1'
  },
  {
    id: '2',
    title: 'Google Account',
    username: 'john.doe@gmail.com',
    url: 'https://accounts.google.com',
    itemKeyCipher: 'encrypted-key-2',
    passwordCipher: 'encrypted-password-2'
  },
  {
    id: '3',
    title: 'GitHub',
    username: 'johndoe',
    url: 'https://github.com',
    itemKeyCipher: 'encrypted-key-3',
    passwordCipher: 'encrypted-password-3'
  },
  {
    id: '4',
    title: 'LinkedIn',
    username: 'john.doe@example.com',
    url: 'https://linkedin.com',
    itemKeyCipher: 'encrypted-key-4',
    passwordCipher: 'encrypted-password-4'
  }
];

/**
 * Default Credential Picker
 * Shows the standard credential picker with multiple credentials using CredentialCard
 */
export const Default: Story = {
  args: {
    credentials: sampleCredentials,
    onSelectCredential: (credential: {
      id: string;
      title: string;
      username: string;
      url?: string;
      itemKeyCipher: string;
      passwordCipher: string;
    }) => {
      console.log('Credential picked:', credential);
      alert(`Selected: ${credential.title} (${credential.username})`);
    },
    onCancel: () => {
      console.log('Close clicked');
      alert('Credential picker closed');
    }
  }
};

/**
 * Single Credential
 * Shows the picker with only one matching credential using CredentialCard
 */
export const SingleCredential: Story = {
  args: {
    credentials: [sampleCredentials[0]],
    onSelectCredential: (credential: CredentialData) => {
      console.log('Credential picked:', credential);
      alert(`Selected: ${credential.title} (${credential.username})`);
    },
    onCancel: () => {
      console.log('Close clicked');
      alert('Credential picker closed');
    }
  }
};

/**
 * No Credentials
 * Shows the picker when no matching credentials are found
 */
export const NoCredentials: Story = {
  args: {
    credentials: [],
    onSelectCredential: (credential: CredentialData) => {
      console.log('Credential picked:', credential);
    },
    onCancel: () => {
      console.log('Close clicked');
      alert('Credential picker closed');
    }
  }
};

/**
 * Many Credentials
 * Shows the picker with many credentials (tests scrolling) using CredentialCard
 */
export const ManyCredentials: Story = {
  args: {
    credentials: [
      ...sampleCredentials,
      {
        id: '5',
        title: 'Twitter',
        username: 'johndoe',
        url: 'https://twitter.com',
        itemKeyCipher: 'encrypted-key-5',
        passwordCipher: 'encrypted-password-5'
      },
      {
        id: '6',
        title: 'Instagram',
        username: 'john.doe@example.com',
        url: 'https://instagram.com',
        itemKeyCipher: 'encrypted-key-6',
        passwordCipher: 'encrypted-password-6'
      },
      {
        id: '7',
        title: 'Reddit',
        username: 'johndoe',
        url: 'https://reddit.com',
        itemKeyCipher: 'encrypted-key-7',
        passwordCipher: 'encrypted-password-7'
      },
      {
        id: '8',
        title: 'Discord',
        username: 'johndoe#1234',
        url: 'https://discord.com',
        itemKeyCipher: 'encrypted-key-8',
        passwordCipher: 'encrypted-password-8'
      },
      {
        id: '9',
        title: 'Slack',
        username: 'john.doe@company.com',
        url: 'https://slack.com',
        itemKeyCipher: 'encrypted-key-9',
        passwordCipher: 'encrypted-password-9'
      },
      {
        id: '10',
        title: 'Notion',
        username: 'john.doe@example.com',
        url: 'https://notion.so',
        itemKeyCipher: 'encrypted-key-10',
        passwordCipher: 'encrypted-password-10'
      }
    ],
    onSelectCredential: (credential: CredentialData) => {
      console.log('Credential picked:', credential);
      alert(`Selected: ${credential.title} (${credential.username})`);
    },
    onCancel: () => {
      console.log('Close clicked');
      alert('Credential picker closed');
    }
  }
};

/**
 * Credentials with Long Titles
 * Shows how the picker handles credentials with long titles using CredentialCard
 */
export const LongTitles: Story = {
  args: {
    credentials: [
      {
        id: '1',
        title: 'Very Long Website Name That Might Overflow',
        username: 'john.doe@example.com',
        url: 'https://verylongwebsitename.com',
        itemKeyCipher: 'encrypted-key-long-1',
        passwordCipher: 'encrypted-password-long-1'
      },
      {
        id: '2',
        title: 'Another Very Long Website Name For Testing',
        username: 'johndoe',
        url: 'https://anotherverylongwebsitename.com',
        itemKeyCipher: 'encrypted-key-long-2',
        passwordCipher: 'encrypted-password-long-2'
      },
      {
        id: '3',
        title: 'Short',
        username: 'john.doe@gmail.com',
        url: 'https://short.com',
        itemKeyCipher: 'encrypted-key-long-3',
        passwordCipher: 'encrypted-password-long-3'
      }
    ],
    onSelectCredential: (credential: CredentialData) => {
      console.log('Credential picked:', credential);
      alert(`Selected: ${credential.title} (${credential.username})`);
    },
    onCancel: () => {
      console.log('Close clicked');
      alert('Credential picker closed');
    }
  }
};

/**
 * Credentials with Long Usernames
 * Shows how the picker handles credentials with long usernames using CredentialCard
 */
export const LongUsernames: Story = {
  args: {
    credentials: [
      {
        id: '1',
        title: 'Facebook',
        username: 'very.long.email.address@verylongdomainname.com',
        url: 'https://facebook.com',
        itemKeyCipher: 'encrypted-key-long-user-1',
        passwordCipher: 'encrypted-password-long-user-1'
      },
      {
        id: '2',
        title: 'Google',
        username: 'john.doe.work.account@gmail.com',
        url: 'https://accounts.google.com',
        itemKeyCipher: 'encrypted-key-long-user-2',
        passwordCipher: 'encrypted-password-long-user-2'
      },
      {
        id: '3',
        title: 'GitHub',
        username: 'john-doe-developer-username',
        url: 'https://github.com',
        itemKeyCipher: 'encrypted-key-long-user-3',
        passwordCipher: 'encrypted-password-long-user-3'
      }
    ],
    onSelectCredential: (credential: CredentialData) => {
      console.log('Credential picked:', credential);
      alert(`Selected: ${credential.title} (${credential.username})`);
    },
    onCancel: () => {
      console.log('Close clicked');
      alert('Credential picker closed');
    }
  }
};

/**
 * Credential Picker in Dark Context
 * Shows how the popover looks in a darker environment using CredentialCard
 */
export const DarkContext: Story = {
  args: {
    credentials: sampleCredentials,
    onSelectCredential: (credential: CredentialData) => {
      console.log('Credential picked:', credential);
      alert(`Selected: ${credential.title} (${credential.username})`);
    },
    onCancel: () => {
      console.log('Close clicked');
      alert('Credential picker closed');
    }
  },
  decorators: [
    (Story) => (
      <Story />
    )
  ]
};
