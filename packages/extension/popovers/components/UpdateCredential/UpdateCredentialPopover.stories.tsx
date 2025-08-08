/**
 * Update Credential Popover Storybook Stories
 * 
 * This file contains stories for the UpdateCredentialPopover component,
 * showcasing different credential update scenarios and diff states.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { UpdateCredentialPopover } from './UpdateCredentialPopover';
import { CapturedCredentials } from '../../../utils/formCapture';

// Type for the credential parameter in callbacks
type CredentialData = {
  id: string;
  title: string;
  username: string;
  password: string;
  url: string;
  notes?: string;
};

const meta: Meta<typeof UpdateCredentialPopover> = {
  title: 'Extension/Popovers/UpdateCredential',
  component: UpdateCredentialPopover,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Update credential popover that appears when existing credentials are detected with changes. Shows diff between old and new data and allows users to update or keep existing.'
      }
    }
  },
  argTypes: {
    capturedData: {
      description: 'Newly captured credential data from the form',
      control: { type: 'object' }
    },
    existingCredential: {
      description: 'Existing credential data from the vault',
      control: { type: 'object' }
    },
    onUpdate: {
      description: 'Callback when update button is clicked',
      action: 'update-clicked'
    },
    onKeepExisting: {
      description: 'Callback when keep existing button is clicked',
      action: 'keep-existing-clicked'
    },
    onDismiss: {
      description: 'Callback when dismiss button is clicked',
      action: 'dismiss-clicked'
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
 * Sample captured data for testing
 */
const sampleCapturedData: CapturedCredentials = {
  domain: 'facebook.com',
  url: 'https://facebook.com/login',
  username: 'john.doe@example.com',
  password: 'newsecurepassword123',
  timestamp: Date.now(),
  formId: 'login-form',
  fieldNames: {
    username: 'email',
    password: 'pass'
  }
};

/**
 * Sample existing credential for testing
 */
const sampleExistingCredential = {
  id: '1',
  title: 'Facebook',
  username: 'john.doe@example.com',
  password: 'oldpassword123',
  url: 'https://facebook.com/login',
  notes: 'Personal Facebook account'
};

/**
 * Default Update Credential
 * Shows the standard update credential popover with changes detected
 */
export const Default: Story = {
  args: {
    capturedData: sampleCapturedData,
    existingCredential: sampleExistingCredential,
    onUpdate: async (credential: CredentialData) => {
      console.log('Update credential:', credential);
      alert(`Updating credential: ${credential.title}`);
    },
    onKeepExisting: () => {
      console.log('Keep existing clicked');
      alert('Keeping existing credential');
    },
    onDismiss: () => {
      console.log('Dismiss clicked');
      alert('Update credential dismissed');
    }
  }
};

/**
 * Update Credential with Password Change
 * Shows the popover when only the password has changed
 */
export const PasswordChange: Story = {
  args: {
    capturedData: {
      ...sampleCapturedData,
      password: 'completelynewpassword456'
    },
    existingCredential: sampleExistingCredential,
    onUpdate: async (credential: CredentialData) => {
      console.log('Update credential:', credential);
      alert(`Updating credential: ${credential.title}`);
    },
    onKeepExisting: () => {
      console.log('Keep existing clicked');
      alert('Keeping existing credential');
    },
    onDismiss: () => {
      console.log('Dismiss clicked');
      alert('Update credential dismissed');
    }
  }
};

/**
 * Update Credential with Username Change
 * Shows the popover when the username has changed
 */
export const UsernameChange: Story = {
  args: {
    capturedData: {
      ...sampleCapturedData,
      username: 'john.doe.new@example.com'
    },
    existingCredential: sampleExistingCredential,
    onUpdate: async (credential: CredentialData) => {
      console.log('Update credential:', credential);
      alert(`Updating credential: ${credential.title}`);
    },
    onKeepExisting: () => {
      console.log('Keep existing clicked');
      alert('Keeping existing credential');
    },
    onDismiss: () => {
      console.log('Dismiss clicked');
      alert('Update credential dismissed');
    }
  }
};

/**
 * Update Credential with Title Change
 * Shows the popover when the title has changed
 */
export const TitleChange: Story = {
  args: {
    capturedData: {
      ...sampleCapturedData,
      domain: 'facebook.com'
    },
    existingCredential: {
      ...sampleExistingCredential,
      title: 'My Facebook Account'
    },
    onUpdate: async (credential: CredentialData) => {
      console.log('Update credential:', credential);
      alert(`Updating credential: ${credential.title}`);
    },
    onKeepExisting: () => {
      console.log('Keep existing clicked');
      alert('Keeping existing credential');
    },
    onDismiss: () => {
      console.log('Dismiss clicked');
      alert('Update credential dismissed');
    }
  }
};

/**
 * Update Credential with Multiple Changes
 * Shows the popover when multiple fields have changed
 */
