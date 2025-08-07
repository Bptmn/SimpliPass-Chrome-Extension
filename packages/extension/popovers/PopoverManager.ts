/**
 * Popover Manager for Chrome Extension
 * Handles popover creation, positioning, and communication
 */

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
    
    const popover = document.createElement('div');
    popover.className = 'simplipass-login-prompt-popover';
    popover.innerHTML = `
      <div class="login-prompt">
        <div class="title">SimpliPass</div>
        <div class="message">You need to log in to use autofill features.</div>
        <div class="buttons">
          <button id="cancel-btn" class="btn btn-cancel">Cancel</button>
          <button id="login-btn" class="btn btn-login">Login</button>
        </div>
      </div>
    `;

    // Add styles
    this.addPopoverStyles(popover);
    
    // Add event listeners
    popover.querySelector('#cancel-btn')?.addEventListener('click', () => {
      this.removeCurrentPopover();
      onCancel();
    });
    
    popover.querySelector('#login-btn')?.addEventListener('click', () => {
      this.removeCurrentPopover();
      onLogin();
    });
    
    // Position and show
    this.positionPopover(popover, targetField);
    document.body.appendChild(popover);
    
    this.currentPopover = popover;
    this.currentField = targetField;
    
    // Add click outside handler
    this.addClickOutsideHandler(popover, () => {
      this.removeCurrentPopover();
      onCancel();
    });
  }

  /**
   * Create and show a credential picker popover
   */
  showCredentialPicker(
    targetField: HTMLElement, 
    credentials: Credential[], 
    onSelectCredential: (credential: Credential) => void, 
    onCancel: () => void
  ): void {
    this.removeCurrentPopover();
    
    const popover = document.createElement('div');
    popover.className = 'simplipass-credential-picker-popover';
    
    const credentialsList = credentials.length > 0 
      ? credentials.map(cred => `
          <div class="credential-item" data-credential-id="${cred.id}">
            <div class="credential-title">${cred.title}</div>
            <div class="credential-username">${cred.username}</div>
            ${cred.url ? `<div class="credential-url">${cred.url}</div>` : ''}
          </div>
        `).join('')
      : '<div class="no-credentials"><div class="message">No matching credentials found</div></div>';
    
    popover.innerHTML = `
      <div class="credential-picker">
        <div class="title">SimpliPass</div>
        <div class="subtitle">Select a credential to autofill:</div>
        <div class="credentials-list">
          ${credentialsList}
        </div>
        <div class="buttons">
          <button id="cancel-btn" class="btn btn-cancel">Cancel</button>
        </div>
      </div>
    `;

    // Add styles
    this.addPopoverStyles(popover);
    
    // Add event listeners
    popover.querySelector('#cancel-btn')?.addEventListener('click', () => {
      this.removeCurrentPopover();
      onCancel();
    });
    
    // Add credential selection listeners
    popover.querySelectorAll('.credential-item').forEach(item => {
      item.addEventListener('click', () => {
        const credentialId = item.getAttribute('data-credential-id');
        const credential = credentials.find(c => c.id === credentialId);
        if (credential) {
          this.removeCurrentPopover();
          onSelectCredential(credential);
        }
      });
    });
    
    // Position and show
    this.positionPopover(popover, targetField);
    document.body.appendChild(popover);
    
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
    const popoverRect = popover.getBoundingClientRect();
    
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
  private addPopoverStyles(popover: HTMLElement): void {
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
