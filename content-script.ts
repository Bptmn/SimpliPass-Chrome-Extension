import { getRootDomain } from './utils/domain';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { InPageCredentialPicker } from './popup/components/common/InPageCredentialPicker';
import { CredentialCard } from './popup/components/common/credentialCard';

function sanitizeInput(input: unknown): string {
  // Simple sanitizer: strips script tags and trims whitespace
  return String(input).replace(/<script.*?>.*?<\/script>/gi, '').trim();
}

const url: string = sanitizeInput(window.location.href);
const domain: string = getRootDomain(window.location.hostname);
const hasLoginForm: boolean = !!document.querySelector('form input[type="password"]');
console.log('[Content Script] url:', url, 'domain:', domain, 'hasLoginForm:', hasLoginForm);
chrome.runtime.sendMessage({ type: 'PAGE_INFO', url, domain, hasLoginForm });

// --- In-page credential picker injection ---

let lastAnchor: HTMLElement | null = null;
let lastCredentials: any[] = [];

function getLoginFields(): HTMLElement[] {
  const form = document.querySelector('form input[type="password"]')?.closest('form');
  if (!form) return [];
  const fields: HTMLElement[] = Array.from(form.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]'));
  return fields;
}

function showPickerBelowField(field: HTMLElement, credentials: any[]): void {
  removeInPagePicker();
  if (!credentials.length) return;
  lastAnchor = field;
  lastCredentials = credentials;

  // Create a window below the field
  const rootDiv = document.createElement('div');
  rootDiv.id = 'simpli-inpage-root';
  rootDiv.style.position = 'absolute';
  rootDiv.style.zIndex = '2147483647';
  rootDiv.style.background = '#fff';
  rootDiv.style.borderRadius = '10px';
  rootDiv.style.boxShadow = '0 4px 24px rgba(0,0,0,0.12)';
  rootDiv.style.padding = '0';
  rootDiv.style.margin = '0';
  rootDiv.style.display = 'block';
  rootDiv.style.border = '1px solid #e0e0e0';
  rootDiv.style.overflow = 'visible';
  document.body.appendChild(rootDiv);
  const anchorRect = field.getBoundingClientRect();
  const width = Math.max(anchorRect.width, 320);
  rootDiv.style.width = `${width}px`;
  rootDiv.style.top = `${anchorRect.bottom + window.scrollY + 8}px`;
  rootDiv.style.left = `${anchorRect.left + window.scrollX}px`;

  // Render up to 2 credential cards using React
  const root = createRoot(rootDiv);
  root.render(
    React.createElement(
      'div',
      { style: { padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px' } },
      ...credentials.slice(0, 2).map((cred: any) =>
        React.createElement(CredentialCard, { key: cred.id, cred })
      )
    )
  );

  // Add click-away listener
  setTimeout(() => {
    document.addEventListener('mousedown', handleClickAway, true);
  }, 0);
}

function handleClickAway(e: MouseEvent): void {
  const popup = document.getElementById('simpli-inpage-root');
  if (!popup) return;
  const fields = getLoginFields();
  const isField = fields.some(f => f === e.target || (f as HTMLElement).contains(e.target as Node));
  if (!popup.contains(e.target as Node) && !isField) {
    removeInPagePicker();
    document.removeEventListener('mousedown', handleClickAway, true);
  }
}

function removeInPagePicker(): void {
  const rootDiv = document.getElementById('simpli-inpage-root');
  if (rootDiv) {
    rootDiv.remove();
    document.removeEventListener('mousedown', handleClickAway, true);
  }
  lastAnchor = null;
  lastCredentials = [];
}

function handleFieldFocusOrClick(e: Event): void {
  const field = e.target as HTMLElement;
  try {
    chrome.runtime.sendMessage({ type: 'GET_CACHED_CREDENTIALS', domain }, (credentials: any[] = []) => {
      if (chrome.runtime.lastError) {
        showErrorMessage(field, 'Extension is not ready. Please reload the page or re-authenticate.');
        removeInPagePicker();
        return;
      }
      if (credentials.length) {
        showPickerBelowField(field, credentials);
      } else {
        removeInPagePicker();
      }
    });
  } catch (err) {
    showErrorMessage(field, 'Extension is not ready. Please reload the page or re-authenticate.');
    removeInPagePicker();
  }
}

function showErrorMessage(field: HTMLElement, message: string): void {
  removeInPagePicker();
  const rootDiv = document.createElement('div');
  rootDiv.id = 'simpli-inpage-root';
  rootDiv.style.position = 'absolute';
  rootDiv.style.zIndex = '2147483647';
  document.body.appendChild(rootDiv);
  const anchorRect = field.getBoundingClientRect();
  rootDiv.style.top = `${anchorRect.bottom + window.scrollY + 8}px`;
  rootDiv.style.left = `${anchorRect.left + window.scrollX}px`;
  rootDiv.style.background = 'rgba(70,110,140,0.92)';
  rootDiv.style.color = '#fff';
  rootDiv.style.padding = '16px 24px';
  rootDiv.style.borderRadius = '12px';
  rootDiv.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18)';
  rootDiv.style.fontSize = '1rem';
  rootDiv.style.fontFamily = 'Inter, sans-serif';
  rootDiv.textContent = message;
}

function setupLoginFieldListeners(): void {
  const fields = getLoginFields();
  fields.forEach(field => {
    field.addEventListener('focus', handleFieldFocusOrClick);
  });
}

function cleanupLoginFieldListeners(): void {
  const fields = getLoginFields();
  fields.forEach(field => {
    field.removeEventListener('focus', handleFieldFocusOrClick);
  });
}

if (hasLoginForm) {
  setupLoginFieldListeners();
}

chrome.runtime.onMessage.addListener((msg: any) => {
  if (msg && msg.type === 'INJECT_CREDENTIAL' && msg.username && msg.password) {
    const form = document.querySelector('form');
    if (form) {
      const userInput = form.querySelector('input[type="text"], input[type="email"]') as HTMLInputElement | null;
      const passInput = form.querySelector('input[type="password"]') as HTMLInputElement | null;
      if (userInput) userInput.value = sanitizeInput(msg.username);
      if (passInput) passInput.value = sanitizeInput(msg.password);
      form.dispatchEvent(new Event('input', { bubbles: true }));
      form.dispatchEvent(new Event('change', { bubbles: true }));
    }
    removeInPagePicker();
  }
}); 