export const MultipleChanges: Story = {
  args: {
    capturedData: {
      ...sampleCapturedData,
      username: 'john.doe.new@example.com',
      password: 'newpassword789',
      url: 'https://facebook.com/login/v2'
    },
    existingCredential: {
      ...sampleExistingCredential,
      title: 'My Facebook Account'
    },
    onUpdate: async (credential: CredentialData) => {
      console.log('Update credential:', credential);
      alert(`Updating credential: ${credential.title}`);
    },
    onKeepExisting: () => {
      console.log('Keep existing clicked');
      alert('Keeping existing credential');
    },
    onDismiss: () => {
      console.log('Dismiss clicked');
      alert('Update credential dismissed');
    }
  }
};

/**
 * Update Credential with No Changes
 * Shows the popover when no changes are detected
 */
export const NoChanges: Story = {
  args: {
    capturedData: sampleCapturedData,
    existingCredential: {
      ...sampleExistingCredential,
      username: 'john.doe@example.com',
      password: 'newsecurepassword123'
    },
    onUpdate: async (credential: CredentialData) => {
      console.log('Update credential:', credential);
      alert(`Updating credential: ${credential.title}`);
    },
    onKeepExisting: () => {
      console.log('Keep existing clicked');
      alert('Keeping existing credential');
    },
    onDismiss: () => {
      console.log('Dismiss clicked');
      alert('Update credential dismissed');
    }
  }
};

/**
 * Update Credential with Long Data
 * Shows how the popover handles long usernames and URLs
 */
export const WithLongData: Story = {
  args: {
    capturedData: {
      ...sampleCapturedData,
      username: 'very.long.email.address@verylongdomainname.com',
      url: 'https://very-long-subdomain.example.com/very-long-path/login',
      domain: 'very-long-subdomain.example.com'
    },
    existingCredential: {
      ...sampleExistingCredential,
      username: 'old.email@example.com',
      url: 'https://old.example.com/login'
    },
    onUpdate: async (credential: CredentialData) => {
      console.log('Update credential:', credential);
      alert(`Updating credential: ${credential.title}`);
    },
    onKeepExisting: () => {
      console.log('Keep existing clicked');
      alert('Keeping existing credential');
    },
    onDismiss: () => {
      console.log('Dismiss clicked');
      alert('Update credential dismissed');
    }
  }
};

/**
 * Update Credential with Secure Site
 * Shows the popover for a secure HTTPS site
 */
export const SecureSite: Story = {
  args: {
    capturedData: {
      ...sampleCapturedData,
      url: 'https://accounts.google.com/signin',
      domain: 'accounts.google.com'
    },
    existingCredential: {
      ...sampleExistingCredential,
      title: 'Google Account',
      url: 'https://accounts.google.com/signin'
    },
    onUpdate: async (credential: CredentialData) => {
      console.log('Update credential:', credential);
      alert(`Updating credential: ${credential.title}`);
    },
    onKeepExisting: () => {
      console.log('Keep existing clicked');
      alert('Keeping existing credential');
    },
    onDismiss: () => {
      console.log('Dismiss clicked');
      alert('Update credential dismissed');
    }
  }
};

/**
 * Update Credential Near Form Field
 * Simulates the popover appearing near a form field
 */
export const NearFormField: Story = {
  args: {
    capturedData: sampleCapturedData,
    existingCredential: sampleExistingCredential,
    onUpdate: async (credential: CredentialData) => {
      console.log('Update credential:', credential);
      alert(`Updating credential: ${credential.title}`);
    },
    onKeepExisting: () => {
      console.log('Keep existing clicked');
      alert('Keeping existing credential');
    },
    onDismiss: () => {
      console.log('Dismiss clicked');
      alert('Update credential dismissed');
    }
  },
  decorators: [
    (Story) => (
      <div style={{ 
        position: 'relative', 
        width: '100vw', 
        height: '100vh',
        border: '1px solid #ccc',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Simulate a form */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '300px',
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: 'white',
          zIndex: 1
        }}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
            <input 
              type="email" 
              value="john.doe@example.com"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}
              readOnly
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
            <input 
              type="password" 
              value="••••••••"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}
              readOnly
            />
          </div>
        </div>
        
        {/* Popover positioned below the form */}
        <div style={{ 
          position: 'relative',
          width: '500px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
          marginTop: '200px'
        }}>
          <Story />
        </div>
      </div>
    )
  ]
};

/**
 * Update Credential in Dark Context
 * Shows how the popover looks in a darker environment
 */
export const DarkContext: Story = {
  args: {
    capturedData: sampleCapturedData,
    existingCredential: sampleExistingCredential,
    onUpdate: async (credential: CredentialData) => {
      console.log('Update credential:', credential);
      alert(`Updating credential: ${credential.title}`);
    },
    onKeepExisting: () => {
      console.log('Keep existing clicked');
      alert('Keeping existing credential');
    },
    onDismiss: () => {
      console.log('Dismiss clicked');
      alert('Update credential dismissed');
    }
  },
  decorators: [
    (Story) => (
      <div style={{ 
        position: 'relative', 
        width: '100vw', 
        height: '100vh',
        border: '1px solid #333',
        padding: '20px',
        backgroundColor: '#2a2a2a',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          position: 'relative',
          width: '500px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          <Story />
        </div>
      </div>
    )
  ]
};
