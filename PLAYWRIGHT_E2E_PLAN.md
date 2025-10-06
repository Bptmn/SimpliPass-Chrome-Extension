# 🎭 Playwright E2E Testing Plan - Chrome Extension

## 📊 Overview

Plan complet pour tester les fonctionnalités critiques de SimpliPass Chrome Extension en situation réelle avec Playwright.

**Philosophy:** Test real user workflows with real Chrome extension and real external services.

**Test Distribution:**
- **Phase 1 (Critical):** Authentication, basic CRUD, core functionality
- **Phase 2 (Advanced):** MFA, autofill, popover interactions
- **Phase 3 (Edge Cases):** Error handling, security scenarios

---

## 🚀 Phase 1: Core Functionality Tests (Week 1)

### 1.1 Extension Loading & Initialization

**Test File:** `packages/extension/__tests__/e2e/01-extension-loading.spec.ts`

**Tests to Implement:**
- [ ] `should load extension without errors`
- [ ] `should display popup correctly`
- [ ] `should initialize storage properly`
- [ ] `should handle extension updates`

**Success Criteria:**
- Extension loads in Chrome without errors
- Popup opens and displays correctly
- No console errors during initialization

---

### 1.2 Authentication Flow (Critical)

**Test File:** `packages/extension/__tests__/e2e/02-authentication.spec.ts`

**Tests to Implement:**
- [ ] `should show login page when not authenticated`
- [ ] `should login successfully with valid credentials`
- [ ] `should display home page after login`
- [ ] `should handle invalid credentials gracefully`
- [ ] `should logout successfully`
- [ ] `should redirect to login after logout`

**Success Criteria:**
- Complete login/logout flow works
- Error states are handled properly
- Navigation works correctly
- Real AWS Cognito integration

---

### 1.3 Basic CRUD Operations (Critical)

**Test File:** `packages/extension/__tests__/e2e/03-crud-operations.spec.ts`

**Tests to Implement:**

#### Credentials CRUD
- [ ] `should add new credential successfully`
- [ ] `should display credentials list`
- [ ] `should edit existing credential`
- [ ] `should delete credential`
- [ ] `should search credentials`

#### Bank Cards CRUD
- [ ] `should add new bank card successfully`
- [ ] `should display bank cards list`
- [ ] `should edit existing bank card`
- [ ] `should delete bank card`

#### Secure Notes CRUD
- [ ] `should add new secure note successfully`
- [ ] `should display secure notes list`
- [ ] `should edit existing secure note`
- [ ] `should delete secure note`

**Success Criteria:**
- All CRUD operations work with real Firestore
- Data persists across popup reopens
- Search and filtering work correctly
- Real encryption/decryption

---

### 1.4 Navigation & UI Flow

**Test File:** `packages/extension/__tests__/e2e/04-navigation.spec.ts`

**Tests to Implement:**
- [ ] `should navigate between categories (credentials, cards, notes)`
- [ ] `should navigate between pages correctly`
- [ ] `should handle back button functionality`
- [ ] `should maintain state across navigation`
- [ ] `should display loading states correctly`

**Success Criteria:**
- All navigation works smoothly
- State is maintained correctly
- Loading states are handled properly

---

## 🚀 Phase 2: Advanced Features (Week 2)

### 2.1 MFA Authentication

**Test File:** `packages/extension/__tests__/e2e/05-mfa-authentication.spec.ts`

**Tests to Implement:**
- [ ] `should handle MFA challenge after login`
- [ ] `should display MFA input field`
- [ ] `should validate MFA code correctly`
- [ ] `should complete login after MFA`
- [ ] `should handle invalid MFA code`

**Success Criteria:**
- MFA flow works with real AWS Cognito
- Error handling for invalid codes
- Proper state management during MFA

---

### 2.2 Password Generation

**Test File:** `packages/extension/__tests__/e2e/06-password-generation.spec.ts`

**Tests to Implement:**
- [ ] `should generate password with default settings`
- [ ] `should generate password with custom criteria`
- [ ] `should copy generated password to clipboard`
- [ ] `should save generated password to credential`

