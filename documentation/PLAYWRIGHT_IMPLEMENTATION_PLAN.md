# Playwright E2E Testing Implementation Plan

## 🎯 Goal
Enable Cursor AI to independently develop, test, and iterate on the Chrome extension with real browser testing, log access, and behavior verification.

---

## 📋 Phase 1: Setup Playwright for Chrome Extension Testing

### 1.1 Install Dependencies
```bash
npm install --save-dev @playwright/test
npm install --save-dev playwright-chromium
npx playwright install chromium
```

### 1.2 Create Playwright Configuration
**File**: `configs/playwright/playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './packages/extension/__tests__/e2e',
  fullyParallel: false, // Sequential for extension tests
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // One worker for extension tests
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-results.json' }],
    ['list']
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    baseURL: 'chrome-extension://',
  },
  projects: [
    {
      name: 'chromium-extension',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome'
      },
    },
  ],
});
```

### 1.3 Create Extension Context Helper
**File**: `packages/extension/__tests__/e2e/helpers/extensionContext.ts`

```typescript
import { test as base, chromium, BrowserContext } from '@playwright/test';
import path from 'path';

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({}, use) => {
    const pathToExtension = path.join(__dirname, '../../../../dist');
    const context = await chromium.launchPersistentContext('', {
      headless: false, // Extensions require headed mode
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
        '--no-sandbox',
      ],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    // Get extension ID from service worker
    let [background] = context.serviceWorkers();
    if (!background) {
      background = await context.waitForEvent('serviceworker');
    }
    const extensionId = background.url().split('/')[2];
    await use(extensionId);
  },
});

export const expect = test.expect;
```

---

## 📋 Phase 2: Core Test Scenarios

### 2.1 Extension Loading and Initialization
**File**: `packages/extension/__tests__/e2e/01-initialization.spec.ts`

```typescript
import { test, expect } from './helpers/extensionContext';

test.describe('Extension Initialization', () => {
  test('should load extension successfully', async ({ context, extensionId }) => {
    expect(extensionId).toBeTruthy();
    expect(extensionId).toMatch(/^[a-z]{32}$/);
  });

  test('should open popup', async ({ context, extensionId }) => {
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    
    await expect(popup.locator('body')).toBeVisible();
    expect(await popup.title()).toBeTruthy();
  });

  test('should initialize without errors', async ({ context, extensionId, page }) => {
    const logs: string[] = [];
    const errors: string[] = [];
    
    page.on('console', msg => {
      logs.push(`${msg.type()}: ${msg.text()}`);
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.waitForLoadState('networkidle');
    
    // Check for initialization errors
    expect(errors.filter(e => !e.includes('DevTools'))).toHaveLength(0);
    
    // Log all console output for debugging
    console.log('Console logs:', logs);
  });
});
```

### 2.2 Authentication Flow
**File**: `packages/extension/__tests__/e2e/02-authentication.spec.ts`

```typescript
import { test, expect } from './helpers/extensionContext';

test.describe('Authentication Flow', () => {
  test('should show login page when not authenticated', async ({ context, extensionId }) => {
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    
    // Should show login form
    await expect(popup.locator('[data-testid="login-form"]')).toBeVisible();
    await expect(popup.locator('input[type="email"]')).toBeVisible();
    await expect(popup.locator('input[type="password"]')).toBeVisible();
  });

  test('should validate email format', async ({ context, extensionId }) => {
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    
    await popup.fill('input[type="email"]', 'invalid-email');
    await popup.fill('input[type="password"]', 'password123');
    await popup.click('button[type="submit"]');
    
    // Should show validation error
    await expect(popup.locator('[data-testid="error-message"]')).toContainText('email');
  });

  test('should login successfully with valid credentials', async ({ context, extensionId }) => {
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    
    // Fill in credentials
    await popup.fill('input[type="email"]', 'test@example.com');
    await popup.fill('input[type="password"]', 'ValidPassword123!');
    await popup.click('button[type="submit"]');
    
    // Should redirect to home page
    await expect(popup.locator('[data-testid="home-page"]')).toBeVisible({ timeout: 10000 });
  });
});
```

### 2.3 Autofill Functionality
**File**: `packages/extension/__tests__/e2e/03-autofill.spec.ts`

