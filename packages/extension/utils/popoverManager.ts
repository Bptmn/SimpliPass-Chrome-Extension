/**
 * Popover management utilities for Chrome extension
 * Handles creation, positioning, and cleanup of credential picker popover
 */

import { LoginField } from './fieldDetection';

let pickerIframe: HTMLIFrameElement | null = null;
let loginPromptIframe: HTMLIFrameElement | null = null;
let pickerTimeout: NodeJS.Timeout | null = null;
let currentLoginFields: LoginField[] = [];

/**
 * Show the credential picker popover
 * @param field The field that triggered the popover
 * @param credentials Array of credentials to display
 * @param loginFields Array of detected login fields
 */
export function showPopoverCredentialPicker(
  field: HTMLElement, 
  credentials: Array<{ id: string; title: string; username: string; url?: string }>,
  loginFields: LoginField[]
): void {
  removeInPagePicker();
  if (!credentials.length) return;
  
  // Store login fields for click away handler
  currentLoginFields = loginFields;
  
  // Create iframe directly (like the working old project)
  pickerIframe = document.createElement('iframe');
  pickerIframe.id = 'simpli-popover-iframe';
  pickerIframe.style.position = 'absolute';
  pickerIframe.style.zIndex = '2147483647';
  pickerIframe.style.width = `${Math.max(field.getBoundingClientRect().width, 320)}px`;
  pickerIframe.style.height = 'auto';
  pickerIframe.style.pointerEvents = 'auto';
  
  // Position the picker
  const anchorRect = field.getBoundingClientRect();
  pickerIframe.style.top = `${anchorRect.bottom + window.scrollY + 8}px`;
  pickerIframe.style.left = `${anchorRect.left + window.scrollX}px`;
  
  // Set iframe source
  pickerIframe.src = chrome.runtime.getURL('src/content/popovers/PopoverCredentialPicker.html');
  
  // Add iframe directly to page (like the working old project)
  document.body.appendChild(pickerIframe);
  
  // Send credentials to iframe after it loads
  pickerIframe.onload = () => {
    pickerIframe?.contentWindow?.postMessage({ 
      type: 'SHOW_CREDENTIALS', 
      credentials: credentials.map(c => ({
        id: c.id,
        title: c.title,
        username: c.username,
        url: c.url
      }))
    }, '*');
  };
  
  // Add timeout to auto-close picker
  pickerTimeout = setTimeout(() => {
    removeInPagePicker();
  }, 30000); // 30 seconds timeout
  
  // Add click away listener
  setTimeout(() => {
    document.addEventListener('mousedown', handleClickAway, true);
  }, 0);
}

/**
 * Remove the credential picker popover
 */
export function removeInPagePicker(): void {
  if (pickerIframe) {
    pickerIframe.remove();
    pickerIframe = null;
  }
  
  // Clear timeout
  if (pickerTimeout) {
    clearTimeout(pickerTimeout);
    pickerTimeout = null;
  }
  
  document.removeEventListener('mousedown', handleClickAway, true);
  currentLoginFields = [];
}

/**
 * Remove the login prompt popover
 */
export function removeLoginPrompt(): void {
  // Remove click away listener
  document.removeEventListener('mousedown', handleLoginPromptClickAway, true);
  
  // Remove iframe directly (like the working old project)
  if (loginPromptIframe) {
    loginPromptIframe.remove();
    loginPromptIframe = null;
  }
  
  // Clear references
  currentLoginFields = [];
}

/**
 * Handle clicks outside the picker to close it
 * @param e The mouse event
 */
function handleClickAway(e: MouseEvent): void {
  if (!pickerIframe) return;
  
  // Check if click is outside the picker iframe
  const isField = currentLoginFields.some(field => 
    field.element === e.target || field.element.contains(e.target as Node)
  );
  
  if (!pickerIframe.contains(e.target as Node) && !isField) {
    removeInPagePicker();
  }
}

/**
 * Handle clicks outside the login prompt to close it
 * @param e The mouse event
 */
function handleLoginPromptClickAway(e: MouseEvent): void {
  if (!loginPromptIframe) return;
  
  // Check if click is outside the login prompt iframe
  const isField = currentLoginFields.some(field => 
    field.element === e.target || field.element.contains(e.target as Node)
  );
  
  if (!loginPromptIframe.contains(e.target as Node) && !isField) {
    removeLoginPrompt();
  }
}

/**
 * Show the login prompt popover
 * @param field The field that triggered the popover
 * @param loginFields Array of detected login fields
 */
export function showLoginPromptPopover(
  field: HTMLElement,
  loginFields: LoginField[]
): void {
  removeLoginPrompt();
  removeInPagePicker();
  
  // Store login fields for click away handler
  currentLoginFields = loginFields;
  
  // Create iframe directly (like the working old project)
  loginPromptIframe = document.createElement('iframe');
  loginPromptIframe.id = 'simpli-login-prompt-iframe';
  loginPromptIframe.style.position = 'absolute';
  loginPromptIframe.style.zIndex = '2147483647';
  loginPromptIframe.style.width = '320px';
  loginPromptIframe.style.height = '120px';
  loginPromptIframe.style.pointerEvents = 'auto';
  loginPromptIframe.style.border = '2px solid blue'; // Debug border
  loginPromptIframe.style.backgroundColor = 'white';
  loginPromptIframe.style.borderRadius = '8px';
  loginPromptIframe.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  
  // Position the login prompt
  const anchorRect = field.getBoundingClientRect();
  loginPromptIframe.style.top = `${anchorRect.bottom + window.scrollY + 8}px`;
  loginPromptIframe.style.left = `${anchorRect.left + window.scrollX}px`;
  
  // Set iframe source
  const iframeSrc = chrome.runtime.getURL('src/content/popovers/LoginPromptPopover.html');
  console.log('[PopoverManager] Loading login prompt from:', iframeSrc);
  loginPromptIframe.src = iframeSrc;
  
  // Add iframe directly to page (like the working old project)
  document.body.appendChild(loginPromptIframe);
  
  // Add iframe load event listener for debugging
  loginPromptIframe.onload = () => {
    console.log('[PopoverManager] Login prompt iframe loaded successfully');
  };
  
  loginPromptIframe.onerror = (error) => {
    console.error('[PopoverManager] Error loading login prompt iframe:', error);
  };
  
  // Add click away listener
  setTimeout(() => {
    document.addEventListener('mousedown', handleLoginPromptClickAway, true);
  }, 0);
}

/**
 * Update picker iframe size
 * @param height New height
 * @param width New width
 */
export function updatePickerSize(height?: number, width?: number): void {
  if (pickerIframe) {
    if (typeof height === 'number') pickerIframe.style.height = `${height}px`;
    if (typeof width === 'number') pickerIframe.style.width = `${width}px`;
  }
} 