/**
 * Extension Loading Tests
 * 
 * Tests the basic loading and initialization of the Chrome extension
 */

import { test, expect } from './helpers/extensionContext';
import { loadExtension, openPopup, setupConsoleMonitoring } from './helpers/extensionHelpers';

test.describe('Extension Loading', () => {
  test('should load extension without errors', async ({ context, extensionId }) => {
    console.log('Testing extension loading with ID:', extensionId);
    
    // Verify extension ID is valid
    expect(extensionId).toBeTruthy();
    expect(extensionId).toMatch(/^[a-z0-9]{32}$/);
    
    // Check that extension targets are available
    const targets = context.targets();
    const serviceWorkerTarget = targets.find(target => target.type() === 'service_worker');
    expect(serviceWorkerTarget).toBeTruthy();
    
    console.log('Extension loaded successfully');
  });

  test('should display popup correctly', async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    
    // Monitor console for errors
    const { logs, errors } = setupConsoleMonitoring(popup);
    
    // Check that popup loads without errors
    await expect(popup).toHaveTitle(/SimpliPass/);
    
    // Check for any console errors
    const unexpectedErrors = errors.filter(error => 
      !error.includes('DevTools') && 
      !error.includes('Extension') &&
      !error.includes('chrome-extension://')
    );
    
    if (unexpectedErrors.length > 0) {
      console.error('Console errors detected:', unexpectedErrors);
    }
    
    expect(unexpectedErrors).toHaveLength(0);
    
    // Check that popup has expected content
    await expect(popup.locator('body')).toBeVisible();
    
    console.log('Popup displayed correctly');
    console.log('Console logs:', logs.slice(0, 10)); // Show first 10 logs
    
    await popup.close();
  });

  test('should initialize storage properly', async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    
    // Wait for initialization to complete
    await popup.waitForLoadState('networkidle');
    
    // Check that storage is accessible (this would depend on your app's implementation)
    const storageInitialized = await popup.evaluate(() => {
      return typeof chrome !== 'undefined' && chrome.storage !== 'undefined';
    });
    
    expect(storageInitialized).toBe(true);
    
    console.log('Storage initialized correctly');
    
    await popup.close();
  });

  test('should handle extension updates gracefully', async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    
    // Simulate extension update by reloading the popup
    await popup.reload();
    await popup.waitForLoadState('networkidle');
    
    // Check that popup still works after reload
    await expect(popup.locator('body')).toBeVisible();
    
    console.log('Extension handles updates gracefully');
    
    await popup.close();
  });

  test('should have proper extension permissions', async ({ context, extensionId }) => {
    // This test would verify that the extension has the required permissions
    // This is more of a manifest validation, but we can check runtime behavior
    
    const popup = await openPopup(context, extensionId);
    
    // Check that extension can access required APIs
    const hasRequiredAPIs = await popup.evaluate(() => {
      return {
        storage: typeof chrome !== 'undefined' && chrome.storage !== 'undefined',
        runtime: typeof chrome !== 'undefined' && chrome.runtime !== 'undefined',
        tabs: typeof chrome !== 'undefined' && chrome.tabs !== 'undefined',
      };
    });
    
    expect(hasRequiredAPIs.storage).toBe(true);
    expect(hasRequiredAPIs.runtime).toBe(true);
    expect(hasRequiredAPIs.tabs).toBe(true);
    
    console.log('Extension has proper permissions:', hasRequiredAPIs);
    
    await popup.close();
  });
});
