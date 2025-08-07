/**
 * Credential Picker Popover Storybook Stories
 * 
 * This file contains stories for the PopoverCredentialPicker component,
 * showcasing different credential scenarios and interactions with CredentialCard.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PopoverCredentialPicker } from '../../../PopoverCredentialPicker';

// Type for credential data used in stories
type CredentialData = {
  id: string;
  title: string;
  username: string;
  url?: string;
  itemKeyCipher: string;
  passwordCipher: string;
};

const meta: Meta<typeof PopoverCredentialPicker> = {
  title: 'Extension/Popovers/CredentialPicker',
  component: PopoverCredentialPicker,
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
    onPick: {
      description: 'Callback when a credential is selected',
      action: 'credential-picked'
    },
    onClose: {
      description: 'Callback when close button is clicked',
      action: 'close-clicked'
    }
  },
  decorators: [
    (Story) => (
      <div style={{ 
        position: 'relative', 
        width: '500px', 
        height: '400px',
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
    onPick: (credential: {
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
    onClose: () => {
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
    onPick: (credential: CredentialData) => {
      console.log('Credential picked:', credential);
      alert(`Selected: ${credential.title} (${credential.username})`);
    },
    onClose: () => {
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
    onPick: (credential: CredentialData) => {
      console.log('Credential picked:', credential);
    },
    onClose: () => {
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
    onPick: (credential: CredentialData) => {
      console.log('Credential picked:', credential);
      alert(`Selected: ${credential.title} (${credential.username})`);
    },
    onClose: () => {
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
    onPick: (credential: CredentialData) => {
      console.log('Credential picked:', credential);
      alert(`Selected: ${credential.title} (${credential.username})`);
    },
    onClose: () => {
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
    onPick: (credential: CredentialData) => {
      console.log('Credential picked:', credential);
      alert(`Selected: ${credential.title} (${credential.username})`);
    },
    onClose: () => {
      console.log('Close clicked');
      alert('Credential picker closed');
    }
  }
};

/**
 * Credential Picker Near Form Field
 * Simulates the popover appearing near a login form field using CredentialCard
 */
export const NearFormField: Story = {
  args: {
    credentials: sampleCredentials,
    onPick: (credential: CredentialData) => {
      console.log('Credential picked:', credential);
      alert(`Selected: ${credential.title} (${credential.username})`);
    },
    onClose: () => {
      console.log('Close clicked');
      alert('Credential picker closed');
    }
  },
  decorators: [
    (Story) => (
      <div style={{ 
        position: 'relative', 
        width: '600px', 
        height: '500px',
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

/**
 * Credential Picker in Dark Context
 * Shows how the popover looks in a darker environment using CredentialCard
 */
export const DarkContext: Story = {
  args: {
    credentials: sampleCredentials,
    onPick: (credential: CredentialData) => {
      console.log('Credential picked:', credential);
      alert(`Selected: ${credential.title} (${credential.username})`);
    },
    onClose: () => {
      console.log('Close clicked');
      alert('Credential picker closed');
    }
  },
  decorators: [
    (Story) => (
      <div style={{ 
        position: 'relative', 
        width: '500px', 
        height: '400px',
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
