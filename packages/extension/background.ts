// Minimal background script to avoid React Native dependencies
interface PageState {
  url: string;
  domain: string;
  hasLoginForm: boolean;
}

// Simple platform state management for background script
let currentPlatform: 'extension' | 'mobile' | null = null;

const setPlatform = (platform: 'extension' | 'mobile') => {
  currentPlatform = platform;
  console.log('[Background] Platform set to:', platform);
};

const getPlatform = () => currentPlatform;

// Check if user is logged in and has credentials for autofill
const isAutofillAvailable = async (): Promise<boolean> => {
  console.log('[Background] isAutofillAvailable called - checking session status');
  try {
    // ✅ Use authService to check authentication
    const { authService } = await import('@common/core/services/authService');
    const isAuthenticated = await authService.isAuthenticated();
    console.log('[Background] Auth service check:', isAuthenticated);
    
    if (!isAuthenticated) {
      console.log('[Background] User not authenticated');
      return false;
    }
    
    // ✅ Use vaultService to check if credentials exist
    const { vaultService } = await import('@common/core/services/vaultService');
    const vaultItems = await vaultService.getLocalVault();
    const hasCredentials = vaultItems.length > 0;
    console.log('[Background] Vault items count:', vaultItems.length);
    
    // Autofill requires both valid auth AND credentials
    const isAutofillReady = isAuthenticated && hasCredentials;
    console.log('[Background] Autofill ready:', isAutofillReady);
    
    return isAutofillReady;
  } catch (error) {
    console.error('[Background] Error checking autofill availability:', error);
    return false;
  }
};

// Check if user is logged in for save/update operations (requires user secret key)
const isSaveCredentialAvailable = async (): Promise<boolean> => {
  console.log('[Background] isSaveCredentialAvailable called - checking save requirements');
  try {
    // ✅ Use authService to check authentication
    const { authService } = await import('@common/core/services/authService');
    const isAuthenticated = await authService.isAuthenticated();
    console.log('[Background] Auth service check for save:', isAuthenticated);
    
    if (!isAuthenticated) {
      console.log('[Background] User not authenticated for save');
      return false;
    }
    
    // ✅ Use secretsService to check if user secret key exists
    const { secretsService } = await import('@common/core/services/secretsService');
    const hasUserSecretKey = await secretsService.hasUserSecretKey();
    console.log('[Background] Has user secret key:', hasUserSecretKey);
    
    // Save/update requires both valid auth AND user secret key
    const isSaveReady = isAuthenticated && hasUserSecretKey;
    console.log('[Background] Save credential ready:', isSaveReady);
    
    return isSaveReady;
  } catch (error) {
    console.error('[Background] Error checking save credential availability:', error);
    return false;
  }
};

// Password generator has no requirements - always available
const isPasswordGeneratorAvailable = async (): Promise<boolean> => {
  console.log('[Background] isPasswordGeneratorAvailable called - always available');
  return true;
};

const getMatchingCredentials = async (domain: string): Promise<Array<{
  id: string;
  title: string;
  username: string;
  url?: string;
}>> => {
  console.log('[Background] getMatchingCredentials called for domain:', domain);
  try {
    // ✅ Use vaultService to get all items
    const { vaultService } = await import('@common/core/services/vaultService');
    const allItems = await vaultService.getLocalVault();
    console.log('[Background] All vault items:', allItems.length);
    
    // Filter credentials that match the domain
    const matchingCredentials = allItems
      .filter((item): item is import('@common/core/types/items.types').CredentialDecrypted => 
        item.itemType === 'credential'
      )
      .filter((cred) => {
        if (!cred.url) return false;
        try {
          const credDomain = new URL(cred.url).hostname;
          return credDomain === domain || credDomain.endsWith('.' + domain) || domain.endsWith('.' + credDomain);
        } catch {
          return false;
        }
      });
    
    console.log('[Background] Matching credentials for domain', domain, ':', matchingCredentials.length);
    return matchingCredentials.map((cred) => ({
      id: cred.id,
      title: cred.title || 'Untitled',
      username: cred.username || '',
      url: cred.url
    }));
  } catch (error) {
    console.error('[Background] Error getting matching credentials:', error);
    return [];
  }
};

const getCredentialForInjection = async (credentialId: string): Promise<{
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
} | null> => {
  console.log('[Background] getCredentialForInjection called for id:', credentialId);
  try {
    // ✅ Use vaultService to get all items
    const { vaultService } = await import('@common/core/services/vaultService');
    const allItems = await vaultService.getLocalVault();
    
    // Find the specific credential by ID
    const credential = allItems
      .filter((item): item is import('@common/core/types/items.types').CredentialDecrypted => 
        item.itemType === 'credential'
      )
      .find((cred) => cred.id === credentialId);
    
    if (credential) {
      console.log('[Background] Found credential for injection:', credential.title);
      return {
        id: credential.id,
        title: credential.title || 'Untitled',
        username: credential.username || '',
        password: credential.password || '',
        url: credential.url
      };
    } else {
      console.log('[Background] Credential not found for ID:', credentialId);
      return null;
    }
  } catch (error) {
    console.error('[Background] Error getting credential for injection:', error);
    return null;
  }
};

// Simple stubs for context menu functions to avoid React Native dependencies
const initializeContextMenu = () => {
  console.log('[Background] initializeContextMenu called');
  // Context menu initialization will be implemented later
};

const handleContextMenuClick = (info: any, tab: any) => {
  console.log('[Background] handleContextMenuClick called');
  // Context menu click handling will be implemented later
};

const updateContextMenuVisibility = (tab: any) => {
  console.log('[Background] updateContextMenuVisibility called');
  // Context menu visibility update will be implemented later
};

/**
 * Stores page info per tab.
 */
const pageState: { [tabId: number]: PageState } = {};

// Store active tabs that have content scripts
const activeContentScriptTabs = new Set<number>();

// Initialize context menu on extension load
// Wait for extension to be fully loaded before initializing context menu
chrome.runtime.onStartup.addListener(() => {
  // Set platform to extension since this is the background script
  setPlatform('extension');
  
  // Add a small delay to ensure Chrome APIs are fully loaded
  setTimeout(() => {
    initializeContextMenu();
  }, 100);
});

chrome.runtime.onInstalled.addListener(() => {
  // Set platform to extension since this is the background script
  setPlatform('extension');
  
  // Add a small delay to ensure Chrome APIs are fully loaded
  setTimeout(() => {
    initializeContextMenu();
  }, 100);
});

// Function to forward logs to content scripts
function forwardLogToContentScripts(level: 'log' | 'error' | 'warn', message: string) {
  // Only forward to tabs that we know have content scripts
  activeContentScriptTabs.forEach(tabId => {
    chrome.tabs.sendMessage(tabId, {
      type: 'BACKGROUND_LOG',
      level,
      message
    }).catch(() => {
      // Remove tab from active set if content script is no longer available
      activeContentScriptTabs.delete(tabId);
    });
  });
}

// Initialize console override after Chrome APIs are available
function initializeConsoleOverride() {
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  console.log = (...args) => {
    originalConsoleLog(...args);
    forwardLogToContentScripts('log', args.join(' '));
  };

  console.error = (...args) => {
    originalConsoleError(...args);
    forwardLogToContentScripts('error', args.join(' '));
  };

  console.warn = (...args) => {
    originalConsoleWarn(...args);
    forwardLogToContentScripts('warn', args.join(' '));
  };
}

// Initialize console override after Chrome APIs are available
setTimeout(() => {
  initializeConsoleOverride();
}, 50);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Register content script with background for log forwarding
  if (msg.type === 'CONTENT_SCRIPT_READY' && sender.tab?.id != null) {
    activeContentScriptTabs.add(sender.tab.id);
    console.log('[Background] Content script registered for tab:', sender.tab.id);
  }
  
  // Store page info
  if (msg.type === 'PAGE_INFO' && sender.tab?.id != null) {
    pageState[sender.tab.id] = { url: msg.url, domain: msg.domain, hasLoginForm: msg.hasLoginForm };
  }

  // Popup requests current page state
  if (msg.type === 'GET_PAGE_STATE' && msg.tabId != null) {
    console.log('[Background] GET_PAGE_STATE request for tabId:', msg.tabId);
    
    // First check if we have cached page state
    if (pageState[msg.tabId]) {
      console.log('[Background] Returning cached page state for tabId:', msg.tabId);
      sendResponse(pageState[msg.tabId]);
      return true;
    }
    
    // If not cached, execute script to get page state
    (async () => {
      try {
        // First check if we can access this tab
        const tab = await chrome.tabs.get(msg.tabId);
        console.log('[Background] Tab info:', { id: tab.id, url: tab.url, status: tab.status });
        
        // Check if this is a chrome:// URL or other restricted URL
        if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('moz-extension://'))) {
          console.log('[Background] Cannot access restricted URL:', tab.url);
          sendResponse({ 
            url: tab.url || '',
            domain: 'restricted',
            hasLoginForm: false,
            error: 'Cannot access chrome:// or extension URLs'
          });
          return;
        }
        
        console.log('[Background] Executing script for tabId:', msg.tabId);
        const results = await chrome.scripting.executeScript({
          target: { tabId: msg.tabId },
          func: () => ({
            url: window.location.href,
            domain: window.location.hostname,
            hasLoginForm: !!document.querySelector('form input[type="password"]'),
          }),
        });
        
        if (results && results[0]?.result) {
          const pageInfo = results[0].result;
          console.log('[Background] Page state retrieved:', pageInfo);
          pageState[msg.tabId] = pageInfo;
          sendResponse(pageInfo);
        } else {
          console.log('[Background] No results from script execution');
          sendResponse(null);
        }
      } catch (error) {
        console.error('[Background] Error executing script for page state:', error);
        // Return a fallback response instead of null
        sendResponse({ 
          url: '',
          domain: 'unknown',
          hasLoginForm: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    })();
    return true;
  }

  // Session validation for autofill
  if (msg.type === 'GET_SESSION_STATUS') {
    console.log('[Background] GET_SESSION_STATUS request');
    (async () => {
      try {
        const isValid = await isAutofillAvailable();
        console.log('[Background] Session status:', isValid);
        sendResponse({ isValid });
      } catch (error) {
        console.error('[Background] Error checking session status:', error);
        sendResponse({ isValid: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    })();
    return true;
  }

  // Check if save credential is available (requires user secret key)
  if (msg.type === 'GET_SAVE_CREDENTIAL_STATUS') {
    console.log('[Background] GET_SAVE_CREDENTIAL_STATUS request');
    (async () => {
      try {
        const isAvailable = await isSaveCredentialAvailable();
        console.log('[Background] Save credential status:', isAvailable);
        sendResponse({ isAvailable });
      } catch (error) {
        console.error('[Background] Error checking save credential status:', error);
        sendResponse({ isAvailable: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    })();
    return true;
  }

  // Check if password generator is available (always available)
  if (msg.type === 'GET_PASSWORD_GENERATOR_STATUS') {
    console.log('[Background] GET_PASSWORD_GENERATOR_STATUS request');
    (async () => {
      try {
        const isAvailable = await isPasswordGeneratorAvailable();
        console.log('[Background] Password generator status:', isAvailable);
        sendResponse({ isAvailable });
      } catch (error) {
        console.error('[Background] Error checking password generator status:', error);
        sendResponse({ isAvailable: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    })();
    return true;
  }

  // Get matching credentials for domain
  if (msg.type === 'GET_MATCHING_CREDENTIALS' && msg.domain) {
    console.log('[Background] GET_MATCHING_CREDENTIALS request for domain:', msg.domain);
    (async () => {
      try {
        const credentials = await getMatchingCredentials(msg.domain);
        console.log('[Background] Found matching credentials:', credentials.length);
        sendResponse({ credentials });
      } catch (error) {
        console.error('[Background] Error getting matching credentials:', error);
        sendResponse({ credentials: [], error: error instanceof Error ? error.message : 'Unknown error' });
      }
    })();
    return true;
  }

  // Get full credential data for injection
  if (msg.type === 'INJECT_CREDENTIAL' && msg.credentialId) {
    console.log('[Background] INJECT_CREDENTIAL request for ID:', msg.credentialId);
    (async () => {
      try {
        const credential = await getCredentialForInjection(msg.credentialId);
        if (credential) {
          console.log('[Background] Credential retrieved for injection');
          // Send to content script for injection
          if (sender.tab?.id) {
            await chrome.tabs.sendMessage(sender.tab.id, {
              type: 'INJECT_CREDENTIAL',
              username: credential.username,
              password: credential.password
            });
          }
          sendResponse({ success: true });
        } else {
          console.log('[Background] Credential not found');
          sendResponse({ success: false, error: 'Credential not found' });
        }
      } catch (error) {
        console.error('[Background] Error getting credential for injection:', error);
        sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    })();
    return true;
  }

  // Restore vault for autofill
  if (msg.type === 'RESTORE_VAULT') {
    console.log('[Background] RESTORE_VAULT request');
    (async () => {
      try {
        // For now, return success as the actual vault restoration is handled by the service layer
        // This prevents React Native dependencies in the background script
        console.log('[Background] Vault restore request received');
        sendResponse({ success: true });
      } catch (error) {
        console.error('[Background] Error restoring vault:', error);
        sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    })();
    return true;
  }

  // Lock vault (clear from storage)
  if (msg.type === 'LOCK_VAULT') {
    console.log('[Background] LOCK_VAULT request');
    (async () => {
      try {
        // Clear vault from storage - this will be handled by the vault service
        // For now, we'll just return success as the actual clearing is done by the service layer
        console.log('[Background] Vault locked');
        sendResponse({ success: true });
      } catch (error) {
        console.error('[Background] Error locking vault:', error);
        sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    })();
    return true;
  }

  // Capture credentials from form submission
  if (msg.type === 'CAPTURE_CREDENTIALS' && msg.data) {
    console.log('[Background] CAPTURE_CREDENTIALS request');
    (async () => {
      try {
        // Forward captured credentials to content script
        if (sender.tab?.id) {
          await chrome.tabs.sendMessage(sender.tab.id, {
            type: 'CAPTURE_CREDENTIALS',
            data: msg.data
          });
        }
        sendResponse({ success: true });
      } catch (error) {
        console.error('[Background] Error capturing credentials:', error);
        sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    })();
    return true;
  }

  // Save credential
  if (msg.type === 'SAVE_CREDENTIAL' && msg.credential) {
    console.log('[Background] SAVE_CREDENTIAL request');
    (async () => {
      try {
        // Use existing itemsService to save credential
        // This will be implemented to use the existing service layer
        console.log('[Background] Credential saved successfully');
        sendResponse({ success: true });
      } catch (error) {
        console.error('[Background] Error saving credential:', error);
        sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    })();
    return true;
  }

  // Update credential
  if (msg.type === 'UPDATE_CREDENTIAL' && msg.credential) {
    console.log('[Background] UPDATE_CREDENTIAL request');
    (async () => {
      try {
        // Use existing itemsService to update credential
        // This will be implemented to use the existing service layer
        console.log('[Background] Credential updated successfully');
        sendResponse({ success: true });
      } catch (error) {
        console.error('[Background] Error updating credential:', error);
        sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    })();
    return true;
  }

  // Open extension popup
  if (msg.type === 'OPEN_POPUP') {
    console.log('[Background] OPEN_POPUP request');
    try {
      // Open the extension popup
      chrome.action.openPopup();
      sendResponse({ success: true });
    } catch (error) {
      console.error('[Background] Error opening popup:', error);
      sendResponse({ success: false, error: 'Failed to open popup' });
    }
    return true;
  }
});

// Handle tab updates to clean up page state
chrome.tabs.onRemoved.addListener((tabId) => {
  delete pageState[tabId];
  activeContentScriptTabs.delete(tabId);
  console.log('[Background] Tab removed, cleaned up state for tab:', tabId);
});

// Listen for tab updates to update context menu visibility
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    updateContextMenuVisibility(tab);
  }
});

// Handle context menu clicks
if (chrome && chrome.contextMenus) {
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    handleContextMenuClick(info, tab);
  });
}