```typescript
import { test, expect } from './helpers/extensionContext';

test.describe('Autofill Functionality', () => {
  test.beforeEach(async ({ context, extensionId }) => {
    // Login first
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.fill('input[type="email"]', 'test@example.com');
    await popup.fill('input[type="password"]', 'ValidPassword123!');
    await popup.click('button[type="submit"]');
    await popup.waitForSelector('[data-testid="home-page"]');
    await popup.close();
  });

  test('should detect login form on website', async ({ context, extensionId }) => {
    const page = await context.newPage();
    await page.goto('https://example.com/login'); // Test login page
    
    // Look for autofill icon
    await page.waitForSelector('input[type="email"]');
    await page.click('input[type="email"]');
    
    // Extension should inject autofill UI
    await expect(page.locator('[data-simplipass-autofill]')).toBeVisible({ timeout: 5000 });
  });

  test('should autofill credentials when selected', async ({ context, extensionId }) => {
    const page = await context.newPage();
    await page.goto('https://example.com/login');
    
    await page.click('input[type="email"]');
    await page.waitForSelector('[data-simplipass-autofill]');
    
    // Select first credential
    await page.click('[data-testid="credential-item"]:first-child');
    
    // Fields should be filled
    const emailValue = await page.inputValue('input[type="email"]');
    const passwordValue = await page.inputValue('input[type="password"]');
    
    expect(emailValue).toBeTruthy();
    expect(passwordValue).toBeTruthy();
  });

  test('should show save credential prompt after successful login', async ({ context, extensionId }) => {
    const page = await context.newPage();
    await page.goto('https://example.com/login');
    
    // Fill credentials manually
    await page.fill('input[type="email"]', 'newuser@example.com');
    await page.fill('input[type="password"]', 'NewPassword123!');
    await page.click('button[type="submit"]');
    
    // Wait for navigation (successful login)
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    
    // Extension should show save prompt
    await expect(page.locator('[data-simplipass-save]')).toBeVisible({ timeout: 3000 });
  });
});
```

### 2.4 Password Generator
**File**: `packages/extension/__tests__/e2e/04-password-generator.spec.ts`

```typescript
import { test, expect } from './helpers/extensionContext';

test.describe('Password Generator', () => {
  test('should generate password with default options', async ({ context, extensionId }) => {
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html#/generator`);
    
    const passwordField = popup.locator('[data-testid="generated-password"]');
    const password = await passwordField.textContent();
    
    expect(password).toBeTruthy();
    expect(password!.length).toBeGreaterThanOrEqual(16);
  });

  test('should regenerate password on button click', async ({ context, extensionId }) => {
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html#/generator`);
    
    const passwordField = popup.locator('[data-testid="generated-password"]');
    const firstPassword = await passwordField.textContent();
    
    await popup.click('[data-testid="regenerate-button"]');
    await popup.waitForTimeout(100);
    
    const secondPassword = await passwordField.textContent();
    expect(secondPassword).not.toBe(firstPassword);
  });

  test('should respect password options', async ({ context, extensionId }) => {
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html#/generator`);
    
    // Disable symbols
    await popup.click('[data-testid="option-symbols"]');
    await popup.waitForTimeout(100);
    
    const password = await popup.locator('[data-testid="generated-password"]').textContent();
    
    // Should not contain symbols
    expect(password).not.toMatch(/[!@#$%^&*()]/);
  });

  test('should copy password to clipboard', async ({ context, extensionId }) => {
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html#/generator`);
    
    await popup.click('[data-testid="copy-button"]');
    
    // Should show success message
    await expect(popup.locator('[data-testid="copy-success"]')).toBeVisible();
  });
});
```

### 2.5 Security Tests
**File**: `packages/extension/__tests__/e2e/05-security.spec.ts`

```typescript
import { test, expect } from './helpers/extensionContext';

test.describe('Security Features', () => {
  test('should not autofill on insecure HTTP sites', async ({ context, extensionId }) => {
    const page = await context.newPage();
    await page.goto('http://insecure-site.com/login');
    
    await page.click('input[type="email"]');
    
    // Should show security warning instead of autofill
    await expect(page.locator('[data-simplipass-warning]')).toBeVisible();
  });

  test('should not autofill in cross-origin iframe', async ({ context, extensionId }) => {
    const page = await context.newPage();
    await page.goto('https://example.com/page-with-iframe');
    
    const frame = page.frameLocator('iframe[src*="different-domain"]');
    await frame.locator('input[type="email"]').click();
    
    // Should not show autofill in iframe
    const autofillVisible = await frame.locator('[data-simplipass-autofill]').isVisible().catch(() => false);
    expect(autofillVisible).toBe(false);
  });

  test('should sanitize input to prevent XSS', async ({ context, extensionId }) => {
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html#/add-credential`);
    
    // Try to inject script
    await popup.fill('input[name="username"]', '<script>alert("xss")</script>');
    await popup.fill('input[name="password"]', 'password123');
    await popup.click('button[type="submit"]');
    
    // Script should not execute, page should still be functional
    await expect(popup.locator('[data-testid="credentials-list"]')).toBeVisible();
  });
});
```

---

## 📋 Phase 3: Test Utilities and Helpers

### 3.1 Authentication Helper
**File**: `packages/extension/__tests__/e2e/helpers/auth.ts`

```typescript
import { Page, BrowserContext } from '@playwright/test';

export async function loginToExtension(
  context: BrowserContext,
  extensionId: string,
  email: string = 'test@example.com',
  password: string = 'ValidPassword123!'
) {
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  
  await popup.fill('input[type="email"]', email);
  await popup.fill('input[type="password"]', password);
  await popup.click('button[type="submit"]');
  
  await popup.waitForSelector('[data-testid="home-page"]', { timeout: 10000 });
  await popup.close();
}

