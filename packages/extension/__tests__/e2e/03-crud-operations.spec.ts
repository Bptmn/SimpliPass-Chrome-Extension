/**
 * CRUD Operations Tests
 * 
 * Tests Create, Read, Update, Delete operations for all item types
 */

import { test, expect } from './helpers/extensionContext';
import { openPopup, loginToExtension, waitForHomePage, addTestCredential, setupConsoleMonitoring } from './helpers/extensionHelpers';
import { TEST_USER_ACCOUNTS, TEST_CREDENTIALS, TEST_BANK_CARDS, TEST_SECURE_NOTES, TEST_TIMEOUTS } from './helpers/testData';

test.describe('CRUD Operations', () => {
  test.beforeEach(async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    await loginToExtension(popup, TEST_USER_ACCOUNTS.standard.email, TEST_USER_ACCOUNTS.standard.password);
    await waitForHomePage(popup);
    return popup;
  });

  test('should add new credential successfully', async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    await loginToExtension(popup, TEST_USER_ACCOUNTS.standard.email, TEST_USER_ACCOUNTS.standard.password);
    await waitForHomePage(popup);
    
    // Monitor console for errors
    const { logs, errors } = setupConsoleMonitoring(popup);
    
    // Add a test credential
    await addTestCredential(
      popup,
      TEST_CREDENTIALS.google.title,
      TEST_CREDENTIALS.google.username,
      TEST_CREDENTIALS.google.password
    );
    
    // Verify credential appears in list
    await expect(popup.locator(`[data-testid="credential-item-${TEST_CREDENTIALS.google.title}"]`)).toBeVisible();
    
    // Check for any console errors
    const unexpectedErrors = errors.filter(error => 
      !error.includes('DevTools') && 
      !error.includes('Extension')
    );
    
    if (unexpectedErrors.length > 0) {
      console.error('Console errors during credential creation:', unexpectedErrors);
    }
    
    expect(unexpectedErrors).toHaveLength(0);
    
    console.log('Credential added successfully');
    
    await popup.close();
  });

  test('should display credentials list', async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    await loginToExtension(popup, TEST_USER_ACCOUNTS.standard.email, TEST_USER_ACCOUNTS.standard.password);
    await waitForHomePage(popup);
    
    // Should see credentials list
    await expect(popup.locator('[data-testid="credentials-list"]')).toBeVisible();
    
    // Should see category buttons
    await expect(popup.locator('[data-testid="category-credentials"]')).toBeVisible();
    await expect(popup.locator('[data-testid="category-bank-cards"]')).toBeVisible();
    await expect(popup.locator('[data-testid="category-secure-notes"]')).toBeVisible();
    
    console.log('Credentials list displayed correctly');
    
    await popup.close();
  });

  test('should edit existing credential', async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    await loginToExtension(popup, TEST_USER_ACCOUNTS.standard.email, TEST_USER_ACCOUNTS.standard.password);
    await waitForHomePage(popup);
    
    // Add a credential first
    await addTestCredential(
      popup,
      TEST_CREDENTIALS.google.title,
      TEST_CREDENTIALS.google.username,
      TEST_CREDENTIALS.google.password
    );
    
    // Click on credential to edit
    await popup.click(`[data-testid="credential-item-${TEST_CREDENTIALS.google.title}"]`);
    await popup.waitForSelector('[data-testid="modify-credential-page"]', { timeout: TEST_TIMEOUTS.medium });
    
    // Edit the credential
    await popup.fill('[data-testid="title-input"]', 'Updated Google Account');
    await popup.fill('[data-testid="username-input"]', 'updated@gmail.com');
    
    // Save changes
    await popup.click('[data-testid="save-button"]');
    await popup.waitForSelector('[data-testid="home-page"]', { timeout: TEST_TIMEOUTS.medium });
    
    // Verify changes
    await expect(popup.locator('[data-testid="credential-item-Updated Google Account"]')).toBeVisible();
    
    console.log('Credential edited successfully');
    
    await popup.close();
  });

  test('should delete credential', async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    await loginToExtension(popup, TEST_USER_ACCOUNTS.standard.email, TEST_USER_ACCOUNTS.standard.password);
    await waitForHomePage(popup);
    
    // Add a credential first
    await addTestCredential(
      popup,
      TEST_CREDENTIALS.facebook.title,
      TEST_CREDENTIALS.facebook.username,
      TEST_CREDENTIALS.facebook.password
    );
    
    // Click on credential to delete
    await popup.click(`[data-testid="credential-item-${TEST_CREDENTIALS.facebook.title}"]`);
    await popup.waitForSelector('[data-testid="modify-credential-page"]', { timeout: TEST_TIMEOUTS.medium });
    
    // Click delete button
    await popup.click('[data-testid="delete-button"]');
    
    // Confirm deletion
    await popup.click('[data-testid="confirm-delete-button"]');
    await popup.waitForSelector('[data-testid="home-page"]', { timeout: TEST_TIMEOUTS.medium });
    
    // Verify credential is gone
    await expect(popup.locator(`[data-testid="credential-item-${TEST_CREDENTIALS.facebook.title}"]`)).not.toBeVisible();
    
    console.log('Credential deleted successfully');
    
    await popup.close();
  });

  test('should search credentials', async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    await loginToExtension(popup, TEST_USER_ACCOUNTS.standard.email, TEST_USER_ACCOUNTS.standard.password);
    await waitForHomePage(popup);
    
    // Add multiple credentials
    await addTestCredential(popup, TEST_CREDENTIALS.google.title, TEST_CREDENTIALS.google.username, TEST_CREDENTIALS.google.password);
    await addTestCredential(popup, TEST_CREDENTIALS.facebook.title, TEST_CREDENTIALS.facebook.username, TEST_CREDENTIALS.facebook.password);
    await addTestCredential(popup, TEST_CREDENTIALS.github.title, TEST_CREDENTIALS.github.username, TEST_CREDENTIALS.github.password);
    
    // Search for specific credential
    await popup.fill('[data-testid="search-input"]', 'Google');
    
    // Should only show Google credential
    await expect(popup.locator(`[data-testid="credential-item-${TEST_CREDENTIALS.google.title}"]`)).toBeVisible();
    await expect(popup.locator(`[data-testid="credential-item-${TEST_CREDENTIALS.facebook.title}"]`)).not.toBeVisible();
    await expect(popup.locator(`[data-testid="credential-item-${TEST_CREDENTIALS.github.title}"]`)).not.toBeVisible();
    
    console.log('Credential search works correctly');
    
    await popup.close();
  });

  test('should add new bank card successfully', async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    await loginToExtension(popup, TEST_USER_ACCOUNTS.standard.email, TEST_USER_ACCOUNTS.standard.password);
    await waitForHomePage(popup);
    
    // Switch to bank cards category
    await popup.click('[data-testid="category-bank-cards"]');
    
    // Click add button
    await popup.click('[data-testid="helper-add-button"]');
    await popup.waitForSelector('[data-testid="add-card-1-page"]', { timeout: TEST_TIMEOUTS.medium });
    
    // Fill in card details
    await popup.fill('[data-testid="title-input"]', TEST_BANK_CARDS.visa.title);
    await popup.click('[data-testid="next-button"]');
    
    await popup.waitForSelector('[data-testid="add-card-2-page"]', { timeout: TEST_TIMEOUTS.medium });
    await popup.fill('[data-testid="card-number-input"]', TEST_BANK_CARDS.visa.number);
    await popup.fill('[data-testid="expiry-input"]', TEST_BANK_CARDS.visa.expiry);
    await popup.fill('[data-testid="cvv-input"]', TEST_BANK_CARDS.visa.cvv);
    await popup.fill('[data-testid="cardholder-input"]', TEST_BANK_CARDS.visa.cardholder);
    
    // Save card
    await popup.click('[data-testid="save-button"]');
    await popup.waitForSelector('[data-testid="home-page"]', { timeout: TEST_TIMEOUTS.medium });
    
    // Verify card appears in list
    await expect(popup.locator(`[data-testid="bank-card-item-${TEST_BANK_CARDS.visa.title}"]`)).toBeVisible();
    
    console.log('Bank card added successfully');
    
    await popup.close();
  });

  test('should add new secure note successfully', async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    await loginToExtension(popup, TEST_USER_ACCOUNTS.standard.email, TEST_USER_ACCOUNTS.standard.password);
    await waitForHomePage(popup);
    
    // Switch to secure notes category
    await popup.click('[data-testid="category-secure-notes"]');
    
    // Click add button
    await popup.click('[data-testid="helper-add-button"]');
    await popup.waitForSelector('[data-testid="add-secure-note-page"]', { timeout: TEST_TIMEOUTS.medium });
    
    // Fill in note details
    await popup.fill('[data-testid="title-input"]', TEST_SECURE_NOTES.personal.title);
    await popup.fill('[data-testid="content-textarea"]', TEST_SECURE_NOTES.personal.content);
    
    // Save note
    await popup.click('[data-testid="save-button"]');
    await popup.waitForSelector('[data-testid="home-page"]', { timeout: TEST_TIMEOUTS.medium });
    
    // Verify note appears in list
    await expect(popup.locator(`[data-testid="secure-note-item-${TEST_SECURE_NOTES.personal.title}"]`)).toBeVisible();
    
    console.log('Secure note added successfully');
    
    await popup.close();
  });
});
