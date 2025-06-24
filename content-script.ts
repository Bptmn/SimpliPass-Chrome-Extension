import { getRootDomain, getRegisteredDomain, matchesCredentialDomainOrTitle } from './utils/domain';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { PopoverCredentialPicker } from './popup/popovers/PopoverCredentialPicker';
import { decryptData } from './utils/crypto';
import { useCredentialInjection } from './utils/valuesInjection';

function sanitizeInput(input: unknown): string {
  // Simple sanitizer: strips script tags and trims whitespace
  return String(input).replace(/<script.*?>.*?<\/script>/gi, '').trim();
}

const url: string = sanitizeInput(window.location.href);
const domain: string = getRootDomain(window.location.hostname);
const hasLoginForm: boolean = !!document.querySelector('form input[type="password"]');
console.log('[Content Script] url:', url, 'domain:', domain, 'hasLoginForm:', hasLoginForm);
chrome.runtime.sendMessage({ type: 'PAGE_INFO', url, domain, hasLoginForm });

let pickerRootDiv: HTMLDivElement | null = null;
let pickerRoot: any = null;

function showPopoverCredentialPicker(field: HTMLElement, credentials: any[]): void {
  removeInPagePicker();
  if (!credentials.length) return;
  pickerRootDiv = document.createElement('div');
  pickerRootDiv.id = 'simpli-popover-root';

  // Attach Shadow DOM for style encapsulation
  const shadow = pickerRootDiv.attachShadow({ mode: 'open' });

  // Create a container for React to render into
  const reactContainer = document.createElement('div');
  shadow.appendChild(reactContainer);

  // Inject only the popover-specific stylesheet as a <link> in the shadow root
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = chrome.runtime.getURL('popovers/PopoverCredentialPicker.css');
  shadow.appendChild(link);

  document.body.appendChild(pickerRootDiv);
  const anchorRect = field.getBoundingClientRect();
  const width = Math.max(anchorRect.width, 320);
  pickerRootDiv.style.position = 'absolute';
  pickerRootDiv.style.zIndex = '2147483647';
  pickerRootDiv.style.top = `${anchorRect.bottom + window.scrollY + 8}px`;
  pickerRootDiv.style.left = `${anchorRect.left + window.scrollX}px`;
  pickerRootDiv.style.width = `${width}px`;

  // Render React into the shadow root container
  pickerRoot = createRoot(reactContainer);
  pickerRoot.render(
    React.createElement(PopoverCredentialPicker, {
      credentials: credentials,
      onPick: handleCredentialPick,
      onClose: removeInPagePicker
    })
  );
  setTimeout(() => {
    document.addEventListener('mousedown', handleClickAway, true);
  }, 0);
}

async function handleCredentialPick(cred: any) {
  try {
    chrome.runtime.sendMessage({ type: 'GET_USER_SECRET_KEY' }, async (resp: { key: string | null }) => {
      const userSecretKey = resp && resp.key;
      if (!userSecretKey) throw new Error('User secret key not found');
      const itemKey = await decryptData(userSecretKey, cred.itemKeyCipher);
      const password = await decryptData(itemKey, cred.passwordCipher);
      // Use the centralized injection hook
      const { injectCredential } = useCredentialInjection();
      injectCredential(cred.username, password);
      removeInPagePicker();
    });
  } catch (e) {
    removeInPagePicker();
  }
}

function handleClickAway(e: MouseEvent): void {
  if (!pickerRootDiv) return;
  const fields = Array.from(document.querySelectorAll('input[type="password"]'));
  const isField = fields.some(f => f === e.target || (f as HTMLElement).contains(e.target as Node));
  if (!pickerRootDiv.contains(e.target as Node) && !isField) {
    removeInPagePicker();
    document.removeEventListener('mousedown', handleClickAway, true);
  }
}

function removeInPagePicker(): void {
  if (pickerRootDiv) {
    pickerRootDiv.remove();
    document.removeEventListener('mousedown', handleClickAway, true);
    pickerRootDiv = null;
    pickerRoot = null;
  }
}

function handleFieldFocusOrClick(e: Event): void {
  // No more getLoginFields; just show picker and inject using the utility
  const field = e.target as HTMLElement;
  try {
    chrome.runtime.sendMessage({ type: 'GET_CACHED_CREDENTIALS', domain }, (credentials: any[] = []) => {
      if (chrome.runtime.lastError) {
        removeInPagePicker();
        return;
      }
      // Use the same matching logic as popup
      const pageDomain = getRegisteredDomain(domain);
      const filtered = credentials.filter(cred => matchesCredentialDomainOrTitle(cred, pageDomain));
      if (filtered.length) {
        showPopoverCredentialPicker(field, filtered);
      } else {
        removeInPagePicker();
      }
    });
  } catch (err) {
    removeInPagePicker();
  }
}

function setupLoginFieldListeners(): void {
  // Use robust detection: add focus listeners to all password fields
  const fields = Array.from(document.querySelectorAll('input[type="password"]'));
  fields.forEach(field => {
    field.addEventListener('focus', handleFieldFocusOrClick);
  });
}

function cleanupLoginFieldListeners(): void {
  const fields = Array.from(document.querySelectorAll('input[type="password"]'));
  fields.forEach(field => {
    field.removeEventListener('focus', handleFieldFocusOrClick);
  });
}

if (hasLoginForm) {
  setupLoginFieldListeners();
}

chrome.runtime.onMessage.addListener((msg: any) => {
  if (msg && msg.type === 'INJECT_CREDENTIAL' && msg.username && msg.password) {
    // Always use the centralized injection utility
    const { injectCredential } = useCredentialInjection();
    injectCredential(sanitizeInput(msg.username), sanitizeInput(msg.password));
    removeInPagePicker();
  }
}); 