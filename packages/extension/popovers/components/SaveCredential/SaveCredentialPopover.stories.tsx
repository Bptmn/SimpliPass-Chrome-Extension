/**
 * Save Credential Popover Storybook Stories
 * 
 * This file contains stories for the SaveCredentialPopover component,
 * showcasing different credential capture scenarios and form states.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SaveCredentialPopover } from './SaveCredentialPopover';
import { CapturedCredentials } from '../../../utils/formCapture';

// Type for the credential parameter in callbacks
type CredentialData = {
  title: string;
  username: string;
  password: string;
  url: string;
  notes?: string;
};

const meta: Meta<typeof SaveCredentialPopover> = {
  title: 'Extension/Popovers/SaveCredential',
  component: SaveCredentialPopover,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Save credential popover that appears when new credentials are detected on a website. Allows users to save or dismiss captured credentials.'
      }
    }
  },
  argTypes: {
    capturedData: {
      description: 'Captured credential data from the form',
      control: { type: 'object' }
    },
    onSave: {
      description: 'Callback when save button is clicked',
      action: 'save-clicked'
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
  password: 'securepassword123',
  timestamp: Date.now(),
  formId: 'login-form',
  fieldNames: {
    username: 'email',
    password: 'pass'
  }
};

/**
 * Default Save Credential
 * Shows the standard save credential popover with captured data
 */
export const Default: Story = {
  args: {
    capturedData: sampleCapturedData,
    onSave: async (credential: CredentialData) => {
      console.log('Save credential:', credential);
      alert(`Saving credential: ${credential.title}`);
    },
    onDismiss: () => {
      console.log('Dismiss clicked');
      alert('Save credential dismissed');
    }
  }
};

/**
 * Save Credential with Long Data
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
    onSave: async (credential: CredentialData) => {
      console.log('Save credential:', credential);
      alert(`Saving credential: ${credential.title}`);
    },
    onDismiss: () => {
      console.log('Dismiss clicked');
      alert('Save credential dismissed');
    }
  }
};

/**
 * Save Credential with Empty Data
 * Shows the popover when minimal data is captured
 */
export const WithEmptyData: Story = {
  args: {
    capturedData: {
      domain: 'example.com',
      url: 'https://example.com',
      username: '',
      password: '',
      timestamp: Date.now(),
      formId: 'empty-form',
      fieldNames: {
        username: 'user',
        password: 'pass'
      }
    },
    onSave: async (credential: CredentialData) => {
      console.log('Save credential:', credential);
      alert(`Saving credential: ${credential.title}`);
    },
    onDismiss: () => {
      console.log('Dismiss clicked');
      alert('Save credential dismissed');
    }
  }
};

/**
 * Save Credential with Secure Site
 * Shows the popover for a secure HTTPS site
 */
export const SecureSite: Story = {
  args: {
    capturedData: {
      ...sampleCapturedData,
      url: 'https://accounts.google.com/signin',
      domain: 'accounts.google.com'
    },
    onSave: async (credential: CredentialData) => {
      console.log('Save credential:', credential);
      alert(`Saving credential: ${credential.title}`);
    },
    onDismiss: () => {
      console.log('Dismiss clicked');
      alert('Save credential dismissed');
    }
  }
};

/**
 * Save Credential with Custom Title
 * Shows the popover with a custom suggested title
 */
export const WithCustomTitle: Story = {
  args: {
    capturedData: sampleCapturedData,
    onSave: async (credential: CredentialData) => {
      console.log('Save credential:', credential);
      alert(`Saving credential: ${credential.title}`);
    },
    onDismiss: () => {
      console.log('Dismiss clicked');
      alert('Save credential dismissed');
    }
  }
};

/**
 * Save Credential Near Form Field
 * Simulates the popover appearing near a form field
 */
export const NearFormField: Story = {
  args: {
    capturedData: sampleCapturedData,
    onSave: async (credential: CredentialData) => {
      console.log('Save credential:', credential);
      alert(`Saving credential: ${credential.title}`);
    },
    onDismiss: () => {
      console.log('Dismiss clicked');
      alert('Save credential dismissed');
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
          width: '450px',
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
 * Save Credential in Dark Context
 * Shows how the popover looks in a darker environment
 */
export const DarkContext: Story = {
  args: {
    capturedData: sampleCapturedData,
    onSave: async (credential: CredentialData) => {
      console.log('Save credential:', credential);
      alert(`Saving credential: ${credential.title}`);
    },
    onDismiss: () => {
      console.log('Dismiss clicked');
      alert('Save credential dismissed');
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
          width: '450px',
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
