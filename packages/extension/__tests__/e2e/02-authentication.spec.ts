/**
 * Authentication Tests
 * 
 * Tests the complete authentication flow with real AWS Cognito
 */

import { test, expect } from './helpers/extensionContext';
import { openPopup, loginToExtension, waitForHomePage, logoutFromExtension, setupConsoleMonitoring } from './helpers/extensionHelpers';
import { TEST_USER_ACCOUNTS, TEST_TIMEOUTS } from './helpers/testData';

test.describe('Authentication Flow', () => {
  test('should show login page when not authenticated', async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    
    // Monitor console for errors
    const { logs, errors } = setupConsoleMonitoring(popup);
    
    // Should see login form elements
    await expect(popup.locator('[data-testid="email-input"]')).toBeVisible({ timeout: TEST_TIMEOUTS.medium });
    await expect(popup.locator('[data-testid="password-input"]')).toBeVisible({ timeout: TEST_TIMEOUTS.medium });
    await expect(popup.locator('[data-testid="login-button"]')).toBeVisible({ timeout: TEST_TIMEOUTS.medium });
    
    // Check for any console errors
    const unexpectedErrors = errors.filter(error => 
      !error.includes('DevTools') && 
      !error.includes('Extension')
    );
    
    if (unexpectedErrors.length > 0) {
      console.error('Console errors on login page:', unexpectedErrors);
    }
    
    expect(unexpectedErrors).toHaveLength(0);
    
    console.log('Login page displayed correctly');
    
    await popup.close();
  });

  test('should login successfully with valid credentials', async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    
    // Monitor console for errors
    const { logs, errors } = setupConsoleMonitoring(popup);
    
    // Login with valid credentials
    await loginToExtension(
      popup, 
      TEST_USER_ACCOUNTS.standard.email, 
      TEST_USER_ACCOUNTS.standard.password
    );
    
    // Should be on home page
    await waitForHomePage(popup);
    await expect(popup.locator('[data-testid="home-page"]')).toBeVisible();
    
    // Check for any console errors during login
    const unexpectedErrors = errors.filter(error => 
      !error.includes('DevTools') && 
      !error.includes('Extension') &&
      !error.includes('chrome-extension://')
    );
    
    if (unexpectedErrors.length > 0) {
      console.error('Console errors during login:', unexpectedErrors);
    }
    
    expect(unexpectedErrors).toHaveLength(0);
    
    console.log('Login successful');
    console.log('Console logs:', logs.slice(0, 10)); // Show first 10 logs
    
    await popup.close();
  });

  test('should display home page after login', async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    
    // Login first
    await loginToExtension(
      popup, 
      TEST_USER_ACCOUNTS.standard.email, 
      TEST_USER_ACCOUNTS.standard.password
    );
    
    // Wait for home page
    await waitForHomePage(popup);
    
    // Check home page elements
    await expect(popup.locator('[data-testid="home-page"]')).toBeVisible();
    await expect(popup.locator('[data-testid="credentials-list"]')).toBeVisible();
    await expect(popup.locator('[data-testid="category-credentials"]')).toBeVisible();
    await expect(popup.locator('[data-testid="category-bank-cards"]')).toBeVisible();
    await expect(popup.locator('[data-testid="category-secure-notes"]')).toBeVisible();
    
    console.log('Home page displayed correctly');
    
    await popup.close();
  });

  test('should handle invalid credentials gracefully', async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    
    // Try to login with invalid credentials
    await popup.fill('[data-testid="email-input"]', 'invalid@example.com');
    await popup.fill('[data-testid="password-input"]', 'wrongpassword');
    await popup.click('[data-testid="login-button"]');
    
    // Should show error message
    await expect(popup.locator('[data-testid="error-message"]')).toBeVisible({ timeout: TEST_TIMEOUTS.medium });
    
    // Should still be on login page
    await expect(popup.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(popup.locator('[data-testid="password-input"]')).toBeVisible();
    
    console.log('Invalid credentials handled correctly');
    
    await popup.close();
  });

  test('should logout successfully', async ({ context, extensionId }) => {
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
    
    console.log('Logout successful');
    
    await popup.close();
  });

  test('should redirect to login after logout', async ({ context, extensionId }) => {
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
    
    // Try to access home page directly (should redirect to login)
    await popup.goto(`chrome-extension://${extensionId}/popup.html#/home`);
    await popup.waitForLoadState('networkidle');
    
    // Should be redirected to login
    await expect(popup.locator('[data-testid="email-input"]')).toBeVisible({ timeout: TEST_TIMEOUTS.medium });
    
    console.log('Redirect to login after logout works correctly');
    
    await popup.close();
  });

  test('should handle session timeout', async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    
    // Login first
    await loginToExtension(
      popup, 
      TEST_USER_ACCOUNTS.standard.email, 
      TEST_USER_ACCOUNTS.standard.password
    );
    
    await waitForHomePage(popup);
    
    // Simulate session timeout by clearing storage
    await popup.evaluate(() => {
      if (chrome && chrome.storage) {
        chrome.storage.local.clear();
        chrome.storage.session.clear();
      }
    });
    
    // Try to access home page (should redirect to login)
    await popup.goto(`chrome-extension://${extensionId}/popup.html#/home`);
    await popup.waitForLoadState('networkidle');
    
    // Should be redirected to login
    await expect(popup.locator('[data-testid="email-input"]')).toBeVisible({ timeout: TEST_TIMEOUTS.medium });
    
    console.log('Session timeout handled correctly');
    
    await popup.close();
  });
});
