/**
 * Login Prompt Popover Storybook Stories
 * 
 * This file contains stories for the LoginPromptPopover component,
 * showcasing different states and interactions.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LoginPromptPopover } from './LoginPromptPopover';

const meta: Meta<typeof LoginPromptPopover> = {
  title: 'Extension/Popovers/LoginPrompt',
  component: LoginPromptPopover,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Login prompt popover that appears when user needs to log in to use autofill features. This popover is displayed when clicking on login fields while not authenticated.'
      }
    }
  },
  argTypes: {
    onLogin: {
      description: 'Callback when login button is clicked',
      action: 'login-clicked'
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
        width: '400px', 
        height: '300px',
        border: '1px solid #ccc',
        padding: '20px',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ 
          position: 'absolute',
          top: '50px',
          left: '50px',
          width: '280px'
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
 * Default Login Prompt
 * Shows the standard login prompt with both login and cancel buttons
 */
export const Default: Story = {
  args: {
    onLogin: () => console.log('Login button clicked'),
    onCancel: () => console.log('Cancel button clicked')
  }
};

/**
 * Login Prompt with Custom Actions
 * Demonstrates custom action handling
 */
export const WithCustomActions: Story = {
  args: {
    onLogin: () => {
      console.log('Custom login action');
      alert('Opening SimpliPass popup...');
    },
    onCancel: () => {
      console.log('Custom cancel action');
      alert('Login prompt dismissed');
    }
  }
};

/**
 * Login Prompt in Dark Context
 * Shows how the popover looks in a darker environment
 */
export const DarkContext: Story = {
  args: {
    onLogin: () => console.log('Login button clicked'),
    onCancel: () => console.log('Cancel button clicked')
  },
  decorators: [
    (Story) => (
      <div style={{ 
        position: 'relative', 
        width: '400px', 
        height: '300px',
        border: '1px solid #333',
        padding: '20px',
        backgroundColor: '#2a2a2a',
        color: 'white'
      }}>
        <div style={{ 
          position: 'absolute',
          top: '50px',
          left: '50px',
          width: '280px'
        }}>
          <Story />
        </div>
      </div>
    )
  ]
};

/**
 * Login Prompt Near Form Field
 * Simulates the popover appearing near a login form field
 */
export const NearFormField: Story = {
  args: {
    onLogin: () => console.log('Login button clicked'),
    onCancel: () => console.log('Cancel button clicked')
  },
  decorators: [
    (Story) => (
      <div style={{ 
        position: 'relative', 
        width: '500px', 
        height: '400px',
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
          width: '280px'
        }}>
          <Story />
        </div>
      </div>
    )
  ]
};

/**
 * Login Prompt with Long Text
 * Shows how the popover handles longer content
 */
export const WithLongText: Story = {
  args: {
    onLogin: () => console.log('Login button clicked'),
    onCancel: () => console.log('Cancel button clicked')
  },
  render: (args) => (
    <div style={{
      position: 'absolute',
      zIndex: 10000,
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      padding: '16px',
      width: '320px',
      textAlign: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ marginBottom: '8px', fontSize: '16px', fontWeight: 600, color: '#333' }}>
        SimpliPass
      </div>
      <div style={{ 
        marginBottom: '16px', 
        fontSize: '14px', 
        color: '#666', 
        lineHeight: 1.4 
      }}>
        You need to log in to use autofill features. This will allow you to automatically fill in your saved credentials on websites.
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button 
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            minWidth: '80px',
            backgroundColor: '#F2F2F7',
            color: '#333'
          }}
          onClick={args.onCancel}
        >
          Cancel
        </button>
        <button 
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            minWidth: '80px',
            backgroundColor: '#007AFF',
            color: 'white'
          }}
          onClick={args.onLogin}
        >
          Login
        </button>
      </div>
    </div>
  )
};
