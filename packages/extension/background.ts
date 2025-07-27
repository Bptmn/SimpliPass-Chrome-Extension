import { PageState } from '@common/core/types/types';

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
});

// Handle tab updates to clean up page state
chrome.tabs.onRemoved.addListener((tabId) => {
  delete pageState[tabId];
  activeContentScriptTabs.delete(tabId);
  console.log('[Background] Tab removed, cleaned up state for tab:', tabId);
});
