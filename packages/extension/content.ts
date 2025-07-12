/**
 * Content Script - Chrome Extension
 * 
 * This content script is injected into every page. It acts as an organizer that:
 * - Detects login fields using fieldDetection utility
 * - Manages popover display using popoverManager utility
 * - Handles credential injection using credentialInjection utility
 * - Coordinates communication between background script and page
 */

import { detectLoginFields, getPageInfo, LoginField } from './utils/fieldDetection';
import { showPopoverCredentialPicker, showLoginPromptPopover, removeInPagePicker, removeLoginPrompt, updatePickerSize } from './utils/popoverManager';
import { injectCredential } from './utils/credentialInjection';

// Debounce function to avoid excessive scanning
function debounce<T extends (...args: unknown[]) => unknown>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Global state
let loginFields: LoginField[] = [];
let isProcessingField = false; // Flag to prevent duplicate processing

/**
 * Handle field click events
 */
async function handleFieldClick(e: Event): Promise<void> {
  const field = e.target as HTMLElement;
  
  // Prevent duplicate processing
  if (isProcessingField) {
    return;
  }
  
  // Check if this is a detected login field
  const loginField = loginFields.find(f => f.element === field);
  if (!loginField) return;
  
  isProcessingField = true;
  
  try {
    // Check session status first
    const sessionResponse = await new Promise<{ isValid: boolean }>((resolve) => {
      chrome.runtime.sendMessage({ 
        type: 'GET_SESSION_STATUS'
      }, resolve);
    });
    
    if (!sessionResponse || !sessionResponse.isValid) {
      console.log('[Content Script] No valid session found, showing login prompt');
      showLoginPromptPopover(field, loginFields);
      return;
    }

    // Get matching credentials for current domain
    const response = await new Promise<{ credentials: Array<{ id: string; title: string; username: string; url?: string }> }>((resolve) => {
      chrome.runtime.sendMessage({ 
        type: 'GET_MATCHING_CREDENTIALS', 
        domain: getPageInfo().domain 
      }, resolve);
    });
    
    if (response && response.credentials && response.credentials.length > 0) {
      showPopoverCredentialPicker(field, response.credentials, loginFields);
    } else {
      console.log('[Content Script] No matching credentials found or session not valid');
      removeInPagePicker();
    }
  } catch (error) {
    console.error('Error getting credentials:', error);
    removeInPagePicker();
  } finally {
    // Reset flag after a short delay to allow for natural user interactions
    setTimeout(() => {
      isProcessingField = false;
    }, 100);
  }
}

/**
 * Setup event listeners for detected login fields
 */
function setupLoginFieldListeners(): void {
  // Remove existing listeners
  loginFields.forEach(field => {
    field.element.removeEventListener('click', handleFieldClick);
  });
  
  // Add listeners to detected fields
  loginFields.forEach(field => {
    field.element.addEventListener('click', handleFieldClick);
  });
}

/**
 * Update field detection and listeners
 */
function updateFieldDetection(): void {
  loginFields = detectLoginFields();
  console.log('[Content Script] Detected login fields:', loginFields.length);
  setupLoginFieldListeners();
}

// Debounced field detection
const debouncedDetectFields = debounce(updateFieldDetection, 300);

// Initialize page
const pageInfo = getPageInfo();

// Register content script with background for log forwarding
chrome.runtime.sendMessage({ type: 'CONTENT_SCRIPT_READY' });

// Send page info to background script
chrome.runtime.sendMessage({ type: 'PAGE_INFO', ...pageInfo });

// Detect fields on page load
debouncedDetectFields();

// Listen for DOM changes to detect dynamically added fields
const observer = new MutationObserver(debouncedDetectFields);
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['style', 'class']
});

// Listen for messages from the iframe for actions
window.addEventListener('message', (event) => {
  const { type, credential, height, width } = event.data || {};
  
  if (type === 'POPOVER_RESIZE') {
    updatePickerSize(height, width);
  } else if (type === 'PICK_CREDENTIAL' && credential) {
    if (credential.id) {
      // Request full credential data from background
      chrome.runtime.sendMessage({
        type: 'INJECT_CREDENTIAL',
        credentialId: credential.id
      });
    }
    removeInPagePicker();
  } else if (type === 'CLOSE_POPOVER') {
    removeInPagePicker();
  } else if (type === 'LOGIN_PROMPT_CANCEL') {
    removeLoginPrompt();
  } else if (type === 'LOGIN_PROMPT_LOGIN') {
    removeLoginPrompt();
    // Open the extension popup
    chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
  }
});

// Listen for credential injection messages from background script
chrome.runtime.onMessage.addListener((msg: { type: string; username?: string; password?: string; level?: string; message?: string }) => {
  if (msg && msg.type === 'INJECT_CREDENTIAL' && msg.username && msg.password) {
    injectCredential(msg.username, msg.password);
    removeInPagePicker();
  } else if (msg && msg.type === 'BACKGROUND_LOG') {
    // Display background logs in content script console
    const prefix = '[Background → Content]';
    switch (msg.level) {
      case 'error':
        console.error(prefix, msg.message);
        break;
      case 'warn':
        console.warn(prefix, msg.message);
        break;
      default:
        console.log(prefix, msg.message);
    }
  }
});
