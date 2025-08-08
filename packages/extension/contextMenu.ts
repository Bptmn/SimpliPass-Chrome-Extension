/**
 * Context Menu Management for Chrome Extension
 * Handles right-click context menu items and actions
 * 
 * TODO: Update to use the new organized PopoverManager from popovers/PopoverManager.ts
 */

// TODO: Update to use new PopoverManager
// import { showPopoverCredentialPicker } from './utils/popoverManager';
// import { showPasswordGeneratorPopover } from './utils/popoverManager';
// import { showSaveCredentialPopover } from './utils/popoverManager';
import { credentialCaptureService } from './services/credentialCaptureService';

/**
 * Context menu item types
 */
export interface ContextMenuItem {
  id: string;
  title: string;
  contexts: chrome.contextMenus.ContextType[];
  enabled?: boolean;
  visible?: boolean;
}

/**
 * Context menu actions
 */
export interface ContextMenuAction {
  type: 'fill_credentials' | 'generate_password' | 'open_manager' | 'save_form';
  data?: {
    field?: HTMLInputElement;
    credentials?: Array<{ id: string; title: string; username: string; url?: string }>;
    domain?: string;
  };
}

/**
 * Initialize context menu
 */
export function initializeContextMenu(): void {
  try {
    // Check if contextMenus API is available
    if (!chrome || !chrome.contextMenus) {
      console.warn('[ContextMenu] contextMenus API not available');
      return;
    }

    // Remove existing context menus
    chrome.contextMenus.removeAll();

    // Create context menu items
    createContextMenuItems();
  } catch (error) {
    console.error('[ContextMenu] Error initializing context menu:', error);
  }
}

/**
 * Create context menu items
 */
function createContextMenuItems(): void {
  try {
    // Check if contextMenus API is available
    if (!chrome.contextMenus) {
      console.warn('[ContextMenu] contextMenus API not available');
      return;
    }

    // Fill credentials menu
    chrome.contextMenus.create({
      id: 'simpli-fill-credentials',
      title: 'SimpliPass: Fill Credentials',
      contexts: ['editable'],
      documentUrlPatterns: ['<all_urls>']
    });

    // Generate password menu
    chrome.contextMenus.create({
      id: 'simpli-generate-password',
      title: 'SimpliPass: Generate Password',
      contexts: ['editable'],
      documentUrlPatterns: ['<all_urls>']
    });

    // Open password manager menu
    chrome.contextMenus.create({
      id: 'simpli-open-manager',
      title: 'SimpliPass: Open Manager',
      contexts: ['page', 'selection'],
      documentUrlPatterns: ['<all_urls>']
    });

    // Save current form menu
    chrome.contextMenus.create({
      id: 'simpli-save-form',
      title: 'SimpliPass: Save Form',
      contexts: ['page'],
      documentUrlPatterns: ['<all_urls>']
    });

    // Separator
    chrome.contextMenus.create({
      id: 'simpli-separator',
      type: 'separator',
      contexts: ['page', 'selection', 'editable'],
      documentUrlPatterns: ['<all_urls>']
    });
  } catch (error) {
    console.error('[ContextMenu] Error creating context menu items:', error);
  }
}

/**
 * Handle context menu clicks
 */
export function handleContextMenuClick(
  info: chrome.contextMenus.OnClickData,
  tab: chrome.tabs.Tab | undefined
): void {
  try {
    console.log('[ContextMenu] Context menu clicked:', info.menuItemId);
    
    // TODO: Update to use new PopoverManager
    // const targetElementId = info.targetElementId;
    // if (!targetElementId) {
    //   console.warn('[ContextMenu] No target element ID');
    //   return;
    // }
    
    switch (info.menuItemId) {
      case 'simpli-fill-credentials':
        // TODO: Update to use new PopoverManager
        console.log('[ContextMenu] Fill credentials selected');
        break;
      case 'simpli-generate-password':
        // TODO: Update to use new PopoverManager
        console.log('[ContextMenu] Generate password selected');
        break;
      case 'simpli-open-manager':
        console.log('[ContextMenu] Open manager selected');
        if (tab?.id) {
          chrome.tabs.sendMessage(tab.id, { type: 'OPEN_POPUP' });
        }
        break;
      case 'simpli-save-form':
        // TODO: Update to use new PopoverManager
        console.log('[ContextMenu] Save form selected');
        break;
      default:
        console.log('[ContextMenu] Unknown menu item:', info.menuItemId);
    }
  } catch (error) {
    console.error('[ContextMenu] Error handling context menu click:', error);
  }
}

