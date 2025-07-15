# Services Layer (Layer 2: Business Logic Layer)

This directory contains business logic services that orchestrate complex operations. These services handle the coordination between different libraries and implement business rules.

## Purpose

Services in this layer serve as the **Business Logic Layer** in our three-layer architecture:

```
Hooks → Services → Libraries
```

## Characteristics

- ✅ **Business Logic**: Handle complex operations and business rules
- ✅ **Orchestration**: Coordinate between multiple libraries
- ✅ **Error Transformation**: Convert library errors to business errors
- ✅ **Platform Agnostic**: Work across all platforms
- ✅ **Type Safety**: Strict TypeScript typing throughout

## Available Services

### Authentication Services

#### `auth.ts`
Handles user authentication operations including login, logout, and session management.

```typescript
import { loginUser, signOutUser, isUserAuthenticated } from '@common/core/services/auth';

// Login user
const { user, userSecretKey } = await loginUser(email, password);

// Check authentication status
const isAuthenticated = await isUserAuthenticated();

// Sign out user
await signOutUser();
```

#### `session.ts`
Manages user session initialization and lifecycle.

```typescript
import { initializeUserSession, clearUserSession } from '@common/core/services/session';

// Initialize session after login
await initializeUserSession(userSecretKey);

// Clear session on logout
await clearUserSession();
```

### Cryptography Services

#### `cryptography.ts`
Handles encryption and decryption of sensitive data.

```typescript
import { encryptItem, decryptItem, decryptAllItems } from '@common/core/services/cryptography';

// Encrypt a credential
const encryptedCredential = await encryptItem(credential, userSecretKey);

// Decrypt a credential
const decryptedCredential = await decryptItem(encryptedCredential, userSecretKey);

// Decrypt all items
const decryptedItems = await decryptAllItems(encryptedItems, userSecretKey);
```

### Item Management Services

#### `items.ts`
Manages CRUD operations for credentials, bank cards, and secure notes.

```typescript
import { 
  addCredential, 
  addBankCard, 
  addSecureNote,
  updateItem,
  deleteItem,
  getAllItems 
} from '@common/core/services/items';

// Add new items
await addCredential(credential);
await addBankCard(bankCard);
await addSecureNote(secureNote);

// Update existing item
await updateItem(userId, itemId, userSecretKey, updates);

// Delete item
await deleteItem(userId, itemId);

// Get all items
const items = await getAllItems();
```

### Vault Services

#### `vault.ts`
Manages local vault storage and synchronization.

```typescript
import { setLocalVault, getLocalVault, clearLocalVault } from '@common/core/services/vault';

// Store vault locally
await setLocalVault(items);

// Load vault from local storage
const items = await getLocalVault();

// Clear local vault
await clearLocalVault();
```

### Secret Management Services

#### `secret.ts`
Manages user secret keys and device fingerprints.

```typescript
import { 
  getUserSecretKey, 
  storeUserSecretKey, 
  deleteUserSecretKey,
  getDeviceFingerprint 
} from '@common/core/services/secret';

// Get user secret key
const secretKey = await getUserSecretKey();

// Store user secret key
await storeUserSecretKey(secretKey);

// Get device fingerprint
const fingerprint = await getDeviceFingerprint();
```

### State Management Services

#### `states.ts`
Manages Zustand state updates and synchronization.

```typescript
import { 
  setDataInStates, 
  clearAllStates, 
  updateItemInStates 
} from '@common/core/services/states';

// Set data in all states
await setDataInStates({ credentials, bankCards, secureNotes });

// Clear all states
await clearAllStates();

// Update specific item
await updateItemInStates(itemType, itemId, updates);
```

## Service Architecture

### Error Handling
All services use custom error classes for consistent error handling:

```typescript
import { 
  AuthenticationError, 
  CryptographyError, 
  NetworkError, 
  VaultError 
} from '@common/core/types/errors.types';

try {
  await loginUser(email, password);
} catch (error) {
  if (error instanceof AuthenticationError) {
    // Handle authentication error
  } else if (error instanceof NetworkError) {
    // Handle network error
  }
}
```

### Business Rules
Services implement business rules and validation:

```typescript
// Example: Password strength validation
export const addCredential = async (credential: Credential) => {
  // Business rule: Validate password strength
  if (!isPasswordStrong(credential.password)) {
    throw new ValidationError('Password does not meet security requirements');
  }
  
  // Business rule: Check for duplicate credentials
  if (await hasDuplicateCredential(credential)) {
    throw new ValidationError('Credential already exists');
  }
  
  // Proceed with encryption and storage
  const encryptedCredential = await encryptItem(credential, userSecretKey);
  await addDocument('items', encryptedCredential);
};
```

