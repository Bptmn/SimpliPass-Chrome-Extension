# 🔐 Authentication Module

The authentication module provides platform-agnostic authentication services for SimpliPass, supporting both mobile and Chrome extension platforms through a unified interface.

## 📁 Structure

```
auth/
├── __tests__/           # Authentication tests
├── cognito.ts          # AWS Cognito authentication service
├── firebase.ts         # Firebase authentication service
└── config.ts           # Platform-agnostic configuration
```

## 🏗️ Architecture

### Platform-Agnostic Design

The authentication module follows the **Single Source of Truth** principle and is designed to work seamlessly across platforms:

- **Mobile**: Uses Expo SecureStore for keychain access
- **Extension**: Uses Chrome storage with encryption
- **Shared**: Common authentication logic and interfaces

### Service Layer Pattern

Each authentication service (`cognito.ts`, `firebase.ts`) provides:
- Low-level API calls
- Platform-specific initialization
- Error handling and logging
- Mock support for testing

## 🔧 Services

### AWS Cognito (`cognito.ts`)

Handles AWS Cognito authentication operations:

```typescript
// Initialize Cognito
await initCognito();

// Login with email/password
const result = await loginWithCognito(email, password);

// Confirm MFA
await confirmMfaWithCognito(code);

// Get user attributes
const attributes = await fetchUserAttributesCognito();

// Get user salt for key derivation
const salt = await fetchUserSaltCognito();

// Sign out
await signOutCognito();

// Get tokens for Firebase
const { idToken, firebaseToken } = await getCognitoTokensAndFirebaseToken();
```

### Firebase (`firebase.ts`)

Handles Firebase authentication and database operations:

```typescript
// Initialize Firebase
const { auth, db } = await initFirebase();

// Sign in with custom token
await signInWithFirebaseToken(token);

// Sign out
await signOutFromFirebase();
```

**Features:**
- Automatic persistence configuration
- Storybook mock support
- Platform-specific initialization
- Error handling and logging

### Configuration (`config.ts`)

Provides platform-agnostic configuration loading:

```typescript
// Get platform-specific configs
import { firebaseConfig, cognitoConfig } from './config';

// Validate configurations
import { validateFirebaseConfig, validateCognitoConfig } from './config';
```

## 🔒 Security Features

### Zero-Knowledge Architecture
- No decrypted data is ever persisted
- All encryption/decryption handled via platform adapters
- Keys stored in platform-specific secure storage

### Platform Security
- **Mobile**: iOS Keychain / Android Keystore
- **Extension**: Encrypted with device fingerprint
- **Memory**: All decrypted data is ephemeral

## 🧪 Testing

### Test Structure
```
__tests__/
├── auth.integration.test.ts  # Integration tests
└── cognito.test.ts          # Unit tests
```

### Mock Support
- Storybook environment detection
- Firebase mock initialization
- Cognito mock responses
- Platform adapter mocking

## 📋 Usage Examples

### Basic Authentication Flow

```typescript
import { initCognito, loginWithCognito } from './cognito';
import { initFirebase, signInWithFirebaseToken } from './firebase';

// 1. Initialize services
await initCognito();
const { auth, db } = await initFirebase();

// 2. Login with Cognito
const cognitoResult = await loginWithCognito(email, password);

// 3. Get tokens for Firebase
const { idToken, firebaseToken } = await getCognitoTokensAndFirebaseToken();

// 4. Sign in to Firebase
await signInWithFirebaseToken(firebaseToken);
```

### MFA Flow

```typescript
import { confirmMfaWithCognito } from './cognito';

// After initial login returns MFA required
const mfaResult = await confirmMfaWithCognito(mfaCode);
```

### Error Handling

```typescript
try {
  const result = await loginWithCognito(email, password);
  // Handle success
} catch (error) {
  if (error.name === 'NotAuthorizedException') {
    // Handle invalid credentials
  } else if (error.name === 'UserNotConfirmedException') {
    // Handle unconfirmed user
  } else {
    // Handle other errors
  }
}
```

## 🔧 Configuration

### Environment Variables

The module automatically detects the platform and loads appropriate configurations:

- **Mobile**: Uses Expo SecureStore configuration
- **Extension**: Uses Chrome storage configuration
- **Development**: Uses mock configurations for testing

### Platform Detection

```typescript
// Automatic platform detection
const config = await getCognitoConfig(); // Returns platform-specific config
```

## 🚀 Integration

### With Platform Adapters

The auth module integrates with platform adapters for secure storage:

```typescript
import { getPlatformAdapter } from '../adapters/adapter.factory';

const adapter = await getPlatformAdapter();
await adapter.storeUserSecretKey(derivedKey);
```

### With Unified Logic

The auth module is consumed by the unified logic layer:

```typescript
import { unifiedLogin } from '../logic/unified';

const result = await unifiedLogin(email, password);
```

## 📝 Best Practices

### 1. Always Use Platform Adapters
```typescript
// ✅ Good - Uses platform adapter
const adapter = await getPlatformAdapter();
await adapter.storeUserSecretKey(key);

// ❌ Bad - Direct platform access
localStorage.setItem('key', value);
```

### 2. Handle Errors Gracefully
```typescript
// ✅ Good - Comprehensive error handling
try {
  const result = await loginWithCognito(email, password);
} catch (error) {
  console.error('Login failed:', error);
  // Handle specific error types
}
```

### 3. Use Mock Support for Testing
```typescript
// ✅ Good - Mock support for testing
if (isStorybook) {
  // Use mock implementations
}
```

### 4. Follow Security Principles
- Never persist decrypted data
- Always use secure storage for keys
- Clear sensitive data on logout
- Validate all inputs


## 📚 Related Documentation

- [Platform Adapters](../adapters/README.md)
- [Unified Logic](../logic/README.md)
- [State Management](../states/README.md)
- [Security Architecture](../../ARCHITECTURE.md) 