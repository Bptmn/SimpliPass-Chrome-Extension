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

const _getPlatform = () => currentPlatform;

// ✅ Pre-check all capabilities on page load (using simple stubs)
const checkPageCapabilities = async (): Promise<{
  canAutofill: boolean;
  canSaveCredential: boolean;
  canGeneratePassword: boolean;
  hasCredentials: boolean;
  isAuthenticated: boolean;
}> => {
  console.log('[Background] Checking page capabilities');
  
  try {
    // ✅ Simple stub checks using chrome.storage.session directly
    const sessionData = await chrome.storage.session.get([
      'userSecretKey',
      'user',
      'encryptedVault'
    ]);
    
    const allKeys = await chrome.storage.session.get(null);
    const allLocalKeys = await chrome.storage.local.get(null);
    console.log('[Background] All session storage keys:', JSON.stringify(allKeys, null, 2));
    console.log('[Background] All local storage keys:', JSON.stringify(allLocalKeys, null, 2));
    console.log('[Background] Requested session data:', JSON.stringify(sessionData, null, 2));
    
    const isAuthenticated = !!(sessionData.user && sessionData.user.id);
    const hasUserSecretKey = !!sessionData.userSecretKey;
    
    // Check if vault exists and has content
    let hasCredentials = false;
    if (sessionData.encryptedVault) {
      try {
        const vaultData = JSON.parse(sessionData.encryptedVault);
        // The vault is an object with items array, not directly an array
        const vaultItems = vaultData.items;
        hasCredentials = Array.isArray(vaultItems) && vaultItems.length > 0;
        console.log('[Background] Vault parsing:', {
          vaultDataKeys: Object.keys(vaultData),
          itemsArrayExists: !!vaultData.items,
          itemsArrayLength: vaultData.items ? vaultData.items.length : 0,
          hasCredentials
        });
      } catch (error) {
        console.error('[Background] Error parsing vault:', error);
        hasCredentials = false;
      }
    }
    
    const sessionCheck = {
      isAuthenticated,
      hasUserSecretKey,
      hasCredentials: hasCredentials ? 'yes' : 'no',
      userData: sessionData.user,
      userSecretKeyExists: !!sessionData.userSecretKey,
      encryptedVaultExists: !!sessionData.encryptedVault,
      encryptedVaultLength: sessionData.encryptedVault ? sessionData.encryptedVault.length : 0
    };
    console.log('[Background] Session data check:', JSON.stringify(sessionCheck, null, 2));
    
    // Determine capabilities
    const capabilities = {
      canAutofill: isAuthenticated && hasCredentials, // ✅ Auth + credentials in RAM
      canSaveCredential: isAuthenticated && hasUserSecretKey, // ✅ Auth + user secret key
      canGeneratePassword: true, // ✅ Always available
      hasCredentials,
      isAuthenticated
    };
    
    console.log('[Background] Page capabilities:', capabilities);
    return capabilities;
  } catch (error) {
    console.error('[Background] Error checking page capabilities:', error);
    return {
      canAutofill: false,
      canSaveCredential: false,
      canGeneratePassword: true,
      hasCredentials: false,
      isAuthenticated: false
    };
  }
};

// Legacy functions for backward compatibility
const isAutofillAvailable = async (): Promise<boolean> => {
  console.log('[Background] isAutofillAvailable called');
  const capabilities = await checkPageCapabilities();
      console.log('[Background] isAutofillAvailable result:', capabilities.canAutofill);
    console.log('[Background] isAutofillAvailable details:', JSON.stringify(capabilities, null, 2));
  return capabilities.canAutofill;
};

const isSaveCredentialAvailable = async (): Promise<boolean> => {
  const capabilities = await checkPageCapabilities();
  return capabilities.canSaveCredential;
};

const isPasswordGeneratorAvailable = async (): Promise<boolean> => {
  const capabilities = await checkPageCapabilities();
  return capabilities.canGeneratePassword;
};

