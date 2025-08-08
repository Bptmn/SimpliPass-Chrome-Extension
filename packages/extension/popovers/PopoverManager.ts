/**
 * Popover Manager for Chrome Extension
 * Handles popover creation, positioning, and communication
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { CredentialPickerPopover } from './components/CredentialPicker/CredentialPickerPopover';
import { LoginPromptPopover } from './components/LoginPrompt/LoginPromptPopover';

export interface PopoverOptions {
  position?: 'top' | 'bottom' | 'left' | 'right';
  offset?: { x: number; y: number };
  zIndex?: number;
}

export interface Credential {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
}

export class PopoverManager {
  private currentPopover: HTMLElement | null = null;
  private currentField: HTMLElement | null = null;

  /**
   * Create and show a login prompt popover
   */
  showLoginPrompt(targetField: HTMLElement, onLogin: () => void, onCancel: () => void): void {
    this.removeCurrentPopover();

    // Create container for React component - minimal styling to avoid double container
    const popover = document.createElement('div');
    popover.className = 'simplipass-login-prompt-popover';
    popover.style.cssText = `
      position: absolute;
      z-index: 10000;
    `;

    // Position and show
    this.positionPopover(popover, targetField);
    document.body.appendChild(popover);

    // Render LoginPromptPopover using React
    const root = createRoot(popover);
    root.render(
      React.createElement(LoginPromptPopover, {
        onLogin: () => {
          this.removeCurrentPopover();
          onLogin();
        },
        onCancel: () => {
          this.removeCurrentPopover();
          onCancel();
        }
      })
    );

    this.currentPopover = popover;
    this.currentField = targetField;

    // Add click outside handler
    this.addClickOutsideHandler(popover, () => {
      this.removeCurrentPopover();
      onCancel();
    });
  }

  /**
   * Create and show a credential picker popover using CredentialPickerPopover component
   */
  showCredentialPicker(
    targetField: HTMLElement, 
    credentials: Credential[], 
    onSelectCredential: (credential: Credential) => void, 
    onCancel: () => void
  ): void {
    this.removeCurrentPopover();
    
    // Create container for React component - minimal styling to avoid double container
    const popover = document.createElement('div');
    popover.className = 'simplipass-credential-picker-popover';
    popover.style.cssText = `
      position: absolute;
      z-index: 10000;
    `;
    
    // Position the popover
    this.positionPopover(popover, targetField);
    document.body.appendChild(popover);
    
    // Convert credentials to the format expected by CredentialPickerPopover
    const popoverCredentials = credentials.map(cred => ({
      id: cred.id,
      title: cred.title,
      username: cred.username,
      url: cred.url,
      itemKeyCipher: 'encrypted-key', // Placeholder - will be filled by parent
      passwordCipher: 'encrypted-password' // Placeholder - will be filled by parent
    }));
    
    // Create React root and render CredentialPickerPopover
    const root = createRoot(popover);
    
    root.render(
      React.createElement(CredentialPickerPopover, {
        credentials: popoverCredentials,
        onSelectCredential: (credential: any) => {
          this.removeCurrentPopover();
          // Convert back to the original credential format
          const originalCredential = credentials.find(c => c.id === credential.id);
          if (originalCredential) {
            onSelectCredential(originalCredential);
          }
        },
        onCancel: () => {
          this.removeCurrentPopover();
          onCancel();
        }
      })
    );
    
    this.currentPopover = popover;
    this.currentField = targetField;
    
    // Add click outside handler
    this.addClickOutsideHandler(popover, () => {
      this.removeCurrentPopover();
      onCancel();
    });
  }

  /**
   * Remove the current popover
   */
  removeCurrentPopover(): void {
    if (this.currentPopover) {
      this.currentPopover.remove();
      this.currentPopover = null;
      this.currentField = null;
    }
  }

  /**
   * Position popover relative to target field
   */
  private positionPopover(popover: HTMLElement, targetField: HTMLElement): void {
    const rect = targetField.getBoundingClientRect();
    const _popoverRect = popover.getBoundingClientRect(); // Mark as intentionally unused for now
    
    // Position below the field by default
    const top = rect.bottom + window.scrollY + 5;
    const left = rect.left + window.scrollX;
    
    popover.style.position = 'absolute';
    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;
    popover.style.zIndex = '10000';
  }

  /**
   * Add popover styles
   */
  private addPopoverStyles(_popover: HTMLElement): void {
    const style = document.createElement('style');
    style.textContent = `
      .simplipass-login-prompt-popover,
      .simplipass-credential-picker-popover {
        position: absolute;
        z-index: 10000;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 16px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
      }
      
      .simplipass-login-prompt-popover {
        width: 280px;
        text-align: center;
      }
      
      .simplipass-credential-picker-popover {
        width: 320px;
        max-height: 400px;
        overflow-y: auto;
      }
      
      .title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin-bottom: 8px;
      }
      
      .subtitle {
        font-size: 14px;
        color: #666;
        margin-bottom: 12px;
      }
      
      .message {
        font-size: 14px;
        color: #666;
        line-height: 1.4;
        margin-bottom: 16px;
      }
      
      .buttons {
        display: flex;
        gap: 8px;
        justify-content: center;
      }
      
      .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        min-width: 80px;
        transition: background-color 0.2s;
      }
      
      .btn-cancel {
        background-color: #F2F2F7;
        color: #333;
      }
      
      .btn-cancel:hover {
        background-color: #E5E5EA;
      }
      
      .btn-login {
        background-color: #007AFF;
        color: white;
      }
      
      .btn-login:hover {
        background-color: #0056CC;
      }
      
      .credentials-list {
        margin-bottom: 16px;
      }
      
      .credential-item {
        padding: 12px;
        border: 1px solid #E5E5EA;
        border-radius: 6px;
        margin-bottom: 8px;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .credential-item:hover {
        background-color: #F2F2F7;
      }
      
      .credential-title {
        font-size: 14px;
        font-weight: 500;
        color: #333;
        margin-bottom: 4px;
      }
      
      .credential-username {
        font-size: 13px;
        color: #666;
        margin-bottom: 2px;
      }
      
      .credential-url {
        font-size: 12px;
        color: #999;
      }
      
      .no-credentials {
        text-align: center;
        padding: 20px;
      }
      
      .no-credentials .message {
        color: #666;
        font-size: 14px;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Add click outside handler
   */
  private addClickOutsideHandler(popover: HTMLElement, onOutsideClick: () => void): void {
    const handleClickOutside = (event: MouseEvent) => {
      if (!popover.contains(event.target as Node) && 
          !this.currentField?.contains(event.target as Node)) {
        onOutsideClick();
        document.removeEventListener('click', handleClickOutside);
      }
    };
    
    // Delay to avoid immediate trigger
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);
  }
}

// Export singleton instance
export const popoverManager = new PopoverManager();