/**
 * Handle fill credentials action
 */
async function _handleFillCredentials(_tab: chrome.tabs.Tab): Promise<void> {
  try {
    // Send message to content script to show credential picker
    // await chrome.tabs.sendMessage(tab.id!, {
    //   type: 'SHOW_CONTEXT_MENU_CREDENTIAL_PICKER'
    // });
    console.log('[ContextMenu] Fill credentials clicked - TODO: implement with new PopoverManager');
  } catch (error) {
    console.error('[ContextMenu] Error showing credential picker:', error);
  }
}

/**
 * Handle generate password action
 */
async function _handleGeneratePassword(
  _tab: chrome.tabs.Tab, 
  _info: chrome.contextMenus.OnClickData
): Promise<void> {
  try {
    // Send message to content script to show password generator
    // await chrome.tabs.sendMessage(tab.id!, {
    //   type: 'SHOW_CONTEXT_MENU_PASSWORD_GENERATOR',
    //   // TODO: Update to use new PopoverManager
    //   // targetElement: info.targetElementId
    // });
    console.log('[ContextMenu] Generate password clicked - TODO: implement with new PopoverManager');
  } catch (error) {
    console.error('[ContextMenu] Error showing password generator:', error);
  }
}

/**
 * Handle open manager action
 */
async function _handleOpenManager(_tab: chrome.tabs.Tab): Promise<void> {
  try {
    // Open the popup
    // await chrome.action.openPopup();
    console.log('[ContextMenu] Open manager clicked - TODO: implement with new PopoverManager');
  } catch (error) {
    console.error('[ContextMenu] Error opening manager:', error);
  }
}

/**
 * Handle save form action
 */
async function _handleSaveForm(_tab: chrome.tabs.Tab): Promise<void> {
  try {
    // Send message to content script to capture and save current form
    // await chrome.tabs.sendMessage(tab.id!, {
    //   type: 'SHOW_CONTEXT_MENU_SAVE_FORM'
    // });
    console.log('[ContextMenu] Save form clicked - TODO: implement with new PopoverManager');
  } catch (error) {
    console.error('[ContextMenu] Error saving form:', error);
  }
}

/**
 * Update context menu visibility based on current page
 */
export async function updateContextMenuVisibility(tab: chrome.tabs.Tab): Promise<void> {
  try {
    console.log('[ContextMenu] Updating context menu visibility for tab:', tab.id);
    
    // Check if contextMenus API is available
    if (!chrome.contextMenus) {
      console.warn('[ContextMenu] contextMenus API not available');
      return;
    }
    
    // TODO: Update to use new PopoverManager and get actual capabilities
    // const capabilities = await getMatchingCredentials(tab.url || '');
    // const hasCredentials = capabilities.length > 0;
    
    // For now, just log the action
    console.log('[ContextMenu] Would update menu visibility based on capabilities');
    
    // TODO: Update to use new PopoverManager
    // chrome.contextMenus.update('simpli-fill-credentials', {
    //   enabled: hasCredentials
    // });
    // chrome.contextMenus.update('simpli-save-form', {
    //   enabled: true // Always enabled for now
    // });
  } catch (error) {
    console.error('[ContextMenu] Error updating menu visibility:', error);
  }
}

/**
 * Handle context menu actions from content script
 */
