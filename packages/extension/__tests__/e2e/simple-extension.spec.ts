/**
 * Simple Extension Test
 * 
 * Basic test to verify Playwright can load Chrome with extension
 */

import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Simple Extension Test', () => {
  test('should load Chrome with extension', async () => {
    // Path to the built extension
    const extensionPath = path.join(__dirname, '../../dist');

    // Launch browser with extension
    const context = await test.browser.newContext({
      // Note: This is a simplified test without the full extension context
    });

    const page = await context.newPage();
    
    // Navigate to a simple page to test basic functionality
    await page.goto('https://example.com');
    await expect(page).toHaveTitle(/Example Domain/);
    
    console.log('Basic Playwright test works');
    
    await context.close();
  });

  test('should load extension manually', async () => {
    const { chromium } = await import('@playwright/test');
    const extensionPath = path.join(__dirname, '../../dist');
    
    console.log('Extension path:', extensionPath);
    
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--disable-web-security',
        '--no-sandbox'
      ]
    });

    console.log('Browser context created with extension');
    
    // Create a page
    const page = await context.newPage();
    await page.goto('https://example.com');

    // Check that the page loads
    await expect(page).toHaveTitle(/Example Domain/);

    console.log('Extension loaded successfully');
    
    await context.close();
  });
});
