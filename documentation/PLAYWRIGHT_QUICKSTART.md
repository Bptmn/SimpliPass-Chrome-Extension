# Playwright E2E Testing - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Playwright
```bash
npm install --save-dev @playwright/test playwright-chromium
npx playwright install chromium
```

### Step 2: Create Basic Structure
```bash
# Create directories
mkdir -p packages/extension/__tests__/e2e/helpers
mkdir -p configs/playwright

# You're ready to create test files!
```

### Step 3: Run Your First Test

#### Create a Simple Test
**File**: `packages/extension/__tests__/e2e/smoke.spec.ts`

```typescript
import { test, expect, chromium } from '@playwright/test';
import path from 'path';

test('extension loads successfully', async () => {
  const pathToExtension = path.join(__dirname, '../../../dist');
  
  const context = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
    ],
  });

  // Get extension ID
  let [background] = context.serviceWorkers();
  if (!background) {
    background = await context.waitForEvent('serviceworker');
  }
  
  const extensionId = background.url().split('/')[2];
  expect(extensionId).toBeTruthy();
  
  // Open popup
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  
  // Verify popup loaded
  await expect(page.locator('body')).toBeVisible();
  
  await context.close();
});
```

#### Run the Test
```bash
# First, build your extension
npm run build:extension

# Run the test
npx playwright test packages/extension/__tests__/e2e/smoke.spec.ts --headed
```

---

## 📖 Test Pattern Examples

### Example 1: Test with Console Logging
```typescript
test('tracks console logs', async () => {
  const logs: string[] = [];
  const errors: string[] = [];
  
  page.on('console', msg => {
    logs.push(`[${msg.type()}] ${msg.text()}`);
    if (msg.type() === 'error') errors.push(msg.text());
  });
  
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  
  // Print logs for debugging
  console.log('Console logs:', logs);
  console.log('Errors:', errors);
  
  // Assert no errors
  expect(errors.filter(e => !e.includes('DevTools'))).toHaveLength(0);
});
```

### Example 2: Test with Screenshots
```typescript
test('takes screenshot on specific action', async () => {
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  
  // Take screenshot before action
  await page.screenshot({ path: 'before-action.png' });
  
  await page.click('[data-testid="some-button"]');
  
  // Take screenshot after action
  await page.screenshot({ path: 'after-action.png' });
});
```

### Example 3: Test with Network Monitoring
```typescript
test('monitors network requests', async () => {
  const requests: string[] = [];
  
  page.on('request', request => {
    requests.push(`${request.method()} ${request.url()}`);
  });
  
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  
  console.log('Network requests:', requests);
});
```

### Example 4: Test Form Interaction
```typescript
test('fills and submits form', async () => {
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  
  // Fill form
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Wait for navigation or response
  await page.waitForSelector('[data-testid="home-page"]', { timeout: 5000 });
  
  // Verify
  await expect(page.locator('[data-testid="home-page"]')).toBeVisible();
});
```

---

## 🎯 Key Commands for Cursor AI

### Development Workflow
```bash
# 1. Build extension
npm run build:extension

# 2. Run specific test (headed mode to see what's happening)
npx playwright test path/to/test.spec.ts --headed

# 3. Debug mode (step through test)
npx playwright test path/to/test.spec.ts --debug

# 4. Run all tests
npx playwright test

# 5. View test report
npx playwright show-report
```

### Useful Flags
```bash
# Run tests with UI (interactive)
npx playwright test --ui

# Run specific test by name
npx playwright test -g "test name"

# Run with traces (for debugging)
npx playwright test --trace on

# Update snapshots
npx playwright test --update-snapshots

# Run only failed tests
npx playwright test --last-failed
```

---

## 🐛 Debugging Tips

### 1. Add Data Test IDs to Components
```tsx
// In your React components
<button data-testid="login-button">Login</button>
<div data-testid="error-message">{error}</div>
<form data-testid="login-form">...</form>
```

### 2. Use page.pause() for Debugging
```typescript
test('debug test', async ({ page }) => {
  await page.goto('...');
  
  // Pauses test execution, opens inspector
  await page.pause();
  
  // Continue with test...
});
```

### 3. Enable Verbose Logging
```typescript
test('with logging', async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));
  page.on('request', req => console.log('REQUEST:', req.url()));
  page.on('response', res => console.log('RESPONSE:', res.url(), res.status()));
});
```

### 4. Take Screenshots for Debugging
```typescript
// Take screenshot at any point
await page.screenshot({ path: 'debug.png', fullPage: true });

// Or use in config
use: {
  screenshot: 'on', // Takes screenshot after each test
  video: 'on',      // Records video
  trace: 'on',      // Records trace
}
```

---

## 📋 Quick Checklist for New Tests

- [ ] Build extension first (`npm run build:extension`)
- [ ] Test has meaningful name
- [ ] Test is isolated (doesn't depend on other tests)
- [ ] Uses data-testid selectors
- [ ] Has console log monitoring
- [ ] Has error assertions
- [ ] Takes screenshots on failure
- [ ] Has timeout for async operations
- [ ] Cleans up (closes context)

---

## 🤖 Cursor AI Instructions

When implementing tests:

1. **Always build first**: `npm run build:extension`
2. **Start simple**: One assertion per test
3. **Add logging**: Track console output
4. **Use data-testid**: Make selectors stable
5. **Handle timing**: Use waitForSelector
6. **Debug with headed mode**: See what's happening
7. **Iterate**: Test → Fail → Fix → Test

---

## 📖 Resources

- [Playwright Docs](https://playwright.dev)
- [Chrome Extension Testing](https://playwright.dev/docs/chrome-extensions)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)

---

## 🎉 You're Ready!

Start with the smoke test above, then gradually add more complex scenarios. The tests will give Cursor AI complete visibility into the extension's behavior, logs, and errors!

