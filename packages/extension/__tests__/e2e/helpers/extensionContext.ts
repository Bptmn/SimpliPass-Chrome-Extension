/**
 * Extension Context for Playwright E2E Tests
 * 
 * Provides Chrome extension context and extension ID for all E2E tests
 */

import { test as base, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';

// Define the type for the custom context
type ExtensionContext = {
  context: BrowserContext;
  extensionId: string;
};

export const test = base.extend<ExtensionContext>({
  context: async ({}, use) => {
    // Path to the built extension
    const extensionPath = path.join(__dirname, '../../../dist');

    // Launch browser with extension
    const context = await chromium.launchPersistentContext('', {
      headless: false, // Always show browser for debugging
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ]
    });

    // Get the extension ID from the service worker (recommended method)
    let extensionId = '';
    try {
      // Wait for service worker to be active
      let serviceWorker = context.serviceWorkers().find(sw => 
        sw.url().includes('chrome-extension://')
      );
      
      if (!serviceWorker) {
        // Wait for service worker to be created
        serviceWorker = await context.waitForEvent('serviceworker');
      }
      
      // Extract extension ID from service worker URL
      const serviceWorkerUrl = serviceWorker.url();
      console.log('Service worker URL:', serviceWorkerUrl);
      
      const match = serviceWorkerUrl.match(/chrome-extension:\/\/([a-z0-9]{32})/);
      if (match && match[1]) {
        extensionId = match[1];
        console.log('✅ Found extension ID from service worker:', extensionId);
      }
    } catch (error) {
      console.log('Could not get service worker, trying fallback method:', error);
      
      // Fallback: try to get from targets
      try {
        const targets = await context.targets();
        for (const target of targets) {
          if (target.type() === 'service_worker') {
            const url = target.url();
            const match = url.match(/(chrome-extension:\/\/[a-z0-9]{32})\//);
            if (match && match[1]) {
              extensionId = match[1].split('://')[1];
              console.log('✅ Found extension ID from targets:', extensionId);
              break;
            }
          }
        }
      } catch (targetError) {
        console.log('Could not get targets either:', targetError);
        extensionId = 'test-extension-id'; // Final fallback for testing
      }
    }

    if (!extensionId) {
      throw new Error('Could not find extension ID');
    }

    console.log('Extension loaded with ID:', extensionId);

    // Use the context and extensionId
    await use(context);
    await context.close();
  },

  extensionId: async ({ context }, use) => {
    // The extensionId is already determined in the context fixture
    // We need to extract it again or pass it through
    let extensionId = '';
    try {
      // Try service worker method first (recommended)
      let serviceWorker = context.serviceWorkers().find(sw => 
        sw.url().includes('chrome-extension://')
      );
      
      if (!serviceWorker) {
        // Wait for service worker to be created
        serviceWorker = await context.waitForEvent('serviceworker');
      }
      
      const serviceWorkerUrl = serviceWorker.url();
      const match = serviceWorkerUrl.match(/chrome-extension:\/\/([a-z0-9]{32})/);
      if (match && match[1]) {
        extensionId = match[1];
        console.log('✅ Found extension ID in fixture:', extensionId);
      }
    } catch (error) {
      console.log('Could not get service worker in extensionId fixture, trying fallback:', error);
      
      // Fallback: try targets method
      try {
        const targets = await context.targets();
        for (const target of targets) {
          if (target.type() === 'service_worker') {
            const url = target.url();
            const match = url.match(/(chrome-extension:\/\/[a-z0-9]{32})\//);
            if (match && match[1]) {
              extensionId = match[1].split('://')[1];
              console.log('✅ Found extension ID from targets in fixture:', extensionId);
              break;
            }
          }
        }
      } catch (targetError) {
        console.log('Could not get targets in extensionId fixture either:', targetError);
        extensionId = 'test-extension-id'; // Final fallback for testing
      }
    }
    
    if (!extensionId) {
      throw new Error('Could not find extension ID in extensionId fixture');
    }
    await use(extensionId);
  }
});

export { expect } from '@playwright/test';
