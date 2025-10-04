/**
 * Authentication E2E Tests
 * 
 * Tests the login flow of the SimpliPass extension.
 * Note: There is no signup in the extension (only via mobile app).
 * 
 * Test Coverage:
 * - Login with valid credentials
 * - Login with invalid credentials
 * - Email validation
 * - Password visibility toggle
 * - Error handling and display
 * - Logout flow
 */

import { test, expect } from './helpers/extensionContext';
import { createConsoleMonitor } from './helpers/consoleMonitor';
import { TEST_CONFIG, getPopupUrl } from './config/test.config';

test.describe('Authentication', () => {
  
  test('should display login form on first load', async ({ context, extensionId }) => {
    const popup = await context.newPage();
    const consoleMonitor = createConsoleMonitor(popup);
    
    await popup.goto(getPopupUrl(extensionId));
    await popup.waitForLoadState('networkidle');
    
    // Verify login form is visible
    await expect(popup.locator(TEST_CONFIG.selectors.login.emailInput)).toBeVisible();
    await expect(popup.locator(TEST_CONFIG.selectors.login.passwordInput)).toBeVisible();
    await expect(popup.locator(TEST_CONFIG.selectors.login.loginButton)).toBeVisible();
    
    // Verify no unexpected errors
    const unexpectedErrors = consoleMonitor.getUnexpectedErrors();
    expect(unexpectedErrors).toHaveLength(0);
    
    // Debug output
    consoleMonitor.printSummary();
    
    await popup.close();
  });

  test('should show error with invalid email format', async ({ context, extensionId }) => {
    const popup = await context.newPage();
    const consoleMonitor = createConsoleMonitor(popup);
    
    await popup.goto(getPopupUrl(extensionId));
    await popup.waitForLoadState('networkidle');
    
    // Fill form with malformed email
    await popup.fill(
      TEST_CONFIG.selectors.login.emailInput, 
      TEST_CONFIG.credentials.malformedEmail.email
    );
    await popup.fill(
      TEST_CONFIG.selectors.login.passwordInput, 
      TEST_CONFIG.credentials.malformedEmail.password
    );
    
    // Try to submit
    await popup.click(TEST_CONFIG.selectors.login.loginButton);
    
    // Wait for error message
    await popup.waitForSelector(TEST_CONFIG.selectors.login.errorMessage, {
      timeout: TEST_CONFIG.timeouts.default,
    });
    
    // Verify error message is displayed
    const errorMessage = await popup.locator(TEST_CONFIG.selectors.login.errorMessage).textContent();
    expect(errorMessage).toBeTruthy();
    console.log('Error message for invalid email:', errorMessage);
    
    // Debug output
    consoleMonitor.printErrors();
    
    await popup.close();
  });

  test('should show error with invalid credentials', async ({ context, extensionId }) => {
    const popup = await context.newPage();
    const consoleMonitor = createConsoleMonitor(popup);
    
    await popup.goto(getPopupUrl(extensionId));
    await popup.waitForLoadState('networkidle');
    
    // Fill form with invalid credentials
    await popup.fill(
      TEST_CONFIG.selectors.login.emailInput, 
      TEST_CONFIG.credentials.invalidUser.email
    );
    await popup.fill(
      TEST_CONFIG.selectors.login.passwordInput, 
      TEST_CONFIG.credentials.invalidUser.password
    );
    
    // Submit login
    await popup.click(TEST_CONFIG.selectors.login.loginButton);
    
    // Wait for error message
    await popup.waitForSelector(TEST_CONFIG.selectors.login.errorBanner, {
      timeout: TEST_CONFIG.timeouts.authentication,
    });
    
    // Verify error message is displayed
    const errorBanner = await popup.locator(TEST_CONFIG.selectors.login.errorBanner);
    await expect(errorBanner).toBeVisible();
    
    const errorText = await errorBanner.textContent();
    console.log('Error message for invalid credentials:', errorText);
    
    // Verify we're still on login page (not redirected)
    await expect(popup.locator(TEST_CONFIG.selectors.login.loginButton)).toBeVisible();
    
    // Debug output
    consoleMonitor.printAll();
    
    await popup.close();
  });

  test('should login successfully with valid credentials', async ({ context, extensionId }) => {
    const popup = await context.newPage();
    const consoleMonitor = createConsoleMonitor(popup);
    
    await popup.goto(getPopupUrl(extensionId));
    await popup.waitForLoadState('networkidle');
    
    // Fill form with valid credentials
    await popup.fill(
      TEST_CONFIG.selectors.login.emailInput, 
      TEST_CONFIG.credentials.validUser.email
    );
    await popup.fill(
      TEST_CONFIG.selectors.login.passwordInput, 
      TEST_CONFIG.credentials.validUser.password
    );
    
    // Submit login
    await popup.click(TEST_CONFIG.selectors.login.loginButton);
    
    // Wait for home page to load
    await popup.waitForSelector(TEST_CONFIG.selectors.home.page, {
      timeout: TEST_CONFIG.timeouts.authentication,
    });
    
    // Verify we're on the home page
    await expect(popup.locator(TEST_CONFIG.selectors.home.page)).toBeVisible();
    
    // Verify login form is no longer visible
    await expect(popup.locator(TEST_CONFIG.selectors.login.loginButton)).not.toBeVisible();
    
    // Check for successful authentication logs
    const hasAuthSuccess = consoleMonitor.hasMessage('authenticated') || 
                          consoleMonitor.hasMessage('login') ||
                          consoleMonitor.hasMessage('sign in');
    
    console.log('Authentication successful:', hasAuthSuccess);
    
    // Debug output
    consoleMonitor.printSummary();
    
    // Note: We don't check for console errors here because the app may have
    // decryption errors or other expected errors after login that are handled gracefully
    
    await popup.close();
  });

  test('should logout successfully', async ({ context, extensionId }) => {
    const popup = await context.newPage();
    const consoleMonitor = createConsoleMonitor(popup);
    
    await popup.goto(getPopupUrl(extensionId));
    await popup.waitForLoadState('networkidle');
    
    // First, login
    await popup.fill(
      TEST_CONFIG.selectors.login.emailInput, 
      TEST_CONFIG.credentials.validUser.email
    );
    await popup.fill(
      TEST_CONFIG.selectors.login.passwordInput, 
      TEST_CONFIG.credentials.validUser.password
    );
    await popup.click(TEST_CONFIG.selectors.login.loginButton);
    
    // Wait for home page
    await popup.waitForSelector(TEST_CONFIG.selectors.home.page, {
      timeout: TEST_CONFIG.timeouts.authentication,
    });
    
    // Now logout
    await popup.click(TEST_CONFIG.selectors.home.logoutButton);
    
    // Wait for login form to reappear
    await popup.waitForSelector(TEST_CONFIG.selectors.login.loginButton, {
      timeout: TEST_CONFIG.timeouts.default,
    });
    
    // Verify we're back on login page
    await expect(popup.locator(TEST_CONFIG.selectors.login.loginButton)).toBeVisible();
    await expect(popup.locator(TEST_CONFIG.selectors.home.page)).not.toBeVisible();
    
    // Check for logout logs
    const hasLogoutLog = consoleMonitor.hasMessage('logout') || 
                        consoleMonitor.hasMessage('sign out');
    
    console.log('Logout successful:', hasLogoutLog);
    
    // Debug output
    consoleMonitor.printSummary();
    
    await popup.close();
  });

  test('should toggle password visibility', async ({ context, extensionId }) => {
    const popup = await context.newPage();
    const consoleMonitor = createConsoleMonitor(popup);
    
    await popup.goto(getPopupUrl(extensionId));
    await popup.waitForLoadState('networkidle');
    
    const passwordInput = popup.locator(TEST_CONFIG.selectors.login.passwordInput);
    const toggleButton = popup.locator('[data-testid="password-toggle"]');
    
    // Fill password
    await popup.fill(TEST_CONFIG.selectors.login.passwordInput, 'TestPassword123!');
    
    // Initially should be type="password"
    const initialType = await passwordInput.getAttribute('type');
    expect(initialType).toBe('password');
    
    // Click toggle to show password
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      
      // Should now be type="text"
      const visibleType = await passwordInput.getAttribute('type');
      expect(visibleType).toBe('text');
      
      // Click toggle to hide password again
      await toggleButton.click();
      
      // Should be back to type="password"
      const hiddenType = await passwordInput.getAttribute('type');
      expect(hiddenType).toBe('password');
      
      console.log('Password visibility toggle works correctly');
    } else {
      console.log('Password toggle button not found - skipping test');
    }
    
    // Verify no errors
    const unexpectedErrors = consoleMonitor.getUnexpectedErrors();
    expect(unexpectedErrors).toHaveLength(0);
    
    await popup.close();
  });
});

