/**
 * Credential Injection Service - Extension Specific
 * 
 * Handles credential injection into web pages for the Chrome extension.
 * This is extension-specific functionality.
 */

/**
 * Inject a credential into the current tab
 */
export function injectCredentialIntoCurrentTab(credentialId: string): void {
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.runtime.sendMessage({
          type: 'INJECT_CREDENTIAL',
          credentialId,
          tabId: tabs[0].id,
        });
      }
    });
  }
} 