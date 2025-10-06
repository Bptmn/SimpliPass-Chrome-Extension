# SimpliPass Testing Overview

## 📊 Current Test Status

### Test Types
- **Unit Tests (Jest)**: ✅ Core services and utilities
- **Integration Tests (Jest + RTL)**: ✅ DOM components and hooks
- **E2E Tests (Playwright)**: ✅ Critical user flows with real APIs

### Test Commands
```bash
# Run all tests
npm test

# Run extension-specific tests
npm run test:extension

# Run E2E tests
npm run test:e2e

# Run all tests (unit + E2E)
npm run test:all
```

## 📁 Test Structure

```
packages/
├── common/
│   ├── core/
│   │   ├── adapters/__tests__/          # Adapter tests
│   │   ├── libraries/__tests__/         # Library tests
│   │   └── services/__tests__/          # Service tests
│   ├── hooks/__tests__/                 # Hook tests
│   ├── ui/components/__tests__/         # Component tests
│   └── utils/__tests__/                 # Utility tests
└── extension/
    └── __tests__/
        ├── e2e/                         # Playwright E2E tests
        └── *.test.ts(x)                 # Integration tests
```

## ✅ What We Test

### High Priority (Business Logic)
- **Services**: Crypto, validation, form transformation, items management
- **Utilities**: Password generation, validation, formatting, encryption
- **Hooks**: Form state, clipboard operations, password visibility

### Medium Priority (Integration)
- **Extension Contexts**: Background messaging, content script autofill
- **Components**: Critical interactions and accessibility

### E2E (Critical Flows)
- Extension initialization
- User authentication (login/logout)
- Complete user flows with real Firebase/Cognito

## ❌ What We Don't Test

- Simple UI rendering (basic text display, icons)
- Platform configuration (environment variables)
- Third-party library behavior
- Mocked API calls (use real APIs in E2E instead)

## 🎯 Testing Strategy

**See `.cursor/rules/testing-strategy-rules.mdc` for complete guidelines**

- **60% Unit Tests** (Jest) - Pure logic and functions
- **20% Integration Tests** (Jest + RTL) - Components and hooks
- **20% E2E Tests** (Playwright) - Complete flows with real services

## 🚀 Running Tests

### Development Workflow
```bash
# 1. Build extension (required for E2E)
npm run build:extension

# 2. Run unit tests (fast feedback)
npm run test:extension

# 3. Run E2E tests (real browser)
npm run test:e2e

# 4. Run all tests before PR
npm run test:all
```

### Test Configuration
- **Jest Config**: `configs/test/jest.config.js`
- **Playwright Config**: `configs/playwright/playwright.config.ts`
- **Test Setup**: `configs/test/jest.setup.js`

## 📈 Success Metrics

- ✅ Test Coverage: >80% for business logic
- ✅ Test Speed: <30 seconds for Jest suite
- ✅ E2E Reliability: 100% pass rate
- ✅ Maintainability: Clear, focused tests

## 🎓 Best Practices

### Do Test
1. Business logic and critical algorithms
2. Error handling and edge cases
3. User interactions and accessibility
4. Security logic (encryption, validation, authentication)

### Don't Test
1. Mocked APIs (use real APIs in E2E)
2. Simple UI rendering
3. Third-party library behavior
4. Trivial state management

---

**For detailed testing rules and decision trees, see:**
- `.cursor/rules/testing-strategy-rules.mdc`
- `.cursor/rules/playwright-testing-rules.mdc`
