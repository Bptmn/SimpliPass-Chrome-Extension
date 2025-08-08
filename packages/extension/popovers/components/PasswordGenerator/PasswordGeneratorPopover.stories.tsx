/**
 * Password Generator Popover Storybook Stories
 * 
 * This file contains stories for the PasswordGeneratorPopover component,
 * showcasing different password generation scenarios and options.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PasswordGeneratorPopover } from './PasswordGeneratorPopover';

const meta: Meta<typeof PasswordGeneratorPopover> = {
  title: 'Extension/Popovers/PasswordGenerator',
  component: PasswordGeneratorPopover,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Password generator popover that appears when clicking on password fields. Allows users to generate secure passwords with customizable options.'
      }
    }
  },
  argTypes: {
    onAccept: {
      description: 'Callback when accept button is clicked',
      action: 'accept-clicked'
    },
    onRegenerate: {
      description: 'Callback when regenerate button is clicked',
      action: 'regenerate-clicked'
    },
    onCancel: {
      description: 'Callback when cancel button is clicked',
      action: 'cancel-clicked'
    },
    initialOptions: {
      description: 'Initial password generation options',
      control: { type: 'object' }
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
 * Default Password Generator
 * Shows the standard password generator with default options
 */
export const Default: Story = {
  args: {
    onAccept: (password: string) => {
      console.log('Password accepted:', password);
      alert(`Password accepted: ${password}`);
    },
    onRegenerate: () => {
      console.log('Regenerate clicked');
      alert('Generating new password...');
    },
    onCancel: () => {
      console.log('Cancel clicked');
      alert('Password generation cancelled');
    }
  }
};

/**
 * Password Generator with Custom Options
 * Shows the generator with specific initial options
 */
export const WithCustomOptions: Story = {
  args: {
    initialOptions: {
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: false
    },
    onAccept: (password: string) => {
      console.log('Password accepted:', password);
      alert(`Password accepted: ${password}`);
    },
    onRegenerate: () => {
      console.log('Regenerate clicked');
      alert('Generating new password...');
    },
    onCancel: () => {
      console.log('Cancel clicked');
      alert('Password generation cancelled');
    }
  }
};

/**
 * Password Generator with Short Password
 * Shows the generator configured for shorter passwords
 */
export const ShortPassword: Story = {
  args: {
    initialOptions: {
      length: 8,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: false,
      excludeSimilar: true
    },
    onAccept: (password: string) => {
      console.log('Password accepted:', password);
      alert(`Password accepted: ${password}`);
    },
    onRegenerate: () => {
      console.log('Regenerate clicked');
      alert('Generating new password...');
    },
    onCancel: () => {
      console.log('Cancel clicked');
      alert('Password generation cancelled');
    }
  }
};

/**
 * Password Generator with Long Password
 * Shows the generator configured for longer passwords
 */
export const LongPassword: Story = {
  args: {
    initialOptions: {
      length: 32,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: false
    },
    onAccept: (password: string) => {
      console.log('Password accepted:', password);
      alert(`Password accepted: ${password}`);
    },
    onRegenerate: () => {
      console.log('Regenerate clicked');
      alert('Generating new password...');
    },
    onCancel: () => {
      console.log('Cancel clicked');
      alert('Password generation cancelled');
    }
  }
};

/**
 * Password Generator with Letters Only
 * Shows the generator configured for letters only
 */
export const LettersOnly: Story = {
  args: {
    initialOptions: {
      length: 12,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: false,
      includeSymbols: false,
      excludeSimilar: true
    },
    onAccept: (password: string) => {
      console.log('Password accepted:', password);
      alert(`Password accepted: ${password}`);
    },
    onRegenerate: () => {
      console.log('Regenerate clicked');
      alert('Generating new password...');
    },
    onCancel: () => {
      console.log('Cancel clicked');
      alert('Password generation cancelled');
    }
  }
};

/**
 * Password Generator with Numbers Only
 * Shows the generator configured for numbers only
 */
export const NumbersOnly: Story = {
  args: {
    initialOptions: {
      length: 6,
      includeUppercase: false,
      includeLowercase: false,
      includeNumbers: true,
      includeSymbols: false,
      excludeSimilar: true
    },
    onAccept: (password: string) => {
      console.log('Password accepted:', password);
      alert(`Password accepted: ${password}`);
    },
    onRegenerate: () => {
      console.log('Regenerate clicked');
      alert('Generating new password...');
    },
    onCancel: () => {
      console.log('Cancel clicked');
      alert('Password generation cancelled');
    }
  }
};

/**
 * Password Generator with Symbols Only
 * Shows the generator configured for symbols only
 */
export const SymbolsOnly: Story = {
  args: {
    initialOptions: {
      length: 10,
      includeUppercase: false,
      includeLowercase: false,
      includeNumbers: false,
      includeSymbols: true,
      excludeSimilar: false
    },
    onAccept: (password: string) => {
      console.log('Password accepted:', password);
      alert(`Password accepted: ${password}`);
    },
    onRegenerate: () => {
      console.log('Regenerate clicked');
      alert('Generating new password...');
    },
    onCancel: () => {
      console.log('Cancel clicked');
      alert('Password generation cancelled');
    }
  }
};

/**
 * Password Generator Near Form Field
 * Simulates the popover appearing near a password field
 */
export const NearFormField: Story = {
  args: {
    onAccept: (password: string) => {
      console.log('Password accepted:', password);
      alert(`Password accepted: ${password}`);
    },
    onRegenerate: () => {
      console.log('Regenerate clicked');
      alert('Generating new password...');
    },
    onCancel: () => {
      console.log('Cancel clicked');
      alert('Password generation cancelled');
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
        {/* Simulate a password field */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '200px',
          height: '40px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          fontSize: '14px',
          color: '#666',
          zIndex: 1
        }}>
          ••••••••
        </div>
        
        {/* Popover positioned below the field */}
        <div style={{ 
          position: 'relative',
          width: '400px',
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
 * Password Generator in Dark Context
 * Shows how the popover looks in a darker environment
 */
export const DarkContext: Story = {
  args: {
    onAccept: (password: string) => {
      console.log('Password accepted:', password);
      alert(`Password accepted: ${password}`);
    },
    onRegenerate: () => {
      console.log('Regenerate clicked');
      alert('Generating new password...');
    },
    onCancel: () => {
      console.log('Cancel clicked');
      alert('Password generation cancelled');
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
          width: '400px',
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

/**
 * Password Generator with Weak Password
 * Shows the generator with settings that produce weak passwords
 */
export const WeakPassword: Story = {
  args: {
    initialOptions: {
      length: 4,
      includeUppercase: false,
      includeLowercase: true,
      includeNumbers: false,
      includeSymbols: false,
      excludeSimilar: true
    },
    onAccept: (password: string) => {
      console.log('Password accepted:', password);
      alert(`Password accepted: ${password}`);
    },
    onRegenerate: () => {
      console.log('Regenerate clicked');
      alert('Generating new password...');
    },
    onCancel: () => {
      console.log('Cancel clicked');
      alert('Password generation cancelled');
    }
  }
};

/**
 * Password Generator with Perfect Password
 * Shows the generator with settings that produce perfect passwords
 */
export const PerfectPassword: Story = {
  args: {
    initialOptions: {
      length: 20,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: false
    },
    onAccept: (password: string) => {
      console.log('Password accepted:', password);
      alert(`Password accepted: ${password}`);
    },
    onRegenerate: () => {
      console.log('Regenerate clicked');
      alert('Generating new password...');
    },
    onCancel: () => {
      console.log('Cancel clicked');
      alert('Password generation cancelled');
    }
  }
};
