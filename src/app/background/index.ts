import {
  getCredentialsByDomainFromVaultDb,
  getCredentialFromVaultDb,
} from 'features/credentials/services/items';
import { PageState, CredentialVaultDb } from 'shared/types/types';
import { decryptData } from 'shared/utils/crypto';
import { getUserSecretKey } from 'features/auth/services/user';

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
    getCredentialFromVaultDb(msg.credentialId).then(async (cred: CredentialVaultDb | null) => {
      if (cred) {
        // Decrypt password
        const userSecretKey = await getUserSecretKey();
        if (!userSecretKey) {
          sendResponse({ success: false, error: 'User secret key not found' });
          return;
        }
        const itemKey = await decryptData(userSecretKey, cred.itemKeyCipher);
        const password = await decryptData(itemKey, cred.passwordCipher);
        const tabId = sender.tab && typeof sender.tab.id === 'number' ? sender.tab.id : undefined;
        if (tabId !== undefined) {
          chrome.tabs.sendMessage(tabId, {
            type: 'INJECT_CREDENTIAL',
            username: cred.username,
            password,
          });
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false, error: 'Tab ID not found' });
        }
      } else {
        sendResponse({ success: false });
      }
    });
    return true;
  }

  // Handle in-page picker credential request
  if (msg.type === 'GET_CACHED_CREDENTIALS' && msg.domain) {
    getCredentialsByDomainFromVaultDb(msg.domain).then((creds) => {
      sendResponse(creds);
    });
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
