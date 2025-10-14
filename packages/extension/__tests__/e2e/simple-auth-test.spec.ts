/**
 * Simple Authentication Test
 * 
 * Test d'authentification simple qui charge l'extension et teste le login
 */

import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Simple Authentication Test', () => {
  test('should load extension and test authentication', async () => {
    const { chromium } = await import('@playwright/test');
    const extensionPath = path.join(__dirname, '../../dist');
    
    console.log('🔨 Extension path:', extensionPath);
    
    // Launch browser with extension
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--disable-web-security',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });

    console.log('✅ Browser context created with extension');
    
    // Wait for extension to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Create a page to test the extension
    const page = await context.newPage();
    
    // Navigate to a simple page first
    await page.goto('https://example.com');
    await expect(page).toHaveTitle(/Example Domain/);
    
    console.log('✅ Basic page navigation works');
    
    // Now try to access the extension popup
    // We'll try different possible extension IDs
    const possibleIds = [
      'abcdefghijklmnopqrstuvwxyz123456', // Placeholder
      'test-extension-id', // Another placeholder
    ];
    
    let popupLoaded = false;
    let workingExtensionId = '';
    
    for (const extensionId of possibleIds) {
      try {
        console.log(`🔍 Trying extension ID: ${extensionId}`);
        
        const popup = await context.newPage();
        await popup.goto(`chrome-extension://${extensionId}/popup.html`, { timeout: 5000 });
        await popup.waitForLoadState('networkidle', { timeout: 10000 });
        
        console.log('✅ Popup loaded with ID:', extensionId);
        
        // Check if we can see the popup content
        const body = await popup.locator('body');
        await expect(body).toBeVisible();
        
        console.log('✅ Popup body is visible');
        
        // Take screenshot for debugging
        await popup.screenshot({ path: `playwright-report/popup-${extensionId}.png` });
        
        // Check for login form elements
        const emailInput = popup.locator('[data-testid="email-input"]');
        const passwordInput = popup.locator('[data-testid="password-input"]');
        const loginButton = popup.locator('[data-testid="login-button"]');
        
        // Check if login form exists
        if (await emailInput.isVisible() && await passwordInput.isVisible() && await loginButton.isVisible()) {
          console.log('✅ Login form found!');
          
          // Get credentials from environment
          const email = process.env.TEST_USER_EMAIL;
          const password = process.env.TEST_USER_PASSWORD;
          
          if (!email || !password) {
            console.log('❌ TEST_USER_EMAIL and TEST_USER_PASSWORD must be set in .env file');
            await popup.close();
            continue;
          }
          
          console.log('🔐 Using credentials:', email);
          
          // Fill in credentials
          await emailInput.fill(email);
          await passwordInput.fill(password);
          
          console.log('✅ Credentials filled');
          
          // Take screenshot before login
          await popup.screenshot({ path: `playwright-report/before-login-${extensionId}.png` });
          
          // Click login button
          await loginButton.click();
          
          console.log('✅ Login button clicked');
          
          // Wait for navigation or home page
          try {
            await popup.waitForSelector('[data-testid="home-page"]', { timeout: 30000 });
            console.log('🎉 SUCCESS: Login successful - Home page loaded');
            
            // Take screenshot of success
            await popup.screenshot({ path: `playwright-report/login-success-${extensionId}.png` });
            
            popupLoaded = true;
            workingExtensionId = extensionId;
            
          } catch (error) {
            console.log('⚠️ Login may have failed or taken longer than expected');
            
            // Check for error messages
            const errorMessage = popup.locator('[data-testid="error-message"]');
            if (await errorMessage.isVisible()) {
              const errorText = await errorMessage.textContent();
              console.log('❌ Error message:', errorText);
            }
            
            // Take screenshot for debugging
            await popup.screenshot({ path: `playwright-report/login-failed-${extensionId}.png` });
            
            // Log current URL
            const currentUrl = popup.url();
            console.log('Current URL:', currentUrl);
          }
          
          await popup.close();
          break;
        } else {
          console.log('❌ Login form not found with ID:', extensionId);
          await popup.close();
        }
        
      } catch (error) {
        console.log(`❌ Error with extension ID ${extensionId}:`, error.message);
      }
    }
    
    if (!popupLoaded) {
      console.log('❌ Could not load extension popup with any ID');
      
      // Try to get extension ID from chrome://extensions/
      const extensionsPage = await context.newPage();
      await extensionsPage.goto('chrome://extensions/');
      await extensionsPage.waitForLoadState('networkidle');
      
      // Take screenshot of extensions page
      await extensionsPage.screenshot({ path: 'playwright-report/extensions-page.png' });
      
      // Log page content for debugging
      const pageContent = await extensionsPage.content();
      console.log('Extensions page content preview:', pageContent.substring(0, 1000));
      
      await extensionsPage.close();
    } else {
      console.log(`🎉 Extension loaded successfully with ID: ${workingExtensionId}`);
    }
    
    await page.close();
    await context.close();
    
    console.log('🏁 Test completed');
  });
});