**Success Criteria:**
- Password generation works correctly
- Clipboard operations work
- Integration with credential creation

---

### 2.3 Autofill Detection & Popover

**Test File:** `packages/extension/__tests__/e2e/07-autofill-detection.spec.ts`

**Tests to Implement:**
- [ ] `should detect login forms on websites`
- [ ] `should show popover on detected forms`
- [ ] `should display matching credentials in popover`
- [ ] `should filter credentials by domain`
- [ ] `should handle multiple forms on same page`

**Success Criteria:**
- Real website form detection
- Popover appears correctly
- Content script integration works
- Real Chrome extension APIs

---

### 2.4 Credential Injection

**Test File:** `packages/extension/__tests__/e2e/08-credential-injection.spec.ts`

**Tests to Implement:**
- [ ] `should inject username and password into form`
- [ ] `should handle different input types (email, text, password)`
- [ ] `should work with various form structures`
- [ ] `should handle form submission after injection`
- [ ] `should log injection events`

**Success Criteria:**
- Real form filling works
- Various website compatibility
- Proper event logging
- Security considerations

---

## 🚀 Phase 3: Advanced Scenarios (Week 3)

### 3.1 Security & Error Handling

**Test File:** `packages/extension/__tests__/e2e/09-security-scenarios.spec.ts`

**Tests to Implement:**
- [ ] `should handle decryption errors gracefully`
- [ ] `should lock extension after timeout`
- [ ] `should require re-authentication when locked`
- [ ] `should handle network errors during sync`
- [ ] `should validate secure contexts (HTTPS only)`

**Success Criteria:**
- Security measures work correctly
- Error states are handled properly
- User experience remains smooth

---

### 3.2 Cross-Tab Synchronization

**Test File:** `packages/extension/__tests__/e2e/10-cross-tab-sync.spec.ts`

**Tests to Implement:**
- [ ] `should sync data across multiple tabs`
- [ ] `should update UI when data changes in another tab`
- [ ] `should handle concurrent modifications`
- [ ] `should resolve conflicts correctly`

**Success Criteria:**
- Real-time synchronization works
- Conflict resolution is handled
- Performance remains good

---

### 3.3 Performance & Stress Testing

**Test File:** `packages/extension/__tests__/e2e/11-performance.spec.ts`

**Tests to Implement:**
- [ ] `should handle large number of credentials (1000+)`
- [ ] `should perform well with slow network`
- [ ] `should handle rapid user interactions`
- [ ] `should maintain responsiveness during sync`

**Success Criteria:**
- Performance remains acceptable
- No memory leaks
- Smooth user experience

---

## 🛠️ Test Infrastructure Setup

### Configuration Files

**File:** `packages/extension/__tests__/e2e/config/test.config.ts`
```typescript
export const TEST_CONFIG = {
  credentials: {
    validUser: {
      email: process.env.TEST_USER_EMAIL || 'test@simplipass.com',
      password: process.env.TEST_USER_PASSWORD || 'TestPass123!',
    },
    mfaUser: {
      email: process.env.TEST_MFA_USER_EMAIL || 'mfa@simplipass.com',
      password: process.env.TEST_MFA_USER_PASSWORD || 'MfaPass123!',
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
    autofill: 15000,
  },
  testSites: {
    loginForm: 'https://example.com/login',
    signupForm: 'https://example.com/signup',
    complexForm: 'https://example.com/contact',
  },
};
```

### Helper Functions

**File:** `packages/extension/__tests__/e2e/helpers/extensionHelpers.ts`
```typescript
export async function loadExtension(context: BrowserContext): Promise<string>;
export async function openPopup(context: BrowserContext, extensionId: string): Promise<Page>;
export async function loginToExtension(popup: Page, email: string, password: string): Promise<void>;
export async function waitForHomePage(popup: Page): Promise<void>;
export async function addTestCredential(popup: Page, title: string, username: string, password: string): Promise<void>;
export async function navigateToWebsite(page: Page, url: string): Promise<void>;
export async function detectLoginForm(page: Page): Promise<boolean>;
export async function triggerAutofill(page: Page): Promise<void>;
```

### Test Data Management

