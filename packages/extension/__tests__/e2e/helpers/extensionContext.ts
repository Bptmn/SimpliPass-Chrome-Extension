import { test as base, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';
import { existsSync } from 'fs';
import { TEST_CONFIG } from '../config/test.config';

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({}, use) => {
    // Path from packages/extension/__tests__/e2e/helpers/ to root/dist
    const pathToExtension = path.resolve(__dirname, '../../../../../dist');
    
    // Verify extension build exists
    if (!existsSync(pathToExtension)) {
      throw new Error(`Extension build not found at: ${pathToExtension}. Run 'npm run build:extension' first.`);
    }
    
    // Get browser settings from test config
    const headless = TEST_CONFIG.browser.headless;
    const slowMo = TEST_CONFIG.browser.slowMo;
    
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium', // Required for extensions
      headless: headless,
      slowMo: slowMo, // Delay between actions for visibility
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    // Wait for service worker to be ready
    let [serviceWorker] = context.serviceWorkers();
    if (!serviceWorker) {
      // Wait for service worker with configured timeout
      try {
        serviceWorker = await context.waitForEvent('serviceworker', { 
          timeout: TEST_CONFIG.timeouts.serviceWorker 
        });
      } catch (error) {
        // If no service worker after 10s, try to get extension ID from pages
        const pages = context.pages();
        if (pages.length > 0) {
          const page = pages[0];
          await page.goto('chrome://extensions/');
          // This is a fallback - we'll extract ID differently
          throw new Error('Service worker not found. Extension may have failed to load. Check console logs.');
        }
        throw error;
      }
    }
    
    const extensionId = serviceWorker.url().split('/')[2];
    console.log('Extension ID:', extensionId);
    await use(extensionId);
  },
});

export const expect = test.expect;
