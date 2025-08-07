/**
 * Popover Manager Storybook Stories
 * 
 * This file contains stories for the PopoverManager utility,
 * showcasing different popover scenarios and interactions.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { PopoverManager } from './PopoverManager';

const meta: Meta<typeof PopoverManager> = {
  title: 'Extension/Popovers/PopoverManager',
  component: PopoverManager,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'PopoverManager utility that handles popover creation, positioning, and management for the Chrome extension. This utility creates and manages login prompts and credential pickers.'
      }
    }
  },
  decorators: [
    (Story) => (
      <div style={{ 
        position: 'relative', 
        width: '800px', 
        height: '600px',
        border: '1px solid #ccc',
        padding: '20px',
        backgroundColor: '#f5f5f5'
      }}>
        <Story />
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
    password: 'password123',
    url: 'https://facebook.com'
  },
  {
    id: '2',
    title: 'Google Account',
    username: 'john.doe@gmail.com',
    password: 'password456',
    url: 'https://accounts.google.com'
  },
  {
    id: '3',
    title: 'GitHub',
    username: 'johndoe',
    password: 'password789',
    url: 'https://github.com'
  }
];

/**
 * Interactive Demo
 * Shows how the PopoverManager works in a real scenario
 */
export const InteractiveDemo: Story = {
  render: () => {
    const manager = new PopoverManager();
    
    const showLoginPrompt = () => {
      const targetField = document.createElement('div');
      targetField.style.cssText = `
        position: absolute;
        top: 100px;
        left: 50px;
        width: 200px;
        height: 40px;
        border: 1px solid #ccc;
        border-radius: 4px;
        background: white;
        display: flex;
        align-items: center;
        padding: 0 12px;
        font-size: 14px;
        color: #666;
      `;
      targetField.textContent = 'Email or username';
      document.body.appendChild(targetField);
      
      manager.showLoginPrompt(
        targetField,
        () => {
          console.log('Login button clicked');
          alert('Opening SimpliPass popup...');
          targetField.remove();
        },
        () => {
          console.log('Cancel button clicked');
          alert('Login prompt cancelled');
          targetField.remove();
        }
      );
    };
    
    const showCredentialPicker = () => {
      const targetField = document.createElement('div');
      targetField.style.cssText = `
        position: absolute;
        top: 200px;
        left: 50px;
        width: 200px;
        height: 40px;
        border: 1px solid #ccc;
        border-radius: 4px;
        background: white;
        display: flex;
        align-items: center;
        padding: 0 12px;
        font-size: 14px;
        color: #666;
      `;
      targetField.textContent = 'Email or username';
      document.body.appendChild(targetField);
      
      manager.showCredentialPicker(
        targetField,
        sampleCredentials,
        (credential) => {
          console.log('Credential selected:', credential);
          alert(`Selected: ${credential.title} (${credential.username})`);
          targetField.remove();
        },
        () => {
          console.log('Cancel button clicked');
          alert('Credential picker cancelled');
          targetField.remove();
        }
      );
    };
    
    const removeCurrentPopover = () => {
      manager.removeCurrentPopover();
    };
    
    return (
      <div style={{ padding: '20px' }}>
        <h2 style={{ marginBottom: '20px' }}>PopoverManager Interactive Demo</h2>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={showLoginPrompt}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007AFF',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Show Login Prompt
          </button>
          
          <button 
            onClick={showCredentialPicker}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Show Credential Picker
          </button>
          
          <button 
            onClick={removeCurrentPopover}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Remove Current Popover
          </button>
        </div>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}>
          <h3>Instructions:</h3>
          <ul>
            <li>Click "Show Login Prompt" to see the login prompt popover</li>
            <li>Click "Show Credential Picker" to see the credential picker popover</li>
            <li>Click "Remove Current Popover" to remove any active popover</li>
            <li>Click outside any popover to close it</li>
            <li>Try clicking the buttons inside the popovers</li>
          </ul>
        </div>
      </div>
    );
  }
};

/**
 * Multiple Popovers Demo
 * Shows how the manager handles multiple popovers
 */
