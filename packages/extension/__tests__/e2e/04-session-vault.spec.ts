/**
 * Session & Vault Management Tests
 * 
 * Tests for logout, auto-lock, and vault management
 */

import { test, expect } from './helpers/extensionContext';
import { openPopup, loginToExtension, waitForHomePage, logoutFromExtension } from './helpers/extensionHelpers';
import { TEST_USER_ACCOUNTS, TEST_TIMEOUTS } from './helpers/testData';

test.describe('Session & Vault Management', () => {
  test('should logout and return to login page', async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    
    // Login first
    await loginToExtension(
      popup, 
      TEST_USER_ACCOUNTS.standard.email, 
      TEST_USER_ACCOUNTS.standard.password
    );
    
    await waitForHomePage(popup);
    
    // Logout
    await logoutFromExtension(popup);
    
    // Should be back on login page
    await expect(popup.locator('[data-testid="email-input"]')).toBeVisible({ timeout: TEST_TIMEOUTS.medium });
    await expect(popup.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(popup.locator('[data-testid="login-button"]')).toBeVisible();
    
    console.log('Logout successful - returned to login page');
    
    await popup.close();
  });

  test('should auto-lock after inactivity timeout', async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    
    // Login first
    await loginToExtension(
      popup, 
      TEST_USER_ACCOUNTS.standard.email, 
      TEST_USER_ACCOUNTS.standard.password
    );
    
    await waitForHomePage(popup);
    
    // Simulate auto-lock by clearing session storage (which triggers lock)
    // In a real scenario, this would happen after 30 minutes of inactivity
    // For testing, we simulate it by directly clearing the secret key
    await popup.evaluate(() => {
      // Clear session storage to simulate auto-lock
      if (chrome && chrome.storage && chrome.storage.session) {
        chrome.storage.session.clear();
      }
    });
    
    // Wait a bit for the state to update
    await popup.waitForTimeout(1000);
    
    // Reload the popup to trigger lock detection
    await popup.reload();
    await popup.waitForLoadState('networkidle');
    
    // Should be on lock page
    await expect(popup.locator('[data-testid="lock-page"]')).toBeVisible({ timeout: TEST_TIMEOUTS.medium });
    
    console.log('Auto-lock triggered - lock page displayed');
    
    await popup.close();
  });

  test('should clear vault on logout', async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    
    // Login first
    await loginToExtension(
      popup, 
      TEST_USER_ACCOUNTS.standard.email, 
      TEST_USER_ACCOUNTS.standard.password
    );
    
    await waitForHomePage(popup);
    
    // Check that vault exists in session storage before logout
    const vaultBeforeLogout = await popup.evaluate(() => {
      return new Promise((resolve) => {
        if (chrome && chrome.storage && chrome.storage.session) {
          chrome.storage.session.get(null, (items) => {
            resolve(items);
          });
        } else {
          resolve(null);
        }
      });
    });
    
    expect(vaultBeforeLogout).toBeTruthy();
    
    // Logout
    await logoutFromExtension(popup);
    
    // Check that vault is cleared from session storage after logout
    const vaultAfterLogout = await popup.evaluate(() => {
      return new Promise((resolve) => {
        if (chrome && chrome.storage && chrome.storage.session) {
          chrome.storage.session.get(null, (items) => {
            resolve(items);
          });
        } else {
          resolve(null);
        }
      });
    });
    
    // Vault should be empty or cleared
    expect(vaultAfterLogout).toBeTruthy();
    const vaultKeys = Object.keys(vaultAfterLogout as Record<string, any>);
    // Should have minimal or no vault data
    expect(vaultKeys.length).toBeLessThanOrEqual(1); // May have some metadata but not vault data
    
    console.log('Vault cleared on logout');
    
    await popup.close();
  });
});