### Library Coordination
Services coordinate between multiple libraries:

```typescript
export const loginUser = async (email: string, password: string) => {
  // 1. Authenticate with Cognito (Library Layer)
  const cognitoUser = await loginWithCognito(email, password);
  
  // 2. Get user salt from Cognito (Library Layer)
  const userSalt = await getCognitoUserSalt(cognitoUser);
  
  // 3. Sign in to Firebase (Library Layer)
  const firebaseToken = await signInWithFirebaseToken(cognitoUser);
  
  // 4. Derive user secret key (Library Layer)
  const userSecretKey = await deriveKey(password, userSalt);
  
  // 5. Create user and session objects
  const user = createUserFromCognito(cognitoUser);
  const session = createSession(user, userSecretKey);
  
  return { user, session, userSecretKey };
};
```

## Testing Services

### Example Test
```typescript
import { loginUser } from './auth';
import { mockCognitoUser, mockFirebaseToken } from '../__mocks__/auth';

describe('loginUser', () => {
  it('should orchestrate login flow successfully', async () => {
    const result = await loginUser('test@example.com', 'password');
    
    expect(result.user).toBeDefined();
    expect(result.session).toBeDefined();
    expect(result.userSecretKey).toBeDefined();
  });
  
  it('should handle authentication errors', async () => {
    await expect(loginUser('invalid@example.com', 'wrong'))
      .rejects.toThrow(AuthenticationError);
  });
});
```

## Development Guidelines

### 1. Keep Services Focused
```typescript
// ✅ Good - Single responsibility
export const addCredential = async (credential: Credential) => {
  // Only handle credential addition logic
};

// ❌ Bad - Multiple responsibilities
export const handleUserAction = async (action: string, data: any) => {
  // Handles multiple different actions
};
```

### 2. Use Proper Error Handling
```typescript
// ✅ Good - Specific error handling
try {
  await loginWithCognito(email, password);
} catch (error) {
  if (error instanceof NetworkError) {
    throw new AuthenticationError('Network connection failed', error);
  }
  throw new AuthenticationError('Login failed', error);
}
```

### 3. Implement Business Rules
```typescript
// ✅ Good - Business rule validation
export const addCredential = async (credential: Credential) => {
  // Validate business rules
  if (!isValidCredential(credential)) {
    throw new ValidationError('Invalid credential data');
  }
  
  // Proceed with operation
  await encryptAndStore(credential);
};
```

### 4. Coordinate Libraries Properly
```typescript
// ✅ Good - Proper library coordination
export const refreshData = async () => {
  // 1. Get data from database
  const encryptedItems = await getAllItemsFromFirestore();
  
  // 2. Decrypt data
  const decryptedItems = await decryptAllItems(encryptedItems);
  
  // 3. Update states
  await setDataInStates(decryptedItems);
  
  // 4. Store locally
  await setLocalVault(decryptedItems);
};
```

## Integration with Other Layers

### Services → Libraries
Services call libraries for external operations:

```typescript
// Service calls library
const cognitoUser = await loginWithCognito(email, password);
```

### Services → Hooks
Hooks call services for business logic:

```typescript
// Hook calls service
const { login } = useLoginFlow();
// Internally calls loginUser service
```

### Services → States
Services update Zustand states:

```typescript
// Service updates state
await setDataInStates(decryptedItems);
```

## Platform Considerations

Services are platform-agnostic and work across:

- **Mobile** (React Native)
- **Extension** (Chrome Extension)
- **Web** (React)

Platform-specific logic is handled in the libraries layer through adapters.

## Performance Considerations

### Caching
Services should implement appropriate caching:

```typescript
// Cache expensive operations
const cachedUserSecretKey = await getUserSecretKey();
if (cachedUserSecretKey) {
  return cachedUserSecretKey;
}
```

### Batch Operations
Use batch operations when possible:

```typescript
// Batch multiple operations
const batch = firestore.batch();
items.forEach(item => {
  const docRef = firestore.collection('items').doc();
  batch.set(docRef, item);
});
await batch.commit();
```

### Error Recovery
Implement proper error recovery:

```typescript
// Retry failed operations
const retryOperation = async (operation: () => Promise<any>, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(1000 * (i + 1)); // Exponential backoff
    }
  }
};
``` 