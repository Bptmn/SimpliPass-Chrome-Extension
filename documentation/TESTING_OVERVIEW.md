# SimpliPass Testing Strategy

## Overview

SimpliPass follows a pragmatic testing approach optimized for a Chrome extension with clean separation between UI and business logic.

## 🎯 Testing Philosophy

- **Focus on Business Logic**: Test what matters most - services, adapters, and critical utilities
- **Minimal UI Testing**: Test behavior over visuals, avoid testing implementation details
- **Fast & Reliable**: Keep tests deterministic and focused on core functionality
- **Architecture-Aligned**: Test each layer appropriately (Hooks → Services → Adapters/Libraries)

## 📊 Current Status

- **Extension Build**: ✅ Working
- **Unit Tests**: ✅ Core services and utilities covered
- **Integration Tests**: ✅ Extension contexts with Chrome APIs mocked
- **Component Tests**: ✅ DOM components using React Testing Library

## 🏗️ Test Structure

### Directory Organization
```
packages/
├── common/
│   ├── core/
│   │   ├── adapters/__tests__/          # Adapter tests
│   │   ├── libraries/__tests__/         # Library tests
│   │   └── services/__tests__/          # Service tests
│   ├── hooks/__tests__/                 # Hook tests
│   └── utils/__tests__/                 # Utility tests
├── extension/
│   └── __tests__/                       # Extension integration tests
└── shared/
    └── utils/__tests__/                 # Shared utility tests
```

### Test Commands
```bash
# Run all tests
npm test

# Run extension-specific tests
npm run test:extension

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## ✅ What We Test

### High Priority (Business Logic)
- **Services**: Crypto, validation, form transformation, items management
- **Adapters**: Platform storage, database operations
- **Utilities**: Password generation, validation, formatting, encryption
- **Hooks**: Form state, clipboard operations, password visibility

### Medium Priority (Integration)
- **Extension Contexts**: Background messaging, content script autofill
- **Chrome APIs**: Storage, messaging, context menus (mocked)
- **Error Handling**: Service error propagation and UI error boundaries

### Low Priority (UI)
- **Components**: Critical interactions and accessibility
- **Pages**: Navigation and form submission flows
- **Popovers**: Autofill and credential management UI

## ❌ What We Don't Test

### Excluded (Low Value)
- **Simple UI Rendering**: Basic text display, icon components
- **Platform Configuration**: Environment variable loading
- **Third-Party Library Behavior**: Testing that mocks are called correctly
- **Trivial State Management**: Simple boolean toggles

## 🧪 Testing Tools & Setup

### Core Tools
- **Jest**: Test runner and assertion library
- **React Testing Library**: DOM component testing
- **jsdom**: DOM environment for tests
- **Chrome API Mocks**: Extension-specific mocking

### Test Environment
- **Node.js Environment**: For unit tests
- **DOM Environment**: For component tests
- **Mocked Chrome APIs**: For extension integration tests
- **Crypto Polyfills**: WebCrypto for Node.js environment

## 🔧 Test Configuration

### Jest Setup
- **Config**: `configs/test/jest.config.js`
- **Setup**: `configs/test/jest.setup.js`
- **Environment**: jsdom for DOM testing
- **Mocks**: Chrome APIs, crypto, import.meta.env

### Coverage
- **Target**: Business logic and critical utilities
- **Exclude**: UI components, test files, build artifacts
- **Reports**: Text, LCOV, HTML formats

## 🚀 Best Practices

### Do Test
1. **Business Logic**: Core algorithms, validation, transformations
2. **Error Handling**: How your app handles failures
3. **User Interactions**: Critical user flows
4. **Data Transformations**: Converting between formats
5. **Security Logic**: Encryption, validation, authentication

### Don't Test
1. **Platform Configuration**: Testing mocked configs
2. **Simple UI Rendering**: Just displaying text/icons
3. **Third-Party Library Behavior**: Testing mocks of external libraries
4. **Trivial State Management**: Simple boolean toggles
5. **Adapter/Service Calls**: Testing that mocks are called correctly

## 📈 Future Improvements

### Short Term
- Fix remaining test failures (timer issues, security service tests)
- Add comprehensive unit tests for extension services
- Improve error boundary testing

### Medium Term
- Add E2E tests with Playwright for critical flows
- Expand component test coverage for accessibility
- Add performance testing for crypto operations

### Long Term
- Add visual regression testing for UI components
- Implement automated security testing
- Add load testing for extension performance

## 🎯 Success Metrics

- **Test Coverage**: >80% for business logic
- **Test Speed**: <30 seconds for full suite
- **Reliability**: 100% pass rate on CI
- **Maintainability**: Clear, focused tests that are easy to understand

This testing strategy ensures we focus on what matters most while maintaining a fast, reliable test suite that supports confident development and deployment.