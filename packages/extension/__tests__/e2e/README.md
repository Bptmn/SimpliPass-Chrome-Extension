# 🎭 Playwright E2E Tests for SimpliPass Chrome Extension

## 📊 Overview

This directory contains End-to-End tests for the SimpliPass Chrome Extension using Playwright. These tests validate real user workflows with real Chrome extension and real external services.

## 🚀 Quick Start

### Prerequisites

1. **Build the extension first:**
   ```bash
   npm run build:extension
   ```

2. **Install Playwright browsers:**
   ```bash
   npx playwright install chromium
   ```

3. **Set up environment variables:**
   ```bash
   # Copy .env.example to .env and fill in your test credentials
   cp .env.example .env
   ```

### Running Tests

#### Run All E2E Tests
```bash
npm run test:e2e
```

#### Run Specific Test Suite
```bash
# Extension loading tests
npx playwright test packages/extension/__tests__/e2e/01-extension-loading.spec.ts

# Authentication tests
npx playwright test packages/extension/__tests__/e2e/02-authentication.spec.ts

# CRUD operations tests
npx playwright test packages/extension/__tests__/e2e/03-crud-operations.spec.ts
```

#### Debug Mode
```bash
# Run with browser visible (headed mode)
npx playwright test --headed

# Debug specific test
npx playwright test packages/extension/__tests__/e2e/02-authentication.spec.ts --debug

# Run with UI (interactive)
npx playwright test --ui
```

## 📁 Test Structure

```
packages/extension/__tests__/e2e/
├── helpers/
│   ├── extensionContext.ts    # Playwright fixtures for extension
│   ├── extensionHelpers.ts    # Utility functions for extension testing
│   └── testData.ts            # Test data and constants
├── config/
│   └── test.config.ts         # Test configuration
├── 01-extension-loading.spec.ts
├── 02-authentication.spec.ts
├── 03-crud-operations.spec.ts
├── 04-navigation.spec.ts
├── 05-mfa-authentication.spec.ts
├── 06-password-generation.spec.ts
├── 07-autofill-detection.spec.ts
├── 08-credential-injection.spec.ts
├── 09-security-scenarios.spec.ts
├── 10-cross-tab-sync.spec.ts
├── 11-performance.spec.ts
├── run-tests.sh              # Test runner script
└── README.md                 # This file
```

## 🧪 Test Categories

### Phase 1: Core Functionality (Week 1)
- **Extension Loading** - Basic extension initialization
- **Authentication** - Login/logout with real AWS Cognito
- **CRUD Operations** - Create, read, update, delete items
- **Navigation** - UI navigation and state management

### Phase 2: Advanced Features (Week 2)
- **MFA Authentication** - Multi-factor authentication flow
- **Password Generation** - Password generator functionality
- **Autofill Detection** - Website form detection
- **Credential Injection** - Real form filling

### Phase 3: Edge Cases (Week 3)
- **Security Scenarios** - Error handling and security
- **Cross-Tab Sync** - Multi-tab synchronization
- **Performance** - Load testing and optimization

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Test user credentials
TEST_USER_EMAIL=test@simplipass.com
TEST_USER_PASSWORD=TestPass123!

# MFA user credentials
TEST_MFA_USER_EMAIL=mfa@simplipass.com
TEST_MFA_USER_PASSWORD=MfaPass123!
TEST_MFA_CODE=123456

# Browser settings
HEADLESS=false
SLOWMO=100
```

### Test Configuration

The test configuration is in `config/test.config.ts`:

```typescript
export const TEST_CONFIG = {
  credentials: {
    validUser: {
      email: process.env.TEST_USER_EMAIL || 'test@simplipass.com',
      password: process.env.TEST_USER_PASSWORD || 'TestPass123!',
    },
  },
  browser: {
    headless: process.env.HEADLESS === 'true',
    slowMo: parseInt(process.env.SLOWMO || '0', 10),
  },
  timeouts: {
    default: 10000,
    navigation: 20000,
    authentication: 30000,
  },
};
```

## 🛠️ Helper Functions

### Extension Helpers

```typescript
import { 
  loadExtension, 
  openPopup, 
  loginToExtension, 
  waitForHomePage,
  addTestCredential,
  logoutFromExtension 
} from './helpers/extensionHelpers';

// Load extension and get ID
const extensionId = await loadExtension(context);

// Open popup
const popup = await openPopup(context, extensionId);

// Login
await loginToExtension(popup, email, password);

// Wait for home page
await waitForHomePage(popup);
```

### Test Data

```typescript
import { TEST_CREDENTIALS, TEST_BANK_CARDS, TEST_SECURE_NOTES } from './helpers/testData';

// Use predefined test data
const credential = TEST_CREDENTIALS.google;

// Generate unique test data
const uniqueData = generateUniqueTestData();
```

## 🎯 Writing New Tests

### Test Structure

```typescript
import { test, expect } from './helpers/extensionContext';
import { openPopup, loginToExtension } from './helpers/extensionHelpers';

test.describe('Feature Name', () => {
  test('should do specific thing', async ({ context, extensionId }) => {
    // Arrange: Setup test data and state
    const popup = await openPopup(context, extensionId);
    await loginToExtension(popup, email, password);
    
    // Act: Perform the action
    await popup.click('[data-testid="some-button"]');
    
    // Assert: Verify the result
    await expect(popup.locator('[data-testid="result"]')).toBeVisible();
  });
});
```

### Best Practices

1. **Use data-testid attributes** for reliable element selection
2. **Monitor console logs** for debugging
3. **Handle async operations** with proper waits
4. **Clean up after tests** (close popups, clear data)
5. **Use real test data** that matches your app's requirements

## 🐛 Debugging

### Console Monitoring

```typescript
import { setupConsoleMonitoring } from './helpers/extensionHelpers';

const { logs, errors } = setupConsoleMonitoring(popup);

// Check for errors
const unexpectedErrors = errors.filter(error => 
  !error.includes('DevTools') && 
  !error.includes('Extension')
);

expect(unexpectedErrors).toHaveLength(0);
```

### Screenshots

```typescript
import { takeDebugScreenshot } from './helpers/extensionHelpers';

// Take screenshot for debugging
await takeDebugScreenshot(popup, 'login-page');
```

### Debug Mode

```bash
# Run with browser visible
npx playwright test --headed

# Debug specific test
npx playwright test path/to/test.spec.ts --debug

# Run with UI
npx playwright test --ui
```

## 📊 Test Reports

After running tests, view the report:

```bash
npx playwright show-report
```

The report includes:
- Test results and timing
- Screenshots of failures
- Video recordings
- Console logs
- Network requests

## 🚨 Troubleshooting

### Common Issues

1. **Extension not loading:**
   - Ensure extension is built: `npm run build:extension`
   - Check manifest.json exists in dist/
   - Verify extension path in test configuration

2. **Authentication failures:**
   - Check test credentials in .env file
   - Verify AWS Cognito configuration
   - Ensure test user exists in Cognito

3. **Element not found:**
   - Check data-testid attributes in components
   - Verify element is visible and not hidden
   - Increase timeout if needed

4. **Tests timing out:**
   - Check network connectivity
   - Verify external services are accessible
   - Increase timeout values in configuration

### Getting Help

1. Check the test report for detailed error information
2. Run tests in debug mode to see browser behavior
3. Check console logs for JavaScript errors
4. Verify extension builds without errors

## 🎉 Success Criteria

- All tests pass consistently
- No console errors in test output
- Real external services work correctly
- Extension functionality is validated end-to-end
- Performance is acceptable

---

**Remember**: These tests validate the complete user experience with real Chrome extension and real external services! 🎯