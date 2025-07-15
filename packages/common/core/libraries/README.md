# Libraries Layer (Layer 3: External Integration Layer)

This directory contains external integrations and platform-specific implementations. These libraries handle low-level operations and external API calls.

## Purpose

Libraries in this layer serve as the **External Integration Layer** in our three-layer architecture:

```
Services → Libraries → External APIs
```

## Characteristics

- ✅ **External APIs**: Handle external service integrations
- ✅ **Platform-Specific**: Implement platform-specific functionality
- ✅ **Low-Level Operations**: Crypto, storage, network operations
- ✅ **Minimal Business Logic**: Focus on integration, not business rules
- ✅ **Called by Services**: Only services should call libraries directly

## Available Libraries

### Authentication Libraries

#### `auth/`
Handles authentication provider integrations.

**Cognito Integration** (`auth/cognito.ts`):
```typescript
import { loginWithCognito, getCognitoUserSalt } from '@common/core/libraries/auth/cognito';

// Login with AWS Cognito
const cognitoUser = await loginWithCognito(email, password);

// Get user salt from Cognito
const userSalt = await getCognitoUserSalt(cognitoUser);
```

**Firebase Integration** (`auth/firebase.ts`):
```typescript
import { signInWithFirebaseToken } from '@common/core/libraries/auth/firebase';

// Sign in to Firebase with token
const firebaseToken = await signInWithFirebaseToken(cognitoUser);
```

### Cryptography Libraries

#### `crypto/`
Handles cryptographic operations and key management.

**Crypto Operations** (`crypto/crypto.ts`):
```typescript
import { encryptData, decryptData, deriveKey } from '@common/core/libraries/crypto';

// Derive key from password and salt
const userSecretKey = await deriveKey(password, salt);

// Encrypt data
const encryptedData = await encryptData(key, data);

// Decrypt data
const decryptedData = await decryptData(key, encryptedData);
```

### Database Libraries

#### `database/`
Handles database operations and data persistence.

**Firestore Integration** (`database/firestore.ts`):
```typescript
import { 
  addDocument, 
  updateDocument, 
  deleteDocument, 
  getCollection 
} from '@common/core/libraries/database/firestore';

// Add document to Firestore
await addDocument('items', encryptedItem);

// Update document
await updateDocument('items/itemId', updates);

// Delete document
await deleteDocument('items/itemId');

// Get collection
const documents = await getCollection('items');
```

### Platform Libraries

#### `platform/`
Handles platform-specific operations and adapters.

**Platform Adapter** (`platform/platform.adapter.ts`):
```typescript
import { getPlatformAdapter } from '@common/core/libraries/platform';

// Get platform-specific adapter
const adapter = await getPlatformAdapter();

// Platform-specific operations
const secretKey = await adapter.getUserSecretKey();
await adapter.storeUserSecretKey(secretKey);
await adapter.copyToClipboard(text);
```

## Library Architecture

### Error Handling
Libraries should throw specific error types:

```typescript
import { NetworkError, CryptographyError } from '@common/core/types/errors.types';

// Network errors
if (!navigator.onLine) {
  throw new NetworkError('No internet connection');
}

// Crypto errors
try {
  const decrypted = await decryptData(key, data);
} catch (error) {
  throw new CryptographyError('Decryption failed', error);
}
```

### Platform Abstraction
Libraries provide platform-agnostic interfaces:

```typescript
// Platform adapter interface
interface PlatformAdapter {
  getUserSecretKey(): Promise<string | null>;
  storeUserSecretKey(key: string): Promise<void>;
  copyToClipboard(text: string): Promise<void>;
  getDeviceFingerprint(): Promise<string>;
}

// Platform-specific implementations
class MobilePlatformAdapter implements PlatformAdapter {
  async getUserSecretKey() {
    return SecureStore.getItemAsync('userSecretKey');
  }
  
  async copyToClipboard(text: string) {
    await Clipboard.setStringAsync(text);
  }
}

class ExtensionPlatformAdapter implements PlatformAdapter {
  async getUserSecretKey() {
    const result = await chrome.storage.local.get('userSecretKey');
    return result.userSecretKey;
  }
  
  async copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
  }
}
```

### External API Integration
Libraries handle external API calls:

```typescript
// Cognito integration
export const loginWithCognito = async (email: string, password: string) => {
  try {
    const { signIn } = await import('aws-amplify/auth');
    const result = await signIn({ username: email, password });
    return result.user;
  } catch (error) {
    throw new AuthenticationError('Cognito login failed', error as Error);
  }
};

// Firestore integration
export const addDocument = async (collection: string, data: any) => {
  try {
    const { doc, setDoc } = await import('firebase/firestore');
    const docRef = doc(firestore, collection);
    await setDoc(docRef, data);
  } catch (error) {
    throw new NetworkError('Failed to add document', error as Error);
  }
};
```

