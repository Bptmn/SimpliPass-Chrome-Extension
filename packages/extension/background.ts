import { getUserSecretKey } from '@app/core/logic/user';
import { PageState } from '@app/core/types/types';


/**
 * Stores page info per tab.
 */
const pageState: { [tabId: number]: PageState } = {};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Do not initialize Firebase on every message

  // Store page info
  if (msg.type === 'PAGE_INFO' && sender.tab?.id != null) {
    pageState[sender.tab.id] = { url: msg.url, domain: msg.domain, hasLoginForm: msg.hasLoginForm };
  }

  // Popup requests current page state
  if (msg.type === 'GET_PAGE_STATE' && msg.tabId != null) {
    sendResponse(pageState[msg.tabId] || null);
    return true;
  }

  // Popup requests credential injection
  if (
    msg.type === 'INJECT_CREDENTIAL' &&
    msg.credentialId &&
    sender.tab &&
    typeof sender.tab.id === 'number'
  ) {
    (async () => {
      try {
        const userSecretKey = await getUserSecretKey();
        if (!userSecretKey) {
          sendResponse({ success: false, error: 'User secret key not found' });
          return;
        }

        // TODO: Get current user from extension state or messaging, as auth.getCurrentUser is not available.
        // For now, return an error or empty result if currentUser is not available.
        sendResponse({ success: false, error: 'User not authenticated (currentUser unavailable)' });
        return;
      } catch (error) {
        sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    })();
    return true;
  }

  // Handle in-page picker credential request
  if (msg.type === 'GET_CACHED_CREDENTIALS' && msg.domain) {
    (async () => {
      try {
        const userSecretKey = await getUserSecretKey();
        if (!userSecretKey) {
          sendResponse([]);
          return;
        }

        // TODO: Get current user from extension state or messaging, as auth.getCurrentUser is not available.
        // For now, return an error or empty result if currentUser is not available.
        sendResponse({ success: false, error: 'User not authenticated (currentUser unavailable)' });
        return;
      } catch (error) {
        console.error('Error getting cached credentials:', error);
        sendResponse([]);
      }
    })();
    return true; // async
  }

  // Handle user secret key request from content script
  if (msg.type === 'GET_USER_SECRET_KEY') {
    getUserSecretKey()
      .then((key) => {
        sendResponse({ key });
      })
      .catch(() => {
        sendResponse({ key: null });
      });
    return true;
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  const tabId = activeInfo.tabId;
  if (!pageState[tabId]) {
    // Ask the content script to send page info
    chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const domain = window.location.hostname;
        const hasLogin = !!document.querySelector('form input[type="password"]');
        chrome.runtime.sendMessage({ type: 'PAGE_INFO', domain, hasLogin });
      },
    });
  }
});
