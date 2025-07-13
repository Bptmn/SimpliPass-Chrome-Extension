# 🧠 Business Logic Module

The business logic module is organized by domain (user, items, session, cryptography, etc.).

## 📁 Structure

```
logic/
├── __tests__/           # Comprehensive test suite
├── user.ts             # User management logic
├── items.ts            # Item operations (CRUD)
├── cryptography.ts     # Encryption/decryption logic
├── session.ts          # Session management logic
└── index.ts            # Module exports
```

## 🏗️ Architecture

### Domain-Driven Logic Pattern

The logic module follows a **Domain-Driven** pattern:

- **Single Interface per Domain**: All business operations go through domain-specific functions
- **Platform Agnostic**: No platform-specific code in business logic
- **Consistent Error Handling**: Standardized error responses
- **Type Safety**: Full TypeScript support with shared types

### Data Flow

```
UI Components → Domain Logic → Platform Adapters → Platform Services
     ↑              ↓              ↓                    ↓
   States ←─── State Updates ←─── Results ←─── Platform APIs
```

## 🔧 Core Modules

### Session Management (`session.ts`)

Handles session lifecycle and authentication state:

```typescript
// Create session
const sessionResult = await createSession(userSecretKey, {
  rememberMe: true,
  sessionTimeout: 7 * 24 * 60 * 60 * 1000 // 7 days
});

// Validate session
const isValid = await validateSession();

// Refresh session
const refreshed = await refreshSession({
  sessionTimeout: 60 * 60 * 1000 // 1 hour
});

// Clear session
await clearSession();

// Check authentication
const isAuth = await isAuthenticated();

// Get remaining time
const remaining = await getSessionTimeRemaining();
```

**Key Features:**
- Platform-agnostic session management
- Automatic session expiration handling
- Remember me functionality
- Session timeout management

### User Management (`user.ts`)

Manages user operations and secret key handling:

```typescript
// Login with unified architecture
const result = await loginUser({
  email: 'user@example.com',
  password: 'password123',
  rememberEmail: true,
  rememberMe: false
});

// MFA confirmation
await confirmMfa({ code: '123456', password: 'password123' });

// Secret key management
await storeUserSecretKey(derivedKey);
const key = await getUserSecretKey();
await deleteUserSecretKey();
```

### Item Operations (`items.ts`)

Handles all item CRUD operations with unified architecture:

```typescript
// Get all items (credentials, bank cards, secure notes)
const items = await getAllItems(userId, userSecretKey);

// Add new item
const itemId = await addItem(userId, userSecretKey, itemData);

// Update item
await updateItem(userId, itemId, userSecretKey, updates);

// Delete item
await deleteItem(userId, itemId);

// Refresh from database
const refreshed = await refreshItems(userId, userSecretKey);
```

### Cryptography (`cryptography.ts`)

Handles encryption/decryption of all item types:

```typescript
// Encrypt items
const encryptedCredential = await encryptCredential(userSecretKey, credential);
const encryptedCard = await encryptBankCard(userSecretKey, bankCard);
const encryptedNote = await encryptSecureNote(userSecretKey, secureNote);

// Decrypt items
const decryptedItem = await decryptItem(userSecretKey, encryptedItem);
const allDecrypted = await decryptAllItems(userSecretKey, encryptedItems);
```

## 🔒 Security Architecture

### Zero-Knowledge Principles
- **No Decrypted Persistence**: All decrypted data is ephemeral
- **Memory-Only**: Decrypted data exists only in RAM
- **Secure Storage**: Keys stored in platform-specific secure storage
- **Automatic Cleanup**: Memory cleared on logout

### Session Security
- **Platform-Specific Storage**: Sessions use platform adapters for secure storage
- **Automatic Expiration**: Sessions expire automatically
- **Device Fingerprinting**: Extension sessions use device fingerprinting
- **Biometric Integration**: Mobile sessions integrate with biometric authentication

### Encryption Flow
```
User Input → Key Derivation → Encryption → Secure Storage
     ↓              ↓              ↓              ↓
   Password → User Salt → Item Keys → Platform Storage
```

## 🧪 Testing

### Test Structure
```
__tests__/
├── unified.test.ts      # Unified logic tests
├── user.test.ts         # User management tests
├── items.test.ts        # Item operations tests
├── cryptography.test.ts # Encryption tests
└── session.test.ts      # Session management tests
```

### Testing Patterns
- **Mock Platform Adapters**: All tests use mocked adapters
- **Comprehensive Coverage**: Success, failure, and edge cases
- **Integration Tests**: End-to-end workflow testing
- **Type Safety**: Full TypeScript testing

## 📋 Usage Examples

### Complete Authentication Flow