## Testing Libraries

### Example Test
```typescript
import { loginWithCognito } from './auth/cognito';
import { mockCognitoUser } from '../__mocks__/cognito';

describe('loginWithCognito', () => {
  it('should call Cognito API successfully', async () => {
    const result = await loginWithCognito('test@example.com', 'password');
    
    expect(result).toBeDefined();
    expect(result.username).toBe('test@example.com');
  });
  
  it('should handle authentication errors', async () => {
    await expect(loginWithCognito('invalid@example.com', 'wrong'))
      .rejects.toThrow(AuthenticationError);
  });
});
```

## Development Guidelines

### 1. Keep Libraries Focused
```typescript
// ✅ Good - Single responsibility
export const encryptData = async (key: string, data: string) => {
  // Only handle encryption
};

// ❌ Bad - Multiple responsibilities
export const handleCryptoOperation = async (operation: string, data: any) => {
  // Handles multiple crypto operations
};
```

### 2. Handle External Dependencies
```typescript
// ✅ Good - Proper error handling for external APIs
try {
  const result = await externalApi.call();
  return result;
} catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    throw new NetworkError('Network connection failed', error);
  }
  throw new Error('External API call failed');
}
```

### 3. Implement Platform Abstraction
```typescript
// ✅ Good - Platform-agnostic interface
interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

// Platform-specific implementations
class MobileStorageAdapter implements StorageAdapter {
  async getItem(key: string) {
    return SecureStore.getItemAsync(key);
  }
  
  async setItem(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  }
}
```

### 4. Use Proper Error Types
```typescript
// ✅ Good - Specific error types
try {
  await externalApi.call();
} catch (error) {
  if (error instanceof NetworkError) {
    throw new NetworkError('API call failed', error);
  }
  throw new Error('Unexpected error');
}
```

## Integration with Other Layers

### Libraries → Services
Services call libraries for external operations:

```typescript
// Service calls library
const cognitoUser = await loginWithCognito(email, password);
```

### Libraries → External APIs
Libraries handle external API calls:

```typescript
// Library calls external API
const result = await fetch('https://api.example.com/data');
```

## Platform Considerations

### Mobile Platform
- **Secure Storage**: Use Expo SecureStore
- **Biometric Auth**: Use Expo LocalAuthentication
- **Clipboard**: Use Expo Clipboard
- **Network**: Use Expo Network

### Extension Platform
- **Storage**: Use Chrome Storage API
- **Tabs**: Use Chrome Tabs API
- **Clipboard**: Use Navigator Clipboard API
- **Network**: Use Fetch API

### Web Platform
- **Storage**: Use LocalStorage/SessionStorage
- **Clipboard**: Use Navigator Clipboard API
- **Network**: Use Fetch API

## Performance Considerations

### Lazy Loading
Libraries should support lazy loading:

```typescript
// Lazy load external dependencies
export const getCognitoAuth = async () => {
  const { Auth } = await import('aws-amplify/auth');
  return Auth;
};
```

### Caching
Implement appropriate caching:

```typescript
// Cache external API responses
const cache = new Map();

export const getCachedData = async (key: string) => {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const data = await fetchData(key);
  cache.set(key, data);
  return data;
};
```

### Error Recovery
Implement retry logic for external APIs:

```typescript
// Retry external API calls
const retryApiCall = async (apiCall: () => Promise<any>, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(1000 * Math.pow(2, i)); // Exponential backoff
    }
  }
};
```

## Security Considerations

### Secure Storage
Always use platform-specific secure storage:

```typescript
// Mobile: Expo SecureStore
const storeSecureData = async (key: string, value: string) => {
  const { SecureStore } = await import('expo-secure-store');
  return SecureStore.setItemAsync(key, value);
};

// Extension: Chrome Storage
const storeSecureData = async (key: string, value: string) => {
  return chrome.storage.local.set({ [key]: value });
};
```

### Input Validation
Validate all inputs before processing:

```typescript
// Validate inputs
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }
  return email;
};
```

### Error Sanitization
Don't expose sensitive information in errors:

```typescript
// ✅ Good - Sanitized error
try {
  await externalApi.call();
} catch (error) {
  throw new Error('External API call failed');
}

// ❌ Bad - Exposes sensitive info
try {
  await externalApi.call();
} catch (error) {
  throw new Error(`API call failed: ${error.message}`);
}
``` 