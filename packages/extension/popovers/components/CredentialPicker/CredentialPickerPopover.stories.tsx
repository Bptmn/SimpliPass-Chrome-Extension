/**
 * Credential Picker Popover Storybook Stories
 * 
 * This file contains stories for the CredentialPickerPopover component,
 * showcasing different credential scenarios and interactions.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CredentialPickerPopover } from './CredentialPickerPopover';

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
      action: 'credential-selected'
    },
    onCancel: {
      description: 'Callback when cancel button is clicked',
      action: 'cancel-clicked'
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
    url: 'https://facebook.com'
  },
  {
    id: '2',
    title: 'Google Account',
    username: 'john.doe@gmail.com',
    url: 'https://accounts.google.com'
  },
  {
    id: '3',
    title: 'GitHub',
    username: 'johndoe',
    url: 'https://github.com'
  },
  {
    id: '4',
    title: 'LinkedIn',
    username: 'john.doe@example.com',
    url: 'https://linkedin.com'
  }
];

/**
 * Default Credential Picker
 * Shows the standard credential picker with multiple credentials
 */
export const Default: Story = {
  args: {
    credentials: sampleCredentials,
    onSelectCredential: (credential) => {
      console.log('Credential selected:', credential);
      alert(`Selected: ${credential.title} (${credential.username})`);
    },
    onCancel: () => {
      console.log('Cancel clicked');
      alert('Credential picker cancelled');
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
    onSelectCredential: (credential) => {
      console.log('Credential selected:', credential);
      alert(`Selected: ${credential.title} (${credential.username})`);
    },
    onCancel: () => {
      console.log('Cancel clicked');
      alert('Credential picker cancelled');
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
    onSelectCredential: (credential) => {
      console.log('Credential selected:', credential);
    },
    onCancel: () => {
      console.log('Cancel clicked');
      alert('Credential picker cancelled');
    }
  }
};

/**
 * Many Credentials
 * Shows the picker with many credentials (tests scrolling)
 */
export const ManyCredentials: Story = {
  args: {
    credentials: [
      ...sampleCredentials,
      {
        id: '5',
        title: 'Twitter',
        username: 'johndoe',
        url: 'https://twitter.com'
      },
      {
        id: '6',
        title: 'Instagram',
        username: 'john.doe@example.com',
        url: 'https://instagram.com'
      },
      {
        id: '7',
        title: 'Reddit',
        username: 'johndoe',
        url: 'https://reddit.com'
      },
      {
        id: '8',
        title: 'Discord',
        username: 'johndoe#1234',
        url: 'https://discord.com'
      },
      {
        id: '9',
        title: 'Slack',
        username: 'john.doe@company.com',
        url: 'https://slack.com'
      },
      {
        id: '10',
        title: 'Notion',
        username: 'john.doe@example.com',
        url: 'https://notion.so'
      }
    ],
    onSelectCredential: (credential) => {
      console.log('Credential selected:', credential);
      alert(`Selected: ${credential.title} (${credential.username})`);
    },
    onCancel: () => {
      console.log('Cancel clicked');
      alert('Credential picker cancelled');
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
        url: 'https://verylongwebsitename.com'
      },
      {
        id: '2',
        title: 'Another Very Long Website Name For Testing',
        username: 'johndoe',
        url: 'https://anotherverylongwebsitename.com'
      },
      {
        id: '3',
        title: 'Short',
        username: 'john.doe@gmail.com',
        url: 'https://short.com'
      }
    ],
    onSelectCredential: (credential) => {
      console.log('Credential selected:', credential);
      alert(`Selected: ${credential.title} (${credential.username})`);
    },
    onCancel: () => {
      console.log('Cancel clicked');
      alert('Credential picker cancelled');
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
        url: 'https://facebook.com'
      },
      {
        id: '2',
        title: 'Google',
        username: 'john.doe.work.account@gmail.com',
        url: 'https://accounts.google.com'
      },
      {
        id: '3',
        title: 'GitHub',
        username: 'john-doe-developer-username',
        url: 'https://github.com'
      }
    ],
    onSelectCredential: (credential) => {
      console.log('Credential selected:', credential);
      alert(`Selected: ${credential.title} (${credential.username})`);
    },
    onCancel: () => {
      console.log('Cancel clicked');
      alert('Credential picker cancelled');
    }
  }
};

/**
 * Credential Picker Near Form Field
 * Simulates the popover appearing near a login form field
 */
export const NearFormField: Story = {
  args: {
    credentials: sampleCredentials,
    onSelectCredential: (credential) => {
      console.log('Credential selected:', credential);
      alert(`Selected: ${credential.title} (${credential.username})`);
    },
    onCancel: () => {
      console.log('Cancel clicked');
      alert('Credential picker cancelled');
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
 * Shows how the popover looks in a darker environment
 */
export const DarkContext: Story = {
  args: {
    credentials: sampleCredentials,
    onSelectCredential: (credential) => {
      console.log('Credential selected:', credential);
      alert(`Selected: ${credential.title} (${credential.username})`);
    },
    onCancel: () => {
      console.log('Cancel clicked');
      alert('Credential picker cancelled');
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
