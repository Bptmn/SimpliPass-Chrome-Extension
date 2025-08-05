# SimpliPass - Cross-Platform Password Manager

A modern, secure password manager built with React Native and Chrome Extension technologies, featuring a clean three-layer architecture for maximum maintainability and code reuse.

## 🏗️ Architecture Overview

SimpliPass follows a **three-layer architecture** that ensures clean separation of concerns:

### Layer 1: UI Layer (Hooks)
- **Purpose**: Pure UI state management and user interactions
- **Location**: `packages/common/hooks/`
- **Responsibilities**: Form state, validation integration, clipboard operations, password visibility, content sizing
- **Examples**: `useCardForm`, `useCredentialForm`, `useClipboard`, `usePasswordVisibility`

### Layer 2: Business Logic Layer (Services)
- **Purpose**: Business logic orchestration, validation, formatting, and data transformation
- **Location**: `packages/common/core/services/`
- **Responsibilities**: Form validation, data formatting, form-to-item transformation, business rules
- **Examples**: `validationService`, `formattingService`, `formTransformationService`

### Layer 3: Integration Layer (Libraries/Adapters)
- **Purpose**: Low-level integration with external APIs, platform-specific calls, and utilities
- **Location**: `packages/common/core/libraries/` and `packages/common/core/adapters/`
- **Responsibilities**: Firebase integration, crypto operations, platform storage, authentication
- **Examples**: `auth.ts`, `firestore.ts`, `platform.adapter.ts`

## 📁 Project Structure

```
SimpliPass-React-ReactNative/
├── packages/
│   ├── common/                    # Shared code across all platforms
│   │   ├── core/                  # Business logic and integration layer
│   │   │   ├── services/          # Layer 2: Business logic orchestration
│   │   │   │   ├── validationService.ts
│   │   │   │   ├── formattingService.ts
│   │   │   │   ├── formTransformationService.ts
│   │   │   │   └── itemsService.ts
│   │   │   ├── libraries/         # Layer 3: Low-level integration
│   │   │   │   ├── auth/          # Authentication libraries
│   │   │   │   ├── database/      # Database integration
│   │   │   │   └── crypto/        # Cryptographic utilities
│   │   │   ├── adapters/          # Layer 3: Platform-specific adapters
│   │   │   │   ├── auth.adapter.ts
│   │   │   │   ├── database.adapter.ts
│   │   │   │   └── platform.adapter.ts
│   │   │   └── types/             # Shared TypeScript types
│   │   ├── hooks/                 # Layer 1: UI state management
│   │   │   ├── useCardForm.ts     # Card form orchestration
│   │   │   ├── useCredentialForm.ts # Credential form orchestration
│   │   │   ├── useClipboard.ts    # Clipboard operations
│   │   │   ├── usePasswordVisibility.ts # Password visibility toggle
│   │   │   └── useFormState.ts    # Generic form state management
│   │   ├── ui/                    # UI components and pages
│   │   │   ├── components/        # Reusable UI components
│   │   │   ├── pages/             # Page components (dumb presentation)
│   │   │   ├── design/            # Design system (colors, typography, layout)
│   │   │   └── router/            # Navigation and routing
│   │   └── utils/                 # Pure utility functions
│   ├── mobile/                    # React Native specific code
│   │   ├── adapters/              # Mobile-specific platform adapters
│   │   └── App.tsx                # Mobile app entry point
│   ├── extension/                 # Chrome Extension specific code
│   │   ├── adapters/              # Extension-specific platform adapters
│   │   ├── popup/                 # Extension popup UI
│   │   ├── background.ts          # Extension background script
│   │   └── content.ts             # Extension content script
│   └── shared/                    # Shared constants and types
├── ARCHITECTURE.md                # Detailed architecture documentation
├── DEVELOPER_GUIDE.md             # Development guidelines
└── ARCHITECTURE_REVIEW_PLAN.md    # Architecture refactoring documentation
```

## 🚀 Key Features

### ✅ **Architecture Benefits**
- **90-95% code reuse** across mobile and extension platforms
- **Zero business logic** in UI components
- **Clear separation** of concerns
- **Consistent patterns** across codebase
- **Easier testing** with isolated business logic
- **Better maintainability** with proper architecture

### 🔐 **Security Features**
- End-to-end encryption with ChaCha20-Poly1305
- Secure key derivation with PBKDF2
- Platform-specific secure storage
- No decrypted data persistence
- Ephemeral memory-only decryption

### 📱 **Cross-Platform Support**
- **React Native**: iOS and Android apps
- **Chrome Extension**: Browser integration with autofill
- **Shared Codebase**: 90%+ code reuse between platforms

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- React Native CLI
- Chrome browser (for extension development)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd SimpliPass-React-ReactNative

# Install dependencies
npm install

