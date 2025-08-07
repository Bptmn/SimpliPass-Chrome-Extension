/**
 * Popover management utilities for Chrome extension
 * Handles creation, positioning, and cleanup of credential picker popover
 */

import { LoginField } from './fieldDetection';

let pickerIframe: HTMLIFrameElement | null = null;
let loginPromptIframe: HTMLIFrameElement | null = null;
let passwordGeneratorIframe: HTMLIFrameElement | null = null;
let saveCredentialIframe: HTMLIFrameElement | null = null;
let updateCredentialIframe: HTMLIFrameElement | null = null;
let pickerTimeout: NodeJS.Timeout | null = null;
let currentLoginFields: LoginField[] = [];
let currentPasswordField: HTMLInputElement | null = null;
let _currentCapturedData: unknown = null;
let _currentExistingCredential: unknown = null;

/**
 * Position interface for popover positioning
 */
interface Position {
  top: number;
  left: number;
}

/**
 * Viewport dimensions interface
 */
interface ViewportDimensions {
  width: number;
  height: number;
}

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
  
  // Calculate optimal position
  const popoverWidth = Math.max(field.getBoundingClientRect().width, 320);
  const estimatedHeight = 200; // Estimate height for positioning
  const position = calculateOptimalPosition(field, popoverWidth, estimatedHeight);
  
  // Apply position
  pickerIframe.style.top = `${position.top}px`;
  pickerIframe.style.left = `${position.left}px`;
  
  // Set iframe source
  pickerIframe.src = chrome.runtime.getURL('src/content/popovers/PopoverCredentialPicker.html');
  
  // Add iframe directly to page (like the working old project)
  document.body.appendChild(pickerIframe);
  
  // Apply animation
  showPopoverWithAnimation(pickerIframe);
  
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
  
  // Add keyboard listeners
  addKeyboardListeners();
}

/**
 * Remove the credential picker popover
 */
export function removeInPagePicker(): void {
  if (pickerIframe) {
    hidePopoverWithAnimation(pickerIframe, () => {
      pickerIframe?.remove();
      pickerIframe = null;
    });
  }
  
  // Clear timeout
  if (pickerTimeout) {
    clearTimeout(pickerTimeout);
    pickerTimeout = null;
  }
  
  document.removeEventListener('mousedown', handleClickAway, true);
  removeKeyboardListeners();
  currentLoginFields = [];
}

/**
 * Remove the login prompt popover
 */
