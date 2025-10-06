/**
 * Extension Helpers for Playwright E2E Tests
 * 
 * Utility functions for testing Chrome extension functionality
 */

import { BrowserContext, Page } from '@playwright/test';
import path from 'path';

/**
 * Load the Chrome extension and return the extension ID
 */
export async function loadExtension(context: BrowserContext): Promise<string> {
  const extensionPath = path.join(__dirname, '../../../dist');
  
  // The extension should already be loaded in the context
  // Extract extension ID from service worker targets
  let extensionId = '';
  
  for (const target of context.targets()) {
    if (target.type() === 'service_worker') {
      const url = target.url();
      const match = url.match(/(chrome-extension:\/\/[a-z0-9]{32})\//);
      if (match && match[1]) {
        extensionId = match[1].split('://')[1];
        break;
      }
    }
  }
  
  if (!extensionId) {
    throw new Error('Could not find extension ID');
  }
  
  return extensionId;
}

/**
 * Open the extension popup
 */
export async function openPopup(context: BrowserContext, extensionId: string): Promise<Page> {
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await popup.waitForLoadState('networkidle');
  return popup;
}

/**
 * Login to the extension with credentials
 */
export async function loginToExtension(
  popup: Page, 
  email: string, 
  password: string
): Promise<void> {
  // Wait for login form to be visible
  await popup.waitForSelector('[data-testid="email-input"]', { timeout: 10000 });
  await popup.waitForSelector('[data-testid="password-input"]', { timeout: 10000 });
  await popup.waitForSelector('[data-testid="login-button"]', { timeout: 10000 });
  
  // Fill in credentials
  await popup.fill('[data-testid="email-input"]', email);
  await popup.fill('[data-testid="password-input"]', password);
  
  // Click login button
  await popup.click('[data-testid="login-button"]');
  
  // Wait for navigation to home page
  await popup.waitForSelector('[data-testid="home-page"]', { timeout: 30000 });
}

/**
 * Wait for home page to be loaded
 */
export async function waitForHomePage(popup: Page): Promise<void> {
  await popup.waitForSelector('[data-testid="home-page"]', { timeout: 30000 });
}

/**
 * Add a test credential
 */
export async function addTestCredential(
  popup: Page, 
  title: string, 
  username: string, 
  password: string
): Promise<void> {
  // Navigate to add credential page
  await popup.click('[data-testid="helper-add-button"]');
  await popup.waitForSelector('[data-testid="add-credential-1-page"]', { timeout: 10000 });
  
  // Fill in credential details
  await popup.fill('[data-testid="title-input"]', title);
  await popup.click('[data-testid="next-button"]');
  
  await popup.waitForSelector('[data-testid="add-credential-2-page"]', { timeout: 10000 });
  await popup.fill('[data-testid="username-input"]', username);
  await popup.fill('[data-testid="password-input"]', password);
  
  // Save credential
  await popup.click('[data-testid="save-button"]');
  
  // Wait for navigation back to home
  await popup.waitForSelector('[data-testid="home-page"]', { timeout: 10000 });
}

/**
 * Navigate to a website for autofill testing
 */
export async function navigateToWebsite(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await page.waitForLoadState('networkidle');
}

/**
 * Detect if a login form is present on the page
 */
export async function detectLoginForm(page: Page): Promise<boolean> {
  try {
    // Look for common login form selectors
    const loginSelectors = [
      'input[type="email"]',
      'input[type="text"][name*="email"]',
      'input[type="text"][name*="username"]',
      'input[type="text"][name*="user"]',
      'input[type="password"]'
    ];
    
    for (const selector of loginSelectors) {
      const element = await page.$(selector);
      if (element) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error detecting login form:', error);
    return false;
  }
}

/**
 * Trigger autofill by clicking on a form field
 */
export async function triggerAutofill(page: Page): Promise<void> {
  // Click on email/username field to trigger autofill
  const emailField = await page.$('input[type="email"], input[type="text"][name*="email"], input[type="text"][name*="username"]');
  if (emailField) {
    await emailField.click();
    await page.waitForTimeout(1000); // Wait for popover to appear
  }
}

/**
 * Wait for autofill popover to appear
 */
export async function waitForAutofillPopover(page: Page): Promise<void> {
  await page.waitForSelector('[data-testid="autofill-popover"]', { timeout: 10000 });
}

/**
 * Select a credential from the autofill popover
 */
export async function selectCredentialFromPopover(page: Page, credentialTitle: string): Promise<void> {
  await waitForAutofillPopover(page);
  await page.click(`[data-testid="credential-option-${credentialTitle}"]`);
}

/**
 * Logout from the extension
 */
export async function logoutFromExtension(popup: Page): Promise<void> {
  // Navigate to settings or find logout button
  await popup.click('[data-testid="settings-button"]');
  await popup.waitForSelector('[data-testid="settings-page"]', { timeout: 10000 });
  
  // Click logout button
  await popup.click('[data-testid="logout-button"]');
  
  // Wait for navigation back to login
  await popup.waitForSelector('[data-testid="login-page"]', { timeout: 10000 });
}

/**
 * Clear all test data (for cleanup)
 */
export async function clearTestData(popup: Page): Promise<void> {
  // This would typically involve calling a cleanup function
  // or navigating to a settings page with a "clear all data" option
  console.log('Clearing test data...');
  // Implementation depends on your app's data management
}

/**
 * Take a screenshot for debugging
 */
export async function takeDebugScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({ 
    path: `playwright-report/debug-${name}-${Date.now()}.png`,
    fullPage: true 
  });
}

/**
 * Monitor console logs and errors
 */
export function setupConsoleMonitoring(page: Page): { logs: string[], errors: string[] } {
  const logs: string[] = [];
  const errors: string[] = [];
  
  page.on('console', msg => {
    const logEntry = `[${msg.type()}] ${msg.text()}`;
    logs.push(logEntry);
    
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  return { logs, errors };
}
