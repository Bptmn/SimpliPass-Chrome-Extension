/**
 * Context Menu Integration for SimpliPass Extension
 * 
 * Provides right-click context menu actions for:
 * - Fill username/password manually
 * - Generate password
 * - Open password manager
 * - Save current form
 */

import { getMatchingCredentials } from './utils/autofillBridge';
import { showPopoverCredentialPicker } from './utils/popoverManager';
import { showPasswordGeneratorPopover } from './utils/popoverManager';
import { showSaveCredentialPopover } from './utils/popoverManager';
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
  if (!tab?.id) return;

  switch (info.menuItemId) {
    case 'simpli-fill-credentials':
      handleFillCredentials(tab);
      break;
    case 'simpli-generate-password':
      handleGeneratePassword(tab, info);
      break;
    case 'simpli-open-manager':
      handleOpenManager(tab);
      break;
    case 'simpli-save-form':
      handleSaveForm(tab);
      break;
  }
}

/**
 * Handle fill credentials action
 */
async function handleFillCredentials(tab: chrome.tabs.Tab): Promise<void> {
  try {
    // Send message to content script to show credential picker
    await chrome.tabs.sendMessage(tab.id!, {
      type: 'SHOW_CONTEXT_MENU_CREDENTIAL_PICKER'
    });
  } catch (error) {
    console.error('[ContextMenu] Error showing credential picker:', error);
  }
}

/**
 * Handle generate password action
 */
async function handleGeneratePassword(
  tab: chrome.tabs.Tab, 
  info: chrome.contextMenus.OnClickData
): Promise<void> {
  try {
    // Send message to content script to show password generator
    await chrome.tabs.sendMessage(tab.id!, {
      type: 'SHOW_CONTEXT_MENU_PASSWORD_GENERATOR',
      targetElement: info.targetElementId
    });
  } catch (error) {
    console.error('[ContextMenu] Error showing password generator:', error);
  }
}

/**
 * Handle open manager action
 */
async function handleOpenManager(tab: chrome.tabs.Tab): Promise<void> {
  try {
    // Open the popup
    await chrome.action.openPopup();
  } catch (error) {
    console.error('[ContextMenu] Error opening manager:', error);
  }
}

/**
 * Handle save form action
 */
async function handleSaveForm(tab: chrome.tabs.Tab): Promise<void> {
  try {
    // Send message to content script to capture and save current form
    await chrome.tabs.sendMessage(tab.id!, {
      type: 'SHOW_CONTEXT_MENU_SAVE_FORM'
    });
  } catch (error) {
    console.error('[ContextMenu] Error saving form:', error);
  }
}

/**
 * Update context menu visibility based on current page
 */
export async function updateContextMenuVisibility(tab: chrome.tabs.Tab): Promise<void> {
  if (!tab.url) return;

  try {
    // Check if contextMenus API is available
    if (!chrome.contextMenus) {
      console.warn('[ContextMenu] contextMenus API not available');
      return;
    }

    const url = new URL(tab.url);
    const domain = url.hostname;

    // Check if we have credentials for this domain
    const credentials = await getMatchingCredentials(domain);
    const hasCredentials = credentials.length > 0;

    // Update fill credentials menu visibility
    chrome.contextMenus.update('simpli-fill-credentials', {
      visible: hasCredentials,
      enabled: hasCredentials
    });

    // Update save form menu visibility (always visible on forms)
    chrome.contextMenus.update('simpli-save-form', {
      visible: true,
      enabled: true
    });

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
        showPopoverCredentialPicker(
          action.data.field as HTMLElement,
          action.data.credentials,
          []
        );
      }
      break;
    case 'generate_password':
      if (action.data?.field) {
        showPasswordGeneratorPopover(action.data.field as HTMLInputElement);
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
      showSaveCredentialPopover(capturedData, suggestedTitle);
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