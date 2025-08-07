/**
 * PopoverCredentialPicker Storybook Stories
 * 
 * This file contains stories for the PopoverCredentialPicker component,
 * showcasing how it uses the shared CredentialCard component for credential display.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PopoverCredentialPicker } from './PopoverCredentialPicker';

const meta: Meta<typeof PopoverCredentialPicker> = {
  title: 'Extension/Popovers/PopoverCredentialPicker',
  component: PopoverCredentialPicker,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'PopoverCredentialPicker component that displays credential suggestions using the shared CredentialCard component. This component is used in the Chrome extension popover to show matching credentials for autofill.'
      }
    }
  },
  argTypes: {
    credentials: {
      description: 'Array of credentials to display in the popover',
      control: { type: 'object' }
    },
    onPick: {
      description: 'Callback when a credential is selected',
      action: 'credential-picked'
    },
    onClose: {
      description: 'Callback when the popover is closed',
      action: 'popover-closed'
    }
  },
  decorators: [
    (Story) => (
      <div style={{ 
        position: 'relative', 
        width: '400px', 
        height: '500px',
        border: '1px solid #ccc',
        padding: '20px',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ 
          position: 'absolute',
          top: '50px',
          left: '50px',
          width: '320px'
        }}>
          <Story />
        </div>
      </div>
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
  }
];

/**
 * Default PopoverCredentialPicker
 * Shows the standard credential picker with multiple credentials using CredentialCard
 */
export const Default: Story = {
  args: {
    credentials: sampleCredentials,
    onPick: (credential) => {
      console.log('Credential picked:', credential);
      alert(`Selected: ${credential.title} (${credential.username})`);
    },
    onClose: () => {
      console.log('Popover closed');
      alert('Popover closed');
    }
  }
};

/**
 * Single Credential
 * Shows the picker with only one matching credential
 */
export const SingleCredential: Story = {
  args: {
    credentials: [sampleCredentials[0]],
    onPick: (credential) => {
      console.log('Credential picked:', credential);
      alert(`Selected: ${credential.title} (${credential.username})`);
    },
    onClose: () => {
      console.log('Popover closed');
      alert('Popover closed');
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
    onPick: (credential) => {
      console.log('Credential picked:', credential);
    },
    onClose: () => {
      console.log('Popover closed');
      alert('Popover closed');
    }
  }
};

/**
 * Credentials with Long Titles
 * Shows how the picker handles credentials with long titles
 */
export const LongTitles: Story = {
  args: {
    credentials: [
      {
        id: '1',
        title: 'Very Long Website Name That Might Overflow',
        username: 'john.doe@example.com',
        url: 'https://verylongwebsitename.com',
        itemKeyCipher: 'encrypted-key-1',
        passwordCipher: 'encrypted-password-1'
      },
      {
        id: '2',
        title: 'Another Very Long Website Name For Testing',
        username: 'johndoe',
        url: 'https://anotherverylongwebsitename.com',
        itemKeyCipher: 'encrypted-key-2',
        passwordCipher: 'encrypted-password-2'
      },
      {
        id: '3',
        title: 'Short',
        username: 'john.doe@gmail.com',
        url: 'https://short.com',
        itemKeyCipher: 'encrypted-key-3',
        passwordCipher: 'encrypted-password-3'
      }
    ],
    onPick: (credential) => {
      console.log('Credential picked:', credential);
      alert(`Selected: ${credential.title} (${credential.username})`);
    },
    onClose: () => {
      console.log('Popover closed');
      alert('Popover closed');
    }
  }
};

/**
 * Credentials with Long Usernames
 * Shows how the picker handles credentials with long usernames
 */
export const LongUsernames: Story = {
  args: {
    credentials: [
      {
        id: '1',
        title: 'Facebook',
        username: 'very.long.email.address@verylongdomainname.com',
        url: 'https://facebook.com',
        itemKeyCipher: 'encrypted-key-1',
        passwordCipher: 'encrypted-password-1'
      },
      {
        id: '2',
        title: 'Google',
        username: 'john.doe.work.account@gmail.com',
        url: 'https://accounts.google.com',
        itemKeyCipher: 'encrypted-key-2',
        passwordCipher: 'encrypted-password-2'
      },
      {
        id: '3',
        title: 'GitHub',
        username: 'john-doe-developer-username',
        url: 'https://github.com',
        itemKeyCipher: 'encrypted-key-3',
        passwordCipher: 'encrypted-password-3'
      }
    ],
    onPick: (credential) => {
      console.log('Credential picked:', credential);
      alert(`Selected: ${credential.title} (${credential.username})`);
    },
    onClose: () => {
      console.log('Popover closed');
      alert('Popover closed');
    }
  }
};

/**
 * PopoverCredentialPicker in Dark Context
 * Shows how the popover looks in a darker environment
 */
export const DarkContext: Story = {
  args: {
    credentials: sampleCredentials,
    onPick: (credential) => {
      console.log('Credential picked:', credential);
      alert(`Selected: ${credential.title} (${credential.username})`);
    },
    onClose: () => {
      console.log('Popover closed');
      alert('Popover closed');
    }
  },
  decorators: [
    (Story) => (
      <div style={{ 
        position: 'relative', 
        width: '400px', 
        height: '500px',
        border: '1px solid #333',
        padding: '20px',
        backgroundColor: '#2a2a2a',
        color: 'white'
      }}>
        <div style={{ 
          position: 'absolute',
          top: '50px',
          left: '50px',
          width: '320px'
        }}>
          <Story />
        </div>
      </div>
    )
  ]
};

/**
 * PopoverCredentialPicker Near Form Field
 * Simulates the popover appearing near a login form field
 */
export const NearFormField: Story = {
  args: {
    credentials: sampleCredentials,
    onPick: (credential) => {
      console.log('Credential picked:', credential);
      alert(`Selected: ${credential.title} (${credential.username})`);
    },
    onClose: () => {
      console.log('Popover closed');
      alert('Popover closed');
    }
  },
  decorators: [
    (Story) => (
      <div style={{ 
        position: 'relative', 
        width: '600px', 
        height: '600px',
        border: '1px solid #ccc',
        padding: '20px',
        backgroundColor: '#f9f9f9'
      }}>
        {/* Simulate a form field */}
        <div style={{
          position: 'absolute',
          top: '100px',
          left: '50px',
          width: '200px',
          height: '40px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          fontSize: '14px',
          color: '#666'
        }}>
          Email or username
        </div>
        
        {/* Popover positioned below the field */}
        <div style={{ 
          position: 'absolute',
          top: '150px',
          left: '50px',
          width: '320px'
        }}>
          <Story />
        </div>
      </div>
    )
  ]
};