export function handleContentScriptContextMenuAction(action: ContextMenuAction): void {
  switch (action.type) {
    case 'fill_credentials':
      if (action.data?.credentials) {
        // TODO: Update to use new PopoverManager
        // showPopoverCredentialPicker(
        //   action.data.field as HTMLElement,
        //   action.data.credentials,
        //   []
        // );
      }
      break;
    case 'generate_password':
      if (action.data?.field) {
        // TODO: Update to use new PopoverManager
        // showPasswordGeneratorPopover(action.data.field as HTMLInputElement);
      }
      break;
    case 'save_form':
      // Trigger form capture and save
      handleContextMenuSaveForm();
      break;
  }
}

/**
 * Handle context menu save form action
 */
async function handleContextMenuSaveForm(): Promise<void> {
  try {
    // Get current form data
    const forms = document.querySelectorAll('form');
    if (forms.length === 0) return;

    // Find the most relevant form (usually the first one)
    const form = forms[0] as HTMLFormElement;
    
    // Extract form data
    const formData = extractFormData(form);
    if (!formData) return;

    // Process captured data
    const capturedData = {
      username: formData.username,
      password: formData.password,
      url: window.location.href,
      domain: window.location.hostname,
      timestamp: Date.now(),
      formId: form.id || undefined,
      fieldNames: {
        username: formData.usernameField?.name,
        password: formData.passwordField?.name
      }
    };

    // Check if this is an update or new credential
    const updateCheck = await credentialCaptureService.isCredentialUpdate(capturedData);
    
    if (updateCheck.isUpdate && updateCheck.existingCredential) {
      // Show update popover
      // This would be handled by the existing update logic
      console.log('[ContextMenu] Update credential detected');
    } else {
      // Show save popover
      const suggestedTitle = credentialCaptureService.getSuggestedTitle(capturedData);
      const _suggestedTitle = suggestedTitle; // Mark as intentionally unused for now
      // TODO: Update to use new PopoverManager
      // showSaveCredentialPopover(capturedData, suggestedTitle);
    }
  } catch (error) {
    console.error('[ContextMenu] Error saving form:', error);
  }
}

/**
 * Extract form data from a form element
 */
function extractFormData(form: HTMLFormElement): {
  username: string;
  password: string;
  usernameField?: HTMLInputElement;
  passwordField?: HTMLInputElement;
} | null {
  try {
    const usernameField = findUsernameField(form);
    const passwordField = findPasswordField(form);

    if (!usernameField || !passwordField) {
      return null;
    }

    return {
      username: usernameField.value,
      password: passwordField.value,
      usernameField,
      passwordField
    };
  } catch (error) {
    console.error('[ContextMenu] Error extracting form data:', error);
    return null;
  }
}

/**
 * Find username field in form
 */
function findUsernameField(form: HTMLFormElement): HTMLInputElement | null {
  const selectors = [
    'input[name*="username" i]',
    'input[name*="email" i]',
    'input[name*="login" i]',
    'input[name*="user" i]',
    'input[type="email"]',
    'input[autocomplete="username"]',
    'input[autocomplete="email"]'
  ];

  for (const selector of selectors) {
    const field = form.querySelector(selector) as HTMLInputElement;
    if (field && field.value.trim()) {
      return field;
    }
  }

  return null;
}

/**
 * Find password field in form
 */
function findPasswordField(form: HTMLFormElement): HTMLInputElement | null {
  const selectors = [
    'input[type="password"]',
    'input[name*="password" i]',
    'input[autocomplete="current-password"]',
    'input[autocomplete="new-password"]'
  ];

  for (const selector of selectors) {
    const field = form.querySelector(selector) as HTMLInputElement;
    if (field && field.value.trim()) {
      return field;
    }
  }

  return null;
}

/**
 * Cleanup context menu
 */
export function cleanupContextMenu(): void {
  try {
    // Check if contextMenus API is available
    if (!chrome.contextMenus) {
      console.warn('[ContextMenu] contextMenus API not available');
      return;
    }

    chrome.contextMenus.removeAll();
  } catch (error) {
    console.error('[ContextMenu] Error cleaning up context menu:', error);
  }
} 