export const MultiplePopovers: Story = {
  render: () => {
    const manager = new PopoverManager();
    
    const showMultiplePopovers = () => {
      // Create multiple target fields
      const fields = [];
      for (let i = 0; i < 3; i++) {
        const field = document.createElement('div');
        field.style.cssText = `
          position: absolute;
          top: ${100 + i * 80}px;
          left: ${50 + i * 50}px;
          width: 200px;
          height: 40px;
          border: 1px solid #ccc;
          border-radius: 4px;
          background: white;
          display: flex;
          align-items: center;
          padding: 0 12px;
          font-size: 14px;
          color: #666;
        `;
        field.textContent = `Field ${i + 1}`;
        document.body.appendChild(field);
        fields.push(field);
      }
      
      // Show different popovers for each field
      setTimeout(() => {
        manager.showLoginPrompt(
          fields[0],
          () => {
            console.log('Login 1 clicked');
            alert('Login 1 clicked');
            fields[0].remove();
          },
          () => {
            console.log('Cancel 1 clicked');
            alert('Cancel 1 clicked');
            fields[0].remove();
          }
        );
      }, 100);
      
      setTimeout(() => {
        manager.showCredentialPicker(
          fields[1],
          sampleCredentials,
          (credential) => {
            console.log('Credential selected:', credential);
            alert(`Selected: ${credential.title}`);
            fields[1].remove();
          },
          () => {
            console.log('Cancel 2 clicked');
            alert('Cancel 2 clicked');
            fields[1].remove();
          }
        );
      }, 200);
      
      setTimeout(() => {
        manager.showLoginPrompt(
          fields[2],
          () => {
            console.log('Login 3 clicked');
            alert('Login 3 clicked');
            fields[2].remove();
          },
          () => {
            console.log('Cancel 3 clicked');
            alert('Cancel 3 clicked');
            fields[2].remove();
          }
        );
      }, 300);
    };
    
    const clearAll = () => {
      manager.removeCurrentPopover();
      // Remove any remaining fields
      document.querySelectorAll('div[style*="position: absolute"]').forEach(el => {
        if (el.textContent?.includes('Field')) {
          el.remove();
        }
      });
    };
    
    return (
      <div style={{ padding: '20px' }}>
        <h2 style={{ marginBottom: '20px' }}>Multiple Popovers Demo</h2>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={showMultiplePopovers}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007AFF',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Show Multiple Popovers
          </button>
          
          <button 
            onClick={clearAll}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear All
          </button>
        </div>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}>
          <h3>Instructions:</h3>
          <ul>
            <li>Click "Show Multiple Popovers" to see multiple popovers appear</li>
            <li>Notice how only one popover is active at a time</li>
            <li>Click "Clear All" to remove all popovers and fields</li>
            <li>This demonstrates the manager's ability to handle multiple popovers</li>
          </ul>
        </div>
      </div>
    );
  }
};

/**
 * Positioning Demo
 * Shows different positioning scenarios
 */
export const PositioningDemo: Story = {
  render: () => {
    const manager = new PopoverManager();
    
    const showPopoverAtPosition = (top: number, left: number, type: 'login' | 'credential') => {
      const field = document.createElement('div');
      field.style.cssText = `
        position: absolute;
        top: ${top}px;
        left: ${left}px;
        width: 200px;
        height: 40px;
        border: 1px solid #ccc;
        border-radius: 4px;
        background: white;
        display: flex;
        align-items: center;
        padding: 0 12px;
        font-size: 14px;
        color: #666;
      `;
      field.textContent = 'Target Field';
      document.body.appendChild(field);
      
      if (type === 'login') {
        manager.showLoginPrompt(
          field,
          () => {
            console.log('Login clicked');
            alert('Login clicked');
            field.remove();
          },
          () => {
            console.log('Cancel clicked');
            alert('Cancel clicked');
            field.remove();
          }
        );
      } else {
        manager.showCredentialPicker(
          field,
          sampleCredentials,
          (credential) => {
            console.log('Credential selected:', credential);
            alert(`Selected: ${credential.title}`);
            field.remove();
          },
          () => {
            console.log('Cancel clicked');
            alert('Cancel clicked');
            field.remove();
          }
        );
      }
    };
    
    return (
      <div style={{ padding: '20px' }}>
        <h2 style={{ marginBottom: '20px' }}>Positioning Demo</h2>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => showPopoverAtPosition(50, 50, 'login')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007AFF',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Top Left - Login
          </button>
          
          <button 
            onClick={() => showPopoverAtPosition(50, 300, 'credential')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Top Right - Credential
          </button>
          
          <button 
            onClick={() => showPopoverAtPosition(200, 50, 'login')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007AFF',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Bottom Left - Login
          </button>
          
          <button 
            onClick={() => showPopoverAtPosition(200, 300, 'credential')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Bottom Right - Credential
          </button>
        </div>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}>
          <h3>Instructions:</h3>
          <ul>
            <li>Click different buttons to see popovers positioned at different locations</li>
            <li>Notice how the popovers are positioned relative to their target fields</li>
            <li>Each popover appears below its target field</li>
            <li>Try clicking outside popovers to close them</li>
          </ul>
        </div>
      </div>
    );
  }
};
