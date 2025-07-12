import { PageState } from '@app/core/types/types';
import { 
  isAutofillAvailable,
  getMatchingCredentials,
  getCredentialForInjection,
  restoreVaultForAutofill
} from './utils/autofillBridge';
import { loadVaultIfNeeded } from './utils/vaultLoader';

/**
 * Stores page info per tab.
 */
const pageState: { [tabId: number]: PageState } = {};

// Forward background logs to content scripts
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Store active tabs that have content scripts
const activeContentScriptTabs = new Set<number>();

/**
 * Ensure vault is loaded in memory
 */
async function ensureVaultLoaded(): Promise<boolean> {
  try {
    await loadVaultIfNeeded();
    return true;
  } catch (error) {
    console.error('[Background] Failed to load vault:', error);
    return false;
  }
}

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

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Register content script with background for log forwarding
  if (msg.type === 'CONTENT_SCRIPT_READY' && sender.tab?.id != null) {
    activeContentScriptTabs.add(sender.tab.id);
    console.log('[Background] Content script registered for tab:', sender.tab.id);
    
    // Always try to load vault when content script registers
    ensureVaultLoaded();
  }
  
  // Store page info
  if (msg.type === 'PAGE_INFO' && sender.tab?.id != null) {
    pageState[sender.tab.id] = { url: msg.url, domain: msg.domain, hasLoginForm: msg.hasLoginForm };
  }

  // Popup requests current page state
  if (msg.type === 'GET_PAGE_STATE' && msg.tabId != null) {
    sendResponse(pageState[msg.tabId] || null);
    return true;
  }

  // Handle session status request
  if (msg.type === 'GET_SESSION_STATUS') {
    (async () => {
      // Always try to ensure vault is loaded before responding
      await ensureVaultLoaded();
      
      // Check if autofill is available
      const isValid = isAutofillAvailable();
      sendResponse({ isValid });
    })();
    return true;
  }

  // Handle matching credentials request from content script
  if (msg.type === 'GET_MATCHING_CREDENTIALS' && msg.domain) {
    (async () => {
      // Always try to ensure vault is loaded before getting credentials
      await ensureVaultLoaded();
      
      const matchingCredentials = getMatchingCredentials(msg.domain);
      sendResponse({ credentials: matchingCredentials });
    })();
    return true;
  }

  // Handle credential injection request
  if (msg.type === 'INJECT_CREDENTIAL' && msg.credentialId && sender.tab?.id) {
    (async () => {
      try {
        const credential = getCredentialForInjection(msg.credentialId);
        
        if (!credential) {
          sendResponse({ success: false, error: 'Credential not found or vault not loaded' });
          return;
        }

        // Send credential data to content script for injection
        if (sender.tab && typeof sender.tab.id === 'number') {
          chrome.tabs.sendMessage(sender.tab.id, {
            type: 'INJECT_CREDENTIAL',
            username: credential.username,
            password: credential.password
          });
        }
        
        sendResponse({ success: true });
      } catch (error) {
        console.error('[Background] Error injecting credential:', error);
        sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    })();
    return true;
  }

  // Handle vault restoration request
  if (msg.type === 'RESTORE_VAULT') {
    (async () => {
      try {
        const restored = await restoreVaultForAutofill();
        sendResponse({ success: restored });
      } catch (error) {
        console.error('[Background] Error restoring vault:', error);
        sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    })();
    return true;
  }

  // Handle vault sync from popup
  if (msg.type === 'SYNC_VAULT' && msg.vaultData) {
    (async () => {
      try {
        // Import the memory module to store vault data
        const { setCredentialsInMemory, setBankCardsInMemory, setSecureNotesInMemory } = await import('./session/memory');
        
        setCredentialsInMemory(msg.vaultData.credentials || []);
        setBankCardsInMemory(msg.vaultData.bankCards || []);
        setSecureNotesInMemory(msg.vaultData.secureNotes || []);
        
        console.log('[Background] Vault synced from popup');
        sendResponse({ success: true });
      } catch (error) {
        console.error('[Background] Error syncing vault from popup:', error);
        sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    })();
    return true;
  }
});

// Handle tab updates to clean up page state
chrome.tabs.onRemoved.addListener((tabId) => {
  delete pageState[tabId];
  activeContentScriptTabs.delete(tabId);
  console.log('[Background] Tab removed, cleaned up state for tab:', tabId);
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('[Background] Extension started, loading vault...');
  ensureVaultLoaded();
});

// Handle extension installation/update
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Background] Extension installed/updated, loading vault...');
  ensureVaultLoaded();
});

// Handle tab activation to ensure vault is loaded
chrome.tabs.onActivated.addListener(() => {
  console.log('[Background] Tab activated, ensuring vault is loaded...');
  ensureVaultLoaded();
});

// Handle tab updates to ensure vault is loaded
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    console.log('[Background] Tab updated, ensuring vault is loaded for tab:', tabId);
    ensureVaultLoaded();
  }
});