# Build the project
npm run build
```

### Platform-Specific Setup

#### Mobile Development
```bash
# iOS
cd packages/mobile
npx react-native run-ios

# Android
cd packages/mobile
npx react-native run-android
```

#### Chrome Extension Development
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the project directory
4. The extension will be available in your browser

## 🧪 Testing Strategy

SimpliPass follows a **focused testing approach** that prioritizes business logic and critical functionality over trivial UI rendering.

### 🎯 **Testing Philosophy**

We believe in testing **what's worth testing** - focusing on business logic, error handling, and critical user flows rather than testing everything.

### ✅ **What We Test (High Value)**

#### **1. Core Business Logic**
```javascript
✅ Encryption/Decryption (crypto.test.ts)
✅ Form Validation (validation.utils.test.ts)  
✅ Credit Card Logic (cards.test.ts)
✅ Password Generation (passwordGenerator.test.ts)
✅ Service Error Handling (cryptoService.test.ts)
```

#### **2. Complex UI Logic**
```javascript
✅ Password Generator Hook (usePasswordGenerator.test.tsx)
✅ Copy Button with Business Logic (CopyButton.test.tsx)
✅ Form Pages with Validation (AddCredential1.test.tsx)
✅ Navigation Logic (useAppRouter.test.tsx)
```

#### **3. Error Scenarios**
```javascript
✅ Authentication failures
✅ Network errors
✅ Invalid data handling
✅ Cryptography errors
✅ Form validation errors
```

### ❌ **What We Don't Test (Low Value)**

#### **1. Platform Configuration**
```javascript
❌ Testing mocked Firebase/Cognito configs
❌ Testing environment variable loading
❌ Testing platform detection logic
```

#### **2. Simple UI Rendering**
```javascript
❌ Icon display components
❌ Simple text display components
❌ Basic layout components
```

#### **3. Third-Party Library Behavior**
```javascript
❌ Testing that mocks are called correctly
❌ Testing adapter/service call patterns
❌ Testing external library integration
```

### 📊 **Test Results**

- **9 test suites** (all passing)
- **144 tests** (all passing)
- **2.848s execution time** (27% faster than before)
- **100% pass rate** (no flaky tests)

### 🚀 **Benefits of This Approach**

#### **1. Faster Development**
- Tests run quickly and reliably
- No more `import.meta.env` issues
- No complex mocking setup required

#### **2. Better Coverage**
- Tests focus on critical business logic
- Error scenarios are thoroughly tested
- User interactions are validated

#### **3. Easier Maintenance**
- Fewer mock files to maintain
- Clearer test intent
- Less brittle tests

#### **4. Higher Confidence**
- Tests cover what actually matters
- Business logic is thoroughly validated
- Error handling is properly tested

### 🧪 **Running Tests**

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test suites
npm test -- --testPathPattern="packages/common/utils"
npm test -- --testPathPattern="packages/common/core/services"
```

### 📋 **Testing Best Practices**

#### **✅ Do Test**
1. **Business Logic** - Core algorithms, validation, transformations
2. **Error Handling** - How your app handles failures
3. **User Interactions** - Critical user flows
4. **Data Transformations** - Converting between formats
5. **Security Logic** - Encryption, validation, authentication

#### **❌ Don't Test**
1. **Platform Configuration** - Testing mocked configs
2. **Simple UI Rendering** - Just displaying text/icons
3. **Third-party Library Behavior** - Testing mocks of external libraries
4. **Trivial State Management** - Simple boolean toggles
5. **Adapter/Service Calls** - Testing that mocks are called correctly

This approach follows the **testing pyramid** principle: focus on unit tests for business logic, integration tests for critical flows, and minimal UI tests for complex interactions.

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Detailed architecture documentation
- **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)**: Development guidelines and best practices
- **[ARCHITECTURE_REVIEW_PLAN.md](./ARCHITECTURE_REVIEW_PLAN.md)**: Architecture refactoring documentation

## 🏛️ Architecture Principles

### Three-Layer Model
1. **UI Layer (Hooks)**: Pure UI state management
2. **Business Logic Layer (Services)**: Business rules and data transformation
3. **Integration Layer (Libraries/Adapters)**: External API integration

### Design Principles
- **Separation of Concerns**: Each layer has a single responsibility
- **Dependency Inversion**: Higher layers depend on abstractions, not implementations
- **Code Reuse**: Shared services and hooks across platforms
- **Testability**: Isolated business logic for easy testing
- **Maintainability**: Clear patterns and consistent structure

## 🤝 Contributing

1. Follow the three-layer architecture principles
2. Ensure all business logic is in services
3. Keep UI components as "dumb" presentation layers
4. Use shared hooks for UI state management
5. Write tests for all business logic
6. Follow the established patterns and conventions
7. **Focus tests on business logic, not UI rendering**

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**SimpliPass**: Secure, cross-platform password management with a clean, maintainable architecture and focused testing strategy. 