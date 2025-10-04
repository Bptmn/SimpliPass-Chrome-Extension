# E2E Tests for SimpliPass Chrome Extension

## Overview

End-to-end tests using Playwright to test the extension in a real Chrome browser environment.

## Structure

```
e2e/
├── config/
│   └── test.config.ts          # Central test configuration
├── helpers/
│   ├── extensionContext.ts     # Playwright fixture for loading extension
│   └── consoleMonitor.ts       # Console log capture and monitoring
├── 01-initialization.spec.ts   # Extension loading and initialization tests
├── 02-authentication.spec.ts   # Login/logout flow tests
└── README.md                   # This file
```

## Configuration

### Test Config File

All test settings are centralized in `config/test.config.ts`:

```typescript
TEST_CONFIG = {
  credentials: {
    validUser: { email, password },
    invalidUser: { email, password },
  },
  browser: { headless, slowMo },
  timeouts: { default, navigation, authentication, ... },
  selectors: { login, home, common },
  ...
}
```

### Environment Variables

You can override config values with environment variables:

```bash
# Test credentials
TEST_USER_EMAIL=test@simplipass.com
TEST_USER_PASSWORD=TestPass123!

# Browser behavior
HEADLESS=false
SLOWMO=100
```

## Running Tests

### Basic Commands

```bash
# Run all E2E tests (headed mode with browser visible)
npm run test:e2e

# Run in headless mode (no browser window)
npm run test:e2e:headless

# Run with slow motion (500ms delays)
npm run test:e2e:slow

# Run with custom slow motion
SLOWMO=800 npm run test:e2e

# Run specific test file
npx playwright test packages/extension/__tests__/e2e/02-authentication.spec.ts

# Run tests matching a pattern
npx playwright test --grep "login"
```

### Interactive/Debug Modes

```bash
# Playwright UI (interactive test runner)
npm run test:e2e:ui

# Debug mode (step through tests)
npm run test:e2e:debug

# View last test report
npm run test:e2e:report
```

## Test Credentials

**IMPORTANT**: Tests require a valid user account to exist in Firebase.

### Setting Up Test User

1. Create a user in the mobile app or Firebase console:
   - Email: `test@simplipass.com` (or set `TEST_USER_EMAIL`)
   - Password: `TestPass123!` (or set `TEST_USER_PASSWORD`)

2. The user must have:
   - Valid email/password authentication
   - Access to your Firebase project
   - No required 2FA (for automated testing)

### Using Environment Variables

Create a `.env` file in the project root:

```bash
TEST_USER_EMAIL=your-test@email.com
TEST_USER_PASSWORD=YourTestPassword123!
```

Or set them when running tests:

```bash
TEST_USER_EMAIL=test@email.com TEST_USER_PASSWORD=Pass123! npm run test:e2e
```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from './helpers/extensionContext';
import { createConsoleMonitor } from './helpers/consoleMonitor';
import { TEST_CONFIG, getPopupUrl } from './config/test.config';

test.describe('Feature Name', () => {
  test('should do something', async ({ context, extensionId }) => {
    // Create console monitor
    const popup = await context.newPage();
    const consoleMonitor = createConsoleMonitor(popup);
    
    // Navigate to popup
    await popup.goto(getPopupUrl(extensionId));
    await popup.waitForLoadState('networkidle');
    
    // Use selectors from config
    await popup.fill(TEST_CONFIG.selectors.login.emailInput, 'test@example.com');
    
    // Make assertions
    await expect(popup.locator('[data-testid="login-button"]')).toBeVisible();
    
    // Check console
    const errors = consoleMonitor.getUnexpectedErrors();
    expect(errors).toHaveLength(0);
    
    await popup.close();
  });
});
```

### Using Console Monitor

```typescript
const consoleMonitor = createConsoleMonitor(popup);

// Get all messages
consoleMonitor.getAllMessages();

// Get errors only
consoleMonitor.getErrors();

// Get unexpected errors (filtered)
consoleMonitor.getUnexpectedErrors();

// Check for specific message
consoleMonitor.hasMessage('Initialization complete');