```typescript
import { unifiedLogin, unifiedLoadVault, unifiedLogout } from './unified';
import { createSession, validateSession, clearSession } from './session';

// 1. Login
const loginResult = await unifiedLogin('user@example.com', 'password123');
if (!loginResult.success) {
  throw new Error(loginResult.error);
}

// 2. Create session
const sessionResult = await createSession(loginResult.data.session.userSecretKey);
if (!sessionResult.success) {
  throw new Error('Failed to create session');
}

// 3. Load vault
const vaultResult = await unifiedLoadVault();
if (vaultResult.success) {
  console.log('Loaded', vaultResult.data.length, 'items');
}

// 4. Validate session periodically
const isValid = await validateSession();
if (!isValid.success) {
  // Session expired, redirect to login
}

// 5. Logout
const logoutResult = await unifiedLogout();
await clearSession();
```

### Session Management Flow

```typescript
import { 
  createSession, 
  validateSession, 
  refreshSession, 
  clearSession,
  isAuthenticated,
  getSessionTimeRemaining 
} from './session';

// Create session with remember me
const session = await createSession(userSecretKey, {
  rememberMe: true,
  sessionTimeout: 7 * 24 * 60 * 60 * 1000 // 7 days
});

// Check authentication status
const isAuth = await isAuthenticated();
if (isAuth) {
  // User is authenticated
  const remaining = await getSessionTimeRemaining();
  console.log(`Session expires in ${remaining}ms`);
}

// Refresh session before expiration
const refreshed = await refreshSession({
  sessionTimeout: 30 * 60 * 1000 // 30 minutes
});

// Clear session on logout
await clearSession();
```

### Item Management Flow

```typescript
import { getAllItems, addItem, updateItem, deleteItem } from './items';

// 1. Get all items
const items = await getAllItems(userId, userSecretKey);

// 2. Add new credential
const newCredential = {
  title: 'Gmail',
  username: 'user@gmail.com',
  password: 'password123',
  url: 'https://gmail.com',
  note: 'Personal email'
};

const itemId = await addItem(userId, userSecretKey, newCredential);

// 3. Update item
await updateItem(userId, itemId, userSecretKey, {
  password: 'newpassword123'
});

// 4. Delete item
await deleteItem(userId, itemId);
```

### Cryptography Operations

```typescript
import { encryptCredential, decryptItem } from './cryptography';

// 1. Encrypt credential
const credential = {
  id: 'cred-1',
  title: 'Gmail',
  username: 'user@gmail.com',
  password: 'password123',
  // ... other fields
};

const encrypted = await encryptCredential(userSecretKey, credential);

// 2. Decrypt item
const decrypted = await decryptItem(userSecretKey, encrypted);
```

## 🔧 Integration

### With Platform Adapters

```typescript
import { getPlatformAdapter } from '../adapters/adapter.factory';

const adapter = await getPlatformAdapter();
const capabilities = await unifiedGetPlatformCapabilities();
```

### With State Management

```typescript
import { useCredentialsStore, useBankCardsStore } from '../states';

// Logic automatically updates states
const items = await getAllItems(userId, userSecretKey);
// States are automatically synchronized
```

### With UI Components

```typescript
import { unifiedLogin } from '@app/core/logic';
import { createSession } from '@app/core/logic';

// UI components only call unified logic
const handleLogin = async () => {
  const result = await unifiedLogin(email, password);
  if (result.success) {
    await createSession(result.data.session.userSecretKey);
    // Navigate to home
  }
};
```

## 📝 Best Practices

### 1. Always Use Unified Functions
```typescript
// ✅ Good - Use unified logic
const result = await unifiedLogin(email, password);

// ❌ Bad - Direct service calls
const result = await loginWithCognito(email, password);
```

### 2. Handle Errors Consistently
```typescript
// ✅ Good - Consistent error handling
const result = await unifiedLoadVault();
if (!result.success) {
  console.error('Vault load failed:', result.error);
  return;
}
```

### 3. Use Session Management
```typescript
// ✅ Good - Use session management
const session = await createSession(userSecretKey);
const isValid = await validateSession();

// ❌ Bad - Direct storage access
const key = await adapter.getUserSecretKey();
```

### 4. Follow Security Principles
- Never persist decrypted data
- Always use platform adapters for storage
- Clear sensitive data on logout
- Validate all inputs
- Use session timeouts

## 🔄 Migration Guide

### From Legacy Logic
1. Replace direct service calls with unified functions
2. Update error handling to use consistent patterns
3. Remove platform-specific code
4. Add comprehensive testing

### To New Architecture
1. Import from `@app/core/logic`
2. Use unified functions for all operations
3. Implement proper error handling
4. Add integration tests

## 📚 Related Documentation

- [Authentication](../auth/README.md)
- [State Management](../states/README.md)
- [Platform Adapters](../adapters/README.md)
- [Unified Architecture](../../ARCHITECTURE.md) 