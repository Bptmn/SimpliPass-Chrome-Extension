import { test, expect } from './helpers/extensionContext';

test.describe('Extension Initialization', () => {
  test('should load extension successfully', async ({ context, extensionId }) => {
    // Extension ID should be a 32-character lowercase string
    expect(extensionId).toBeTruthy();
    expect(extensionId).toMatch(/^[a-z]{32}$/);
    
    console.log('Extension loaded with ID:', extensionId);
  });

  test('should open popup without errors', async ({ context, extensionId }) => {
    const popup = await context.newPage();
    
    // Monitor console for errors
    const logs: string[] = [];
    const errors: string[] = [];
    
    popup.on('console', msg => {
      logs.push(`[${msg.type()}] ${msg.text()}`);
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    popup.on('pageerror', error => {
      errors.push(`Page error: ${error.message}`);
    });
    
    // Open popup
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.waitForLoadState('networkidle');
    
    // Verify popup loaded
    await expect(popup.locator('body')).toBeVisible();
    
    // Print logs for debugging
    console.log('=== Console Logs ===');
    logs.forEach(log => console.log(log));
    
    // Check for unexpected errors (filter out DevTools warnings)
    const unexpectedErrors = errors.filter(e => !e.includes('DevTools'));
    if (unexpectedErrors.length > 0) {
      console.log('=== Unexpected Errors ===');
      unexpectedErrors.forEach(error => console.error(error));
    }
    
    expect(unexpectedErrors).toHaveLength(0);
  });

  test('should have correct manifest configuration', async ({ context, extensionId }) => {
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/manifest.json`);
    
    const manifestText = await popup.locator('pre').textContent();
    const manifest = JSON.parse(manifestText || '{}');
    
    // Verify key manifest properties
    expect(manifest.name).toBeTruthy();
    expect(manifest.version).toBeTruthy();
    expect(manifest.manifest_version).toBe(3);
    
    console.log('Extension name:', manifest.name);
    console.log('Extension version:', manifest.version);
  });
});