export function removeLoginPrompt(): void {
  // Remove click away listener
  document.removeEventListener('mousedown', handleLoginPromptClickAway, true);
  
  // Remove iframe with animation
  if (loginPromptIframe) {
    hidePopoverWithAnimation(loginPromptIframe, () => {
      loginPromptIframe?.remove();
      loginPromptIframe = null;
    });
  }
  
  // Remove keyboard listeners
  removeKeyboardListeners();
  
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
  
  // Calculate optimal position for login prompt
  const popoverWidth = 320;
  const popoverHeight = 120;
  const position = calculateOptimalPosition(field, popoverWidth, popoverHeight);
  
  // Apply position
  loginPromptIframe.style.top = `${position.top}px`;
  loginPromptIframe.style.left = `${position.left}px`;
  
  // Set iframe source
  const iframeSrc = chrome.runtime.getURL('src/content/popovers/LoginPromptPopover.html');
  console.log('[PopoverManager] Loading login prompt from:', iframeSrc);
  loginPromptIframe.src = iframeSrc;
  
  // Add iframe directly to page (like the working old project)
  document.body.appendChild(loginPromptIframe);
  
  // Apply animation
  showPopoverWithAnimation(loginPromptIframe);
  
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
  
  // Add keyboard listeners
  addKeyboardListeners();
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

/**
 * Calculate optimal position for popover
 * @param field The field that triggered the popover
 * @param popoverWidth Width of the popover
 * @param popoverHeight Height of the popover
 * @returns Optimal position for the popover
 */
export function calculateOptimalPosition(
  field: HTMLElement, 
  popoverWidth: number, 
  popoverHeight: number
): Position {
  const anchorRect = field.getBoundingClientRect();
  const viewport = getViewportDimensions();
  
  // Start with position below the field
  let top = anchorRect.bottom + window.scrollY + 8;
  let left = anchorRect.left + window.scrollX;
  
  // Check if popover would go below viewport
  if (top + popoverHeight > window.scrollY + viewport.height) {
    // Position above the field
    top = anchorRect.top + window.scrollY - popoverHeight - 8;
  }
  
  // Check if popover would go outside viewport horizontally
  if (left + popoverWidth > window.scrollX + viewport.width) {
    // Align to right edge of viewport
    left = window.scrollX + viewport.width - popoverWidth - 8;
  }
  
  // Ensure popover doesn't go off the left edge
  if (left < window.scrollX + 8) {
    left = window.scrollX + 8;
  }
  
  return { top, left };
}

/**
 * Check if position is within viewport
 * @param position The position to check
 * @param popoverWidth Width of the popover
 * @param popoverHeight Height of the popover
 * @returns true if position is within viewport
 */
export function isPositionWithinViewport(
  position: Position, 
  popoverWidth: number, 
  popoverHeight: number
): boolean {
  const viewport = getViewportDimensions();
  
  return (
    position.top >= window.scrollY &&
    position.top + popoverHeight <= window.scrollY + viewport.height &&
    position.left >= window.scrollX &&
    position.left + popoverWidth <= window.scrollX + viewport.width
  );
}

/**
 * Adjust position to fit within viewport
 * @param position The position to adjust
 * @param popoverWidth Width of the popover
 * @param popoverHeight Height of the popover
 * @returns Adjusted position
 */
export function adjustPositionForViewport(
  position: Position, 
  popoverWidth: number, 
  popoverHeight: number
): Position {
  const viewport = getViewportDimensions();
  let { top, left } = position;
  
  // Adjust vertical position
  if (top < window.scrollY) {
    top = window.scrollY + 8;
  }
  if (top + popoverHeight > window.scrollY + viewport.height) {
    top = window.scrollY + viewport.height - popoverHeight - 8;
  }
  
  // Adjust horizontal position
  if (left < window.scrollX) {
    left = window.scrollX + 8;
  }
  if (left + popoverWidth > window.scrollX + viewport.width) {
    left = window.scrollX + viewport.width - popoverWidth - 8;
  }
  
  return { top, left };
}

/**
 * Get viewport dimensions
 * @returns Viewport dimensions
 */
function getViewportDimensions(): ViewportDimensions {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

/**
 * Show popover with smooth animation
 * @param popover The popover element to animate
 */
export function showPopoverWithAnimation(popover: HTMLElement): void {
  // Set initial state
  popover.style.opacity = '0';
  popover.style.transform = 'scale(0.95) translateY(-10px)';
  popover.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
  
  // Trigger animation
  requestAnimationFrame(() => {
    popover.style.opacity = '1';
    popover.style.transform = 'scale(1) translateY(0)';
  });
}

/**
 * Hide popover with smooth animation
 * @param popover The popover element to animate
 * @param onComplete Callback when animation completes
 */
export function hidePopoverWithAnimation(
  popover: HTMLElement, 
  onComplete?: () => void
): void {
  popover.style.transition = 'opacity 0.15s ease-in, transform 0.15s ease-in';
  popover.style.opacity = '0';
  popover.style.transform = 'scale(0.95) translateY(-10px)';
  
  setTimeout(() => {
    onComplete?.();
  }, 150);
}

/**
 * Handle keyboard navigation for popovers
 * @param event The keyboard event
 */
export function handleKeyboardNavigation(event: KeyboardEvent): void {
  switch (event.key) {
    case 'Escape':
      removeInPagePicker();
      removeLoginPrompt();
      removePasswordGeneratorPopover();
      removeSaveCredentialPopover();
      removeUpdateCredentialPopover();
      break;
    case 'Enter':
      // Handle enter key for credential selection
      // This will be handled by the iframe content
      break;
    case 'ArrowUp':
    case 'ArrowDown':
      // Handle arrow keys for credential navigation
      // This will be handled by the iframe content
      break;
  }
}

/**
 * Add keyboard event listeners for popover navigation
 */
export function addKeyboardListeners(): void {
  document.addEventListener('keydown', handleKeyboardNavigation);
}

/**
 * Remove keyboard event listeners
 */
export function removeKeyboardListeners(): void {
  document.removeEventListener('keydown', handleKeyboardNavigation);
}

/**
 * Show password generator popover
 * @param field The password field that triggered the popover
 * @param initialOptions Initial password generation options
 */
export function showPasswordGeneratorPopover(
  field: HTMLInputElement,
  initialOptions?: {
    length: number;
    includeUppercase: boolean;
    includeLowercase: boolean;
    includeNumbers: boolean;
    includeSymbols: boolean;
    excludeSimilar: boolean;
  }
): void {
  removePasswordGeneratorPopover();
  removeInPagePicker();
  removeLoginPrompt();
  
  // Store current password field
  currentPasswordField = field;
  
  // Create iframe for password generator
  passwordGeneratorIframe = document.createElement('iframe');
  passwordGeneratorIframe.id = 'simpli-password-generator-iframe';
  passwordGeneratorIframe.style.position = 'absolute';
  passwordGeneratorIframe.style.zIndex = '2147483647';
  passwordGeneratorIframe.style.width = '320px';
  passwordGeneratorIframe.style.height = '400px';
  passwordGeneratorIframe.style.pointerEvents = 'auto';
  passwordGeneratorIframe.style.border = 'none';
  passwordGeneratorIframe.style.borderRadius = '8px';
  passwordGeneratorIframe.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  
  // Calculate optimal position
  const popoverWidth = 320;
  const popoverHeight = 400;
  const position = calculateOptimalPosition(field, popoverWidth, popoverHeight);
  
  // Apply position
  passwordGeneratorIframe.style.top = `${position.top}px`;
  passwordGeneratorIframe.style.left = `${position.left}px`;
  
  // Set iframe source
  passwordGeneratorIframe.src = chrome.runtime.getURL('popovers/components/PasswordGenerator/PasswordGeneratorPopover.html');
  
  // Add iframe to page
  document.body.appendChild(passwordGeneratorIframe);
  
  // Apply animation
  showPopoverWithAnimation(passwordGeneratorIframe);
  
  // Send initial options to iframe after it loads
  passwordGeneratorIframe.onload = () => {
    passwordGeneratorIframe?.contentWindow?.postMessage({
      type: 'SHOW_PASSWORD_GENERATOR',
      initialOptions
    }, '*');
  };
  
  // Add message listener for password generator events
  window.addEventListener('message', handlePasswordGeneratorMessage);
  
  // Add keyboard listeners
  addKeyboardListeners();
  
  // Add click away listener
  setTimeout(() => {
    document.addEventListener('mousedown', handlePasswordGeneratorClickAway, true);
  }, 0);
}

/**
 * Remove password generator popover
 */
export function removePasswordGeneratorPopover(): void {
  if (passwordGeneratorIframe) {
    hidePopoverWithAnimation(passwordGeneratorIframe, () => {
      passwordGeneratorIframe?.remove();
      passwordGeneratorIframe = null;
    });
  }
  
  // Remove message listener
  window.removeEventListener('message', handlePasswordGeneratorMessage);
  
  // Remove click away listener
  document.removeEventListener('mousedown', handlePasswordGeneratorClickAway, true);
  
  // Clear references
  currentPasswordField = null;
}

/**
 * Show save credential popover
 * @param capturedData The captured credential data
 * @param suggestedTitle Suggested title for the credential
 */
export function showSaveCredentialPopover(
  capturedData: unknown,
  suggestedTitle?: string
): void {
  removeSaveCredentialPopover();
  removeInPagePicker();
  removeLoginPrompt();
  removePasswordGeneratorPopover();
  
  // Store current captured data
  currentCapturedData = capturedData;
  
  // Create iframe for save credential popover
  saveCredentialIframe = document.createElement('iframe');
  saveCredentialIframe.id = 'simpli-save-credential-iframe';
  saveCredentialIframe.style.position = 'absolute';
  saveCredentialIframe.style.zIndex = '2147483647';
  saveCredentialIframe.style.width = '400px';
  saveCredentialIframe.style.height = '500px';
  saveCredentialIframe.style.pointerEvents = 'auto';
  saveCredentialIframe.style.border = 'none';
  saveCredentialIframe.style.borderRadius = '8px';
  saveCredentialIframe.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  
  // Position at top of page
  saveCredentialIframe.style.top = '20px';
  saveCredentialIframe.style.left = '50%';
  saveCredentialIframe.style.transform = 'translateX(-50%)';
  
  // Set iframe source
  saveCredentialIframe.src = chrome.runtime.getURL('popovers/components/SaveCredential/SaveCredentialPopover.html');
  
  // Add iframe to page
  document.body.appendChild(saveCredentialIframe);
  
  // Apply animation
  showPopoverWithAnimation(saveCredentialIframe);
  
  // Send data to iframe after it loads
  saveCredentialIframe.onload = () => {
    saveCredentialIframe?.contentWindow?.postMessage({
      type: 'SHOW_SAVE_CREDENTIAL',
      capturedData,
      suggestedTitle
    }, '*');
  };
  
  // Add message listener for save credential events
  window.addEventListener('message', handleSaveCredentialMessage);
  
  // Add keyboard listeners
  addKeyboardListeners();
  
  // Add click away listener
  setTimeout(() => {
    document.addEventListener('mousedown', handleSaveCredentialClickAway, true);
  }, 0);
}

/**
 * Remove save credential popover
 */
export function removeSaveCredentialPopover(): void {
  if (saveCredentialIframe) {
    hidePopoverWithAnimation(saveCredentialIframe, () => {
      saveCredentialIframe?.remove();
      saveCredentialIframe = null;
    });
  }
  
  // Remove message listener
  window.removeEventListener('message', handleSaveCredentialMessage);
  
  // Remove click away listener
  document.removeEventListener('mousedown', handleSaveCredentialClickAway, true);
  
  // Clear references
  _currentCapturedData = null;
}

/**
 * Handle save credential message events
 * @param event Message event
 */
function handleSaveCredentialMessage(event: MessageEvent): void {
  if (!saveCredentialIframe || event.source !== saveCredentialIframe.contentWindow) {
    return;
  }
  
  switch (event.data.type) {
    case 'SAVE_CREDENTIAL_REQUEST':
      // Send save request to background script
      chrome.runtime.sendMessage({
        type: 'SAVE_CREDENTIAL',
        credential: event.data.credential
      });
      removeSaveCredentialPopover();
      break;
      
    case 'SAVE_CREDENTIAL_DISMISS':
      removeSaveCredentialPopover();
      break;
  }
}

/**
 * Handle clicks outside save credential to close it
 * @param e The mouse event
 */
function handleSaveCredentialClickAway(e: MouseEvent): void {
  if (!saveCredentialIframe) return;
  
  if (!saveCredentialIframe.contains(e.target as Node)) {
    removeSaveCredentialPopover();
  }
}

/**
 * Show update credential popover
 * @param capturedData The captured credential data
 * @param existingCredential The existing credential data
 */
export function showUpdateCredentialPopover(
  capturedData: unknown,
  existingCredential: unknown
): void {
  removeUpdateCredentialPopover();
  removeInPagePicker();
  removeLoginPrompt();
  removePasswordGeneratorPopover();
  removeSaveCredentialPopover();
  
  // Store current data
  _currentCapturedData = capturedData;
  _currentExistingCredential = existingCredential;
  
  // Create iframe for update credential popover
  updateCredentialIframe = document.createElement('iframe');
  updateCredentialIframe.id = 'simpli-update-credential-iframe';
  updateCredentialIframe.style.position = 'absolute';
  updateCredentialIframe.style.zIndex = '2147483647';
  updateCredentialIframe.style.width = '450px';
  updateCredentialIframe.style.height = '600px';
  updateCredentialIframe.style.pointerEvents = 'auto';
  updateCredentialIframe.style.border = 'none';
  updateCredentialIframe.style.borderRadius = '8px';
  updateCredentialIframe.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  
  // Position at top of page
  updateCredentialIframe.style.top = '20px';
  updateCredentialIframe.style.left = '50%';
  updateCredentialIframe.style.transform = 'translateX(-50%)';
  
  // Set iframe source
  updateCredentialIframe.src = chrome.runtime.getURL('popovers/components/UpdateCredential/UpdateCredentialPopover.html');
  
  // Add iframe to page
  document.body.appendChild(updateCredentialIframe);
  
  // Apply animation
  showPopoverWithAnimation(updateCredentialIframe);
  
  // Send data to iframe after it loads
  updateCredentialIframe.onload = () => {
    updateCredentialIframe?.contentWindow?.postMessage({
      type: 'SHOW_UPDATE_CREDENTIAL',
      capturedData,
      existingCredential
    }, '*');
  };
  
  // Add message listener for update credential events
  window.addEventListener('message', handleUpdateCredentialMessage);
  
  // Add keyboard listeners
  addKeyboardListeners();
  
  // Add click away listener
  setTimeout(() => {
    document.addEventListener('mousedown', handleUpdateCredentialClickAway, true);
  }, 0);
}

/**
 * Remove update credential popover
 */
export function removeUpdateCredentialPopover(): void {
  if (updateCredentialIframe) {
    hidePopoverWithAnimation(updateCredentialIframe, () => {
      updateCredentialIframe?.remove();
      updateCredentialIframe = null;
    });
  }
  
  // Remove message listener
  window.removeEventListener('message', handleUpdateCredentialMessage);
  
  // Remove click away listener
  document.removeEventListener('mousedown', handleUpdateCredentialClickAway, true);
  
  // Clear references
  _currentCapturedData = null;
  _currentExistingCredential = null;
}

/**
 * Handle update credential message events
 * @param event Message event
 */
function handleUpdateCredentialMessage(event: MessageEvent): void {
  if (!updateCredentialIframe || event.source !== updateCredentialIframe.contentWindow) {
    return;
  }
  
  switch (event.data.type) {
    case 'UPDATE_CREDENTIAL_REQUEST':
      // Send update request to background script
      chrome.runtime.sendMessage({
        type: 'UPDATE_CREDENTIAL',
        credential: event.data.credential
      });
      removeUpdateCredentialPopover();
      break;
      
    case 'KEEP_EXISTING_CREDENTIAL':
      // Just dismiss the popover
      removeUpdateCredentialPopover();
      break;
      
    case 'UPDATE_CREDENTIAL_DISMISS':
      removeUpdateCredentialPopover();
      break;
  }
}

/**
 * Handle clicks outside update credential to close it
 * @param e The mouse event
 */
function handleUpdateCredentialClickAway(e: MouseEvent): void {
  if (!updateCredentialIframe) return;
  
  if (!updateCredentialIframe.contains(e.target as Node)) {
    removeUpdateCredentialPopover();
  }
}

/**
 * Handle password generator message events
 * @param event Message event
 */
function handlePasswordGeneratorMessage(event: MessageEvent): void {
  if (!passwordGeneratorIframe || event.source !== passwordGeneratorIframe.contentWindow) {
    return;
  }
  
  switch (event.data.type) {
    case 'PASSWORD_GENERATOR_ACCEPT':
      if (currentPasswordField && event.data.password) {
        // Inject password into field
        currentPasswordField.value = event.data.password;
        currentPasswordField.dispatchEvent(new Event('input', { bubbles: true }));
        currentPasswordField.dispatchEvent(new Event('change', { bubbles: true }));
        currentPasswordField.focus();
      }
      removePasswordGeneratorPopover();
      break;
      
    case 'PASSWORD_GENERATOR_REGENERATE':
      // Regenerate password (handled by the iframe component)
      break;
      
    case 'PASSWORD_GENERATOR_CANCEL':
      removePasswordGeneratorPopover();
      break;
  }
}

/**
 * Handle clicks outside password generator to close it
 * @param e The mouse event
 */
function handlePasswordGeneratorClickAway(e: MouseEvent): void {
  if (!passwordGeneratorIframe) return;
  
  // Check if click is outside the password generator iframe
  const isField = currentPasswordField === e.target || 
                  (currentPasswordField && currentPasswordField.contains(e.target as Node));
  
  if (!passwordGeneratorIframe.contains(e.target as Node) && !isField) {
    removePasswordGeneratorPopover();
  }
} 