// Wait for message
await consoleMonitor.waitForMessage('Login successful', 5000);

// Print for debugging
consoleMonitor.printAll();
consoleMonitor.printErrors();
consoleMonitor.printSummary();
```

### Using Test Config

```typescript
// Credentials
TEST_CONFIG.credentials.validUser.email
TEST_CONFIG.credentials.invalidUser.password

// Selectors
TEST_CONFIG.selectors.login.emailInput
TEST_CONFIG.selectors.home.page

// Timeouts
await popup.waitForSelector(selector, {
  timeout: TEST_CONFIG.timeouts.authentication
});

// URLs
await popup.goto(TEST_CONFIG.urls.loginPage);
```

## Test Requirements

### UI Requirements (data-testid attributes)

Tests rely on `data-testid` attributes for reliable element selection. Required attributes:

**Login Page:**
- `data-testid="email-input"`
- `data-testid="password-input"`
- `data-testid="login-button"`
- `data-testid="error-message"`
- `data-testid="error-banner"`
- `data-testid="password-toggle"` (optional)

**Home Page:**
- `data-testid="home-page"`
- `data-testid="logout-button"`
- `data-testid="credentials-list"`

**Common:**
- `data-testid="loading-spinner"`

### Before Running Tests

1. ✅ Build the extension:
   ```bash
   npm run build:extension
   ```

2. ✅ Ensure test user exists in Firebase

3. ✅ Set test credentials (via env vars or config)

4. ✅ Add required `data-testid` attributes to UI components

## Test Coverage

### Phase 1: Initialization ✅
- [x] Extension loads successfully
- [x] Service worker starts
- [x] Popup opens without errors
- [x] Manifest is valid

### Phase 2: Authentication (Current)
- [ ] Display login form
- [ ] Validate email format
- [ ] Handle invalid credentials
- [ ] Login with valid credentials
- [ ] Logout successfully
- [ ] Toggle password visibility

### Phase 3: Autofill (Next)
- [ ] Detect login forms
- [ ] Show credential picker
- [ ] Inject credentials
- [ ] Save new credentials

## Debugging

### Test Failures

1. **Check screenshots:**
   ```bash
   open test-results/
   ```

2. **View HTML report:**
   ```bash
   npm run test:e2e:report
   ```

3. **Run in headed mode to watch:**
   ```bash
   npm run test:e2e:slow
   ```

4. **Use debug mode:**
   ```bash
   npm run test:e2e:debug
   ```

5. **Check console output:**
   - Console logs are printed in test output
   - Look for `[ERROR]` messages

### Common Issues

**Service worker not found:**
- Ensure extension is built: `npm run build:extension`
- Check `dist/background.js` exists
- Verify manifest.json has service_worker entry

**Selector not found:**
- Check if `data-testid` attribute exists in component
- Use `popup.locator('[data-testid="..."]')` for debugging
- Run in slow mode to see what's on screen

**Test timeout:**
- Increase timeout in `TEST_CONFIG.timeouts`
- Check if Firebase is responding
- Verify test credentials are correct

**Login fails:**
- Verify test user exists in Firebase
- Check credentials in config or env vars
- Look for authentication errors in console

## CI/CD Integration

For continuous integration:

```yaml
# .github/workflows/e2e-tests.yml
- name: Build extension
  run: npm run build:extension

- name: Run E2E tests
  run: npm run test:e2e:headless
  env:
    TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
    TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
    HEADLESS: true
```

## Best Practices

1. **Always build first:**
   ```bash
   npm run build:extension && npm run test:e2e
   ```

2. **Use data-testid for selectors** - not classes or text content

3. **Monitor console output** - helps debug issues

4. **Clean up after tests** - close pages, clear state

5. **Use descriptive test names** - describe expected behavior

6. **Handle async properly** - await all actions and assertions

7. **Test both success and failure cases**

8. **Keep tests independent** - no shared state between tests

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Chrome Extensions Testing](https://playwright.dev/docs/chrome-extensions)
- [Test Configuration](./config/test.config.ts)
- [Console Monitor](./helpers/consoleMonitor.ts)
- [Extension Context](./helpers/extensionContext.ts)