export async function logoutFromExtension(
  context: BrowserContext,
  extensionId: string
) {
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  
  await popup.click('[data-testid="logout-button"]');
  await popup.waitForSelector('[data-testid="login-form"]');
  await popup.close();
}
```

### 3.2 Test Data Helper
**File**: `packages/extension/__tests__/e2e/helpers/testData.ts`

```typescript
export const testCredentials = {
  valid: {
    email: 'test@example.com',
    password: 'ValidPassword123!',
  },
  invalid: {
    email: 'invalid-email',
    password: '123',
  },
  new: {
    email: 'newuser@example.com',
    password: 'NewPassword456!',
  },
};

export const testUrls = {
  secure: 'https://example.com/login',
  insecure: 'http://insecure-site.com/login',
  withIframe: 'https://example.com/page-with-iframe',
};
```

### 3.3 Console Monitor Helper
**File**: `packages/extension/__tests__/e2e/helpers/console.ts`

```typescript
import { Page } from '@playwright/test';

export class ConsoleMonitor {
  private logs: Array<{ type: string; text: string; timestamp: number }> = [];
  private errors: string[] = [];
  private warnings: string[] = [];

  constructor(private page: Page) {
    this.setupListeners();
  }

  private setupListeners() {
    this.page.on('console', (msg) => {
      const log = {
        type: msg.type(),
        text: msg.text(),
        timestamp: Date.now(),
      };
      this.logs.push(log);

      if (msg.type() === 'error') {
        this.errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        this.warnings.push(msg.text());
      }
    });

    this.page.on('pageerror', (error) => {
      this.errors.push(`Page error: ${error.message}`);
    });
  }

  getLogs() {
    return this.logs;
  }

  getErrors() {
    return this.errors.filter(e => !e.includes('DevTools'));
  }

  getWarnings() {
    return this.warnings;
  }

  hasErrors() {
    return this.getErrors().length > 0;
  }

  printLogs() {
    console.log('=== Console Logs ===');
    this.logs.forEach(log => {
      console.log(`[${log.type}] ${log.text}`);
    });
  }

  printErrors() {
    console.log('=== Console Errors ===');
    this.getErrors().forEach(error => {
      console.error(error);
    });
  }
}
```

---

## 📋 Phase 4: NPM Scripts and CI Integration

### 4.1 Update package.json
```json
{
  "scripts": {
    "test:e2e": "playwright test --config=configs/playwright/playwright.config.ts",
    "test:e2e:ui": "playwright test --config=configs/playwright/playwright.config.ts --ui",
    "test:e2e:headed": "playwright test --config=configs/playwright/playwright.config.ts --headed",
    "test:e2e:debug": "playwright test --config=configs/playwright/playwright.config.ts --debug",
    "test:e2e:report": "playwright show-report playwright-report",
    "test:all": "npm run test:extension && npm run test:e2e"
  }
}
```

### 4.2 Create Test Workflow
**File**: `.github/workflows/e2e-tests.yml`

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build extension
        run: npm run build:extension
      
      - name: Install Playwright
        run: npx playwright install chromium
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 📋 Phase 5: Implementation Checklist

### Week 1: Setup and Basic Tests
- [ ] Install Playwright dependencies
- [ ] Create Playwright configuration
- [ ] Create extension context helper
- [ ] Implement initialization tests
- [ ] Verify extension loads correctly

### Week 2: Authentication and Core Features
- [ ] Implement authentication flow tests
- [ ] Create authentication helpers
- [ ] Test login/logout functionality
- [ ] Test error handling

### Week 3: Autofill Functionality
- [ ] Implement autofill detection tests
- [ ] Test credential selection
- [ ] Test save credential prompt
- [ ] Test autofill on various form types

### Week 4: Advanced Features
- [ ] Implement password generator tests
- [ ] Test security features
- [ ] Create console monitor helper
- [ ] Add test data helpers

### Week 5: CI/CD and Documentation
- [ ] Set up CI/CD workflow
- [ ] Add test scripts to package.json
- [ ] Document test patterns
- [ ] Create test maintenance guide

---

## 📊 Success Metrics

### Test Coverage Goals
- ✅ 100% of critical user flows covered
- ✅ All security features tested
- ✅ All UI interactions tested
- ✅ Error scenarios covered

### Performance Goals
- ✅ Test suite runs in < 5 minutes
- ✅ < 5% flaky tests
- ✅ Clear, actionable error messages
- ✅ Easy to debug with screenshots/videos

### Developer Experience Goals
- ✅ Easy to run locally (`npm run test:e2e`)
- ✅ Fast feedback loop
- ✅ Clear test reports
- ✅ Self-documenting tests

---

## 🤖 Benefits for Cursor AI

1. **Independent Testing**: Run real browser tests without human intervention
2. **Log Access**: Full access to console logs, errors, and warnings
3. **Visual Feedback**: Screenshots and videos of failures
4. **Iterative Development**: Test → Fix → Test cycle
5. **Confidence**: Verify actual behavior, not mocked behavior
6. **Regression Prevention**: Catch bugs before deployment

---

## 📝 Next Steps

1. **Review and approve this plan**
2. **Start with Phase 1 (Setup)**
3. **Implement tests incrementally**
4. **Iterate based on findings**
5. **Expand coverage as needed**

Would you like me to start implementing Phase 1?