**File:** `packages/extension/__tests__/e2e/helpers/testData.ts`
```typescript
export const TEST_CREDENTIALS = {
  google: { title: 'Google', username: 'test@gmail.com', password: 'GooglePass123!' },
  facebook: { title: 'Facebook', username: 'test@facebook.com', password: 'FbPass123!' },
  github: { title: 'GitHub', username: 'testuser', password: 'GitHubPass123!' },
};

export const TEST_BANK_CARDS = {
  visa: { title: 'Visa Card', number: '4111111111111111', expiry: '12/25', cvv: '123' },
  mastercard: { title: 'Mastercard', number: '5555555555554444', expiry: '06/26', cvv: '456' },
};

export const TEST_SECURE_NOTES = {
  personal: { title: 'Personal Info', content: 'My personal information...' },
  work: { title: 'Work Notes', content: 'Important work details...' },
};
```

---

## 📊 Test Execution Strategy

### Development Workflow

1. **Build Extension First**
   ```bash
   npm run build:extension
   ```

2. **Run Specific Test Suite**
   ```bash
   # Phase 1: Core functionality
   npx playwright test packages/extension/__tests__/e2e/01-extension-loading.spec.ts
   npx playwright test packages/extension/__tests__/e2e/02-authentication.spec.ts
   npx playwright test packages/extension/__tests__/e2e/03-crud-operations.spec.ts
   npx playwright test packages/extension/__tests__/e2e/04-navigation.spec.ts
   
   # Phase 2: Advanced features
   npx playwright test packages/extension/__tests__/e2e/05-mfa-authentication.spec.ts
   npx playwright test packages/extension/__tests__/e2e/06-password-generation.spec.ts
   npx playwright test packages/extension/__tests__/e2e/07-autofill-detection.spec.ts
   npx playwright test packages/extension/__tests__/e2e/08-credential-injection.spec.ts
   
   # Phase 3: Advanced scenarios
   npx playwright test packages/extension/__tests__/e2e/09-security-scenarios.spec.ts
   npx playwright test packages/extension/__tests__/e2e/10-cross-tab-sync.spec.ts
   npx playwright test packages/extension/__tests__/e2e/11-performance.spec.ts
   ```

3. **Run All E2E Tests**
   ```bash
   npm run test:e2e
   ```

### Debug Mode

```bash
# Debug specific test
npx playwright test packages/extension/__tests__/e2e/02-authentication.spec.ts --debug

# Run with UI
npx playwright test --ui

# Run headed mode (see browser)
npx playwright test --headed
```

---

## 🎯 Success Criteria

### Phase 1 (Core) - Week 1
- [ ] Extension loads without errors
- [ ] Authentication flow works completely
- [ ] Basic CRUD operations work with real data
- [ ] Navigation is smooth and reliable

### Phase 2 (Advanced) - Week 2
- [ ] MFA authentication works
- [ ] Password generation is functional
- [ ] Autofill detection works on real websites
- [ ] Credential injection works correctly

### Phase 3 (Edge Cases) - Week 3
- [ ] Security scenarios are handled properly
- [ ] Cross-tab synchronization works
- [ ] Performance is acceptable under load
- [ ] All edge cases are covered

---

## 🔄 Iteration Process

After each phase:
1. Run all tests: `npm run test:e2e`
2. Check for failures and fix issues
3. Verify real external services work
4. Update test data if needed
5. Document any issues or improvements

---

## 📝 Test Naming Convention

- ✅ `should load extension without errors`
- ✅ `should login successfully with valid credentials`
- ✅ `should add new credential successfully`
- ✅ `should detect login forms on websites`
- ✅ `should inject username and password into form`
- ❌ `test login` (too vague)
- ❌ `checkExtension` (not descriptive)

---

## 🎭 Key Takeaways

1. **Real Chrome Extension Environment** - Test actual extension behavior
2. **Real External Services** - Use real Firebase, Cognito, Chrome APIs
3. **Real User Workflows** - Test complete user journeys
4. **Progressive Complexity** - Start simple, add complexity gradually
5. **Comprehensive Coverage** - Cover all critical password manager features

**Remember**: These tests validate the complete user experience with real services! 🎯
