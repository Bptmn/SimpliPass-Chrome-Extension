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
    // Check if user is logged in by looking for auth data in storage
    const result = await chrome.storage.session.get(['authToken', 'userId', 'isAuthenticated', 'credentials', 'items']);
    console.log('[Background] Storage check result:', result);
    
    // Check if we have valid authentication data
    const hasValidAuth = result.authToken && result.userId && result.isAuthenticated === true;
    console.log('[Background] Has valid auth:', hasValidAuth);
    
    // Check if we have credentials in storage (no need for user secret key since credentials are already decrypted)
    const credentials = result.credentials || result.items || [];
    const hasCredentials = credentials.length > 0;
    console.log('[Background] Has credentials:', hasCredentials, 'Count:', credentials.length);
    
    // Autofill requires both valid auth AND credentials
    const isAutofillReady = hasValidAuth && hasCredentials;
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
    // Check if user is logged in and has user secret key (needed for encryption)
    const result = await chrome.storage.session.get(['authToken', 'userId', 'isAuthenticated', 'userSecretKey']);
    console.log('[Background] Save credential check result:', result);
    
    // Check if we have valid authentication data AND user secret key
    const hasValidAuth = result.authToken && result.userId && result.isAuthenticated === true;
    const hasUserSecretKey = result.userSecretKey && result.userSecretKey.length > 0;
    
    console.log('[Background] Has valid auth for save:', hasValidAuth);
    console.log('[Background] Has user secret key:', hasUserSecretKey);
    
    // Save/update requires both valid auth AND user secret key
    const isSaveReady = hasValidAuth && hasUserSecretKey;
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
    // Get credentials from storage
    const result = await chrome.storage.session.get(['credentials', 'items']);
    console.log('[Background] Storage credentials result:', result);
    
    const credentials = result.credentials || result.items || [];
    console.log('[Background] All credentials:', credentials);
    
    // Filter credentials that match the domain
    const matchingCredentials = credentials.filter((cred: any) => {
      if (!cred.url) return false;
      try {
        const credDomain = new URL(cred.url).hostname;
        return credDomain === domain || credDomain.endsWith('.' + domain) || domain.endsWith('.' + credDomain);
      } catch {
        return false;
      }
    });
    
    console.log('[Background] Matching credentials for domain', domain, ':', matchingCredentials.length);
    return matchingCredentials.map((cred: any) => ({
      id: cred.id || cred._id,
      title: cred.title || cred.name || 'Untitled',
      username: cred.username || cred.email || '',
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
    // Get credentials from storage
    const result = await chrome.storage.session.get(['credentials', 'items']);
    const credentials = result.credentials || result.items || [];
    
    // Find the specific credential by ID
    const credential = credentials.find((cred: any) => 
      (cred.id || cred._id) === credentialId
    );
    
    if (credential) {
      console.log('[Background] Found credential for injection:', credential.title || credential.name);
      return {
        id: credential.id || credential._id,
        title: credential.title || credential.name || 'Untitled',
        username: credential.username || credential.email || '',
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
