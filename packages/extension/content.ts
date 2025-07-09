// content-script.ts
// This content script is injected into every page. It detects login fields, injects the credential popover iframe, and handles communication between the popover and the page.
// Responsibilities:
// - Detect login fields (email, username, password) and show the popover when focused
// - Inject the popover iframe and position it
// - Communicate with the iframe via postMessage for credential selection and resizing
// - Inject credentials into the login form when a credential is picked

import { getRootDomain, getRegisteredDomain, matchesCredentialDomainOrTitle } from '@utils/domain';

function sanitizeInput(input: unknown): string {
  // Simple sanitizer: strips script tags and trims whitespace
  return String(input)
    .replace(/<script.*?>.*?<\/script>/gi, '')
    .trim();
}

// Simple credential injection function
function injectCredential(username: string, password: string): void {
  const usernameFields = document.querySelectorAll('input[type="email"], input[autocomplete*="user" i], input[autocomplete*="email" i], input[name*="user" i], input[name*="email" i]');
  const passwordFields = document.querySelectorAll('input[type="password"]');
  
  // Fill username field
  if (usernameFields.length > 0) {
    const usernameField = usernameFields[0] as HTMLInputElement;
    usernameField.value = username;
    usernameField.dispatchEvent(new Event('input', { bubbles: true }));
    usernameField.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  // Fill password field
  if (passwordFields.length > 0) {
    const passwordField = passwordFields[0] as HTMLInputElement;
    passwordField.value = password;
    passwordField.dispatchEvent(new Event('input', { bubbles: true }));
    passwordField.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

const url: string = sanitizeInput(window.location.href);
const domain: string = getRootDomain(window.location.hostname);
const hasLoginForm: boolean = !!document.querySelector('form input[type="password"]');
console.log('[Content Script] url:', url, 'domain:', domain, 'hasLoginForm:', hasLoginForm);
chrome.runtime.sendMessage({ type: 'PAGE_INFO', url, domain, hasLoginForm });

let pickerIframe: HTMLIFrameElement | null = null;

function showPopoverCredentialPicker(field: HTMLElement, credentials: Array<{ username?: string; password?: string; title?: string; url?: string }>): void {
  removeInPagePicker();
  if (!credentials.length) return;
  pickerIframe = document.createElement('iframe');
  pickerIframe.id = 'simpli-popover-iframe';
  pickerIframe.style.border = '1px solid #E0E3E7';
  pickerIframe.style.borderRadius = '12px';
  pickerIframe.style.boxShadow = '0 4px 24px rgba(0,0,0,0.12)';
  pickerIframe.style.background = 'transparent';
  pickerIframe.src = chrome.runtime.getURL('src/content/popovers/PopoverCredentialPicker.html');
  pickerIframe.style.position = 'absolute';
  pickerIframe.style.zIndex = '2147483647';
  pickerIframe.style.width = `${Math.max(field.getBoundingClientRect().width, 320)}px`;
  pickerIframe.style.height = 'auto';
  const anchorRect = field.getBoundingClientRect();
  pickerIframe.style.top = `${anchorRect.bottom + window.scrollY + 8}px`;
  pickerIframe.style.left = `${anchorRect.left + window.scrollX}px`;
  document.body.appendChild(pickerIframe);
  // Send credentials to iframe after it loads
  pickerIframe.onload = () => {
    pickerIframe?.contentWindow?.postMessage({ type: 'SHOW_CREDENTIALS', credentials }, '*');
  };
  setTimeout(() => {
    document.addEventListener('mousedown', handleClickAway, true);
  }, 0);
}

function removeInPagePicker(): void {
  if (pickerIframe) {
    pickerIframe.remove();
    document.removeEventListener('mousedown', handleClickAway, true);
    pickerIframe = null;
  }
}

function handleClickAway(e: MouseEvent): void {
  if (!pickerIframe) return;
  const fields = Array.from(document.querySelectorAll('input[type="password"]'));
  const isField = fields.some(
    (f) => f === e.target || (f as HTMLElement).contains(e.target as Node),
  );
  if (!pickerIframe.contains(e.target as Node) && !isField) {
    removeInPagePicker();
    document.removeEventListener('mousedown', handleClickAway, true);
  }
}

function handleFieldFocusOrClick(e: Event): void {
  const field = e.target as HTMLElement;
  try {
    chrome.runtime.sendMessage(
      { type: 'GET_CACHED_CREDENTIALS', domain },
      (credentials: unknown[] = []) => {
        if (chrome.runtime.lastError) {
          removeInPagePicker();
          return;
        }
        const pageDomain = getRegisteredDomain(domain);
        const filtered = (credentials as { url?: string; title?: string }[]).filter((cred) =>
          matchesCredentialDomainOrTitle(cred, pageDomain),
        );
        if (filtered.length) {
          showPopoverCredentialPicker(field, filtered);
        } else {
          removeInPagePicker();
        }
      },
    );
  } catch {
    removeInPagePicker();
  }
}

function getLoginRelatedFields() {
  // All likely login fields
  return Array.from(
    document.querySelectorAll(
      'input[type="password"],' +
        'input[type="email"],' +
        'input[autocomplete*="user" i],' +
        'input[autocomplete*="email" i],' +
        'input[name*="user" i],' +
        'input[name*="email" i],' +
        'input[type="text"]',
    ),
  );
}

function setupLoginFieldListeners(): void {
  const fields = getLoginRelatedFields();
  fields.forEach((field) => {
    field.addEventListener('click', handleFieldFocusOrClick);
  });
}

if (hasLoginForm) {
  setupLoginFieldListeners();
}

// Listen for messages from the iframe for actions (e.g., credential pick, close)
window.addEventListener('message', (event) => {
  if (!pickerIframe) return;
  if (event.source === pickerIframe.contentWindow) {
    const { type, credential, height, width } = event.data || {};
    if (type === 'POPOVER_RESIZE') {
      if (typeof height === 'number') pickerIframe.style.height = `${height}px`;
      if (typeof width === 'number') pickerIframe.style.width = `${width}px`;
    } else if (type === 'PICK_CREDENTIAL' && credential) {
      // Inject the credential into the login form
      injectCredential(credential.username, credential.password);
      removeInPagePicker();
    } else if (type === 'CLOSE_POPOVER') {
      removeInPagePicker();
    }
  }
});

chrome.runtime.onMessage.addListener((msg: { type: string; username?: string; password?: string }) => {
  if (msg && msg.type === 'INJECT_CREDENTIAL' && msg.username && msg.password) {
    // Always use the centralized injection utility
    injectCredential(sanitizeInput(msg.username), sanitizeInput(msg.password));
    removeInPagePicker();
  }
});