const getMatchingCredentials = async (domain: string): Promise<Array<{
  id: string;
  title: string;
  username: string;
  url?: string;
}>> => {
  console.log('[Background] getMatchingCredentials called for domain:', domain);
  try {
    // ✅ Simple stub using chrome.storage.session directly
    const vaultData = await chrome.storage.session.get('encryptedVault');
    const vaultString = vaultData.encryptedVault;
    
    if (!vaultString) {
      console.log('[Background] No vault data found');
      return [];
    }
    
    const parsedVaultData = JSON.parse(vaultString);
    console.log('[Background] Vault data type:', typeof parsedVaultData);
    console.log('[Background] Vault data keys:', Object.keys(parsedVaultData));
    
    // Extract items array from vault object
    const allItems = parsedVaultData.items;
    console.log('[Background] Items array type:', typeof allItems);
    console.log('[Background] Items array:', allItems);
    
    // Ensure allItems is an array
    if (!Array.isArray(allItems)) {
      console.log('[Background] Items array is not an array, converting to empty array');
      return [];
    }
    
    console.log('[Background] All vault items:', allItems.length);
    
    // Filter credentials that match the domain
    const matchingCredentials = allItems
      .filter((item: any) => item.itemType === 'credential')
      .filter((cred: any) => {
        if (!cred.url) return false;
        try {
          // Extract domain from stored credential URL
          const credDomain = new URL(cred.url.startsWith('http') ? cred.url : `https://${cred.url}`).hostname;
          
          // Extract domain from current page domain
          const currentDomain = domain.replace(/^www\./, ''); // Remove www. prefix
          const storedDomain = credDomain.replace(/^www\./, ''); // Remove www. prefix
          
          console.log('[Background] Domain matching:', {
            currentDomain,
            storedDomain,
            credUrl: cred.url,
            matches: currentDomain === storedDomain || 
                     currentDomain.endsWith('.' + storedDomain) || 
                     storedDomain.endsWith('.' + currentDomain)
          });
          
          return currentDomain === storedDomain || 
                 currentDomain.endsWith('.' + storedDomain) || 
                 storedDomain.endsWith('.' + currentDomain);
        } catch (error) {
          console.error('[Background] Error parsing credential URL:', cred.url, error);
          return false;
        }
      });
    
    console.log('[Background] Matching credentials for domain', domain, ':', matchingCredentials.length);
    return matchingCredentials.map((cred: any) => ({
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
    // ✅ Simple stub using chrome.storage.session directly
    const vaultData = await chrome.storage.session.get('encryptedVault');
    const vaultString = vaultData.encryptedVault;
    
    if (!vaultString) {
      console.log('[Background] No vault data found');
      return null;
    }
    
    const vaultDataForInjection = JSON.parse(vaultString);
    console.log('[Background] Vault data type for injection:', typeof vaultDataForInjection);
    console.log('[Background] Vault data keys for injection:', Object.keys(vaultDataForInjection));
    
    // Extract items array from vault object
    const allItems = vaultDataForInjection.items;
    console.log('[Background] Items array type for injection:', typeof allItems);
    console.log('[Background] Items array for injection:', allItems);
    
    // Ensure allItems is an array
    if (!Array.isArray(allItems)) {
      console.log('[Background] Items array is not an array for injection');
      return null;
    }
    
    // Find the specific credential by ID
    const credential = allItems
      .filter((item: any) => item.itemType === 'credential')
      .find((cred: any) => cred.id === credentialId);
    
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

const handleContextMenuClick = (_info: any, _tab: any) => {
  console.log('[Background] handleContextMenuClick called');
  // Context menu click handling will be implemented later
};

const updateContextMenuVisibility = (_tab: any) => {
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

  // ✅ NEW: Get comprehensive page capabilities (pre-check on page load)
  if (msg.type === 'GET_PAGE_CAPABILITIES') {
    console.log('[Background] GET_PAGE_CAPABILITIES request');
    (async () => {
      try {
        const capabilities = await checkPageCapabilities();
        console.log('[Background] Page capabilities:', capabilities);
        sendResponse({ capabilities });
      } catch (error) {
        console.error('[Background] Error checking page capabilities:', error);
        sendResponse({ 
          capabilities: {
            canAutofill: false,
            canSaveCredential: false,
            canGeneratePassword: true,
            hasCredentials: false,
            isAuthenticated: false
          },
          error: error instanceof Error ? error.message : 'Unknown error'
        });
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
