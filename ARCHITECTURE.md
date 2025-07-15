# SimpliPass Architecture Documentation - Three-Layer Pattern

## Overview

SimpliPass is a cross-platform password manager implementing a clean three-layer architecture pattern. The architecture prioritizes maintainability, testability, and clear separation of concerns while supporting mobile (React Native) and browser extension (Chrome Extension) platforms.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SimpliPass                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Mobile    │  │  Extension  │  │    Web      │          │
│  │   Platform  │  │  Platform   │  │   Platform  │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
├─────────────────────────────────────────────────────────────────┤
│                    Three-Layer Architecture                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Hooks     │  │  Services   │  │ Libraries   │          │
│  │   (UI)      │  │ (Business)  │  │(External)   │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## Three-Layer Architecture

### Layer 1: Hooks (UI Layer)
**Purpose**: Handle UI state and user interactions. Provide simple, readable interfaces for components.

**Characteristics**:
- ✅ Simple, readable functions
- ✅ Handle UI state management
- ✅ Abstract complexity from components
- ✅ Return clear, predictable results
- ✅ Handle loading states and errors
- ✅ Ensure states are always accessible for UI

**Examples**:
```typescript
// ✅ Good Hook - Simple, clear, handles UI concerns
export const useLoginFlow = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await loginUser(email, password);
      await initializeUserSession();
      await useRefreshData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return { login, isLoading, error };
};

// ✅ Good Hook - Ensures data availability
export const useRefreshData = () => {
  const credentials = useCredentialsStore(state => state.credentials);
  const isLoading = useCredentialsStore(state => state.isLoading);
  
  const refresh = async () => {
    if (credentials.length === 0 && !isLoading) {
      await getAllItemsFromFirestore();
      await decryptAllItems();
      await setDataInStates();
      await setLocalVault();
    }
  };
  
  return { refresh, isLoading };
};
```

### Layer 2: Services (Business Logic Layer)
**Purpose**: Organize complex business logic. Handle orchestration between different operations.

**Characteristics**:
- ✅ Contain complex business logic
- ✅ Orchestrate multiple operations
- ✅ Handle data transformations
- ✅ Manage business rules
- ✅ Called only by hooks or other services
- ✅ Platform-agnostic

**Examples**:
```typescript
// ✅ Good Service - Orchestrates authentication flow
export const loginUser = async (email: string, password: string) => {
  const cognitoUser = await loginWithCognito(email, password);
  const userSalt = await getCognitoUserSalt(cognitoUser);
  const firebaseToken = await signInWithFirebaseToken(cognitoUser);
  
  return { cognitoUser, userSalt, firebaseToken };
};

// ✅ Good Service - Handles session initialization
export const initializeUserSession = async (userData: UserData) => {
  const userSecretKey = await deriveKey(userData.password, userData.salt);
  
  // Store in state (RAM)
  useAuthStore.getState().setUserSecretKey(userSecretKey);
  
  // Encrypt and store locally
  const encryptedKey = await encryptWithDeviceFingerprint(userSecretKey);
  await storeUserSecretKeyEncrypted(encryptedKey);
  
  // Store session data
  await storeSessionData(userData.session);
};

// ✅ Good Service - Manages data synchronization
export const getAllItemsFromFirestore = async () => {
  const collection = await getCollection('users', userId, 'items');
  const encryptedItems = await fetchAllDocuments(collection);
  return encryptedItems;
};
```

### Layer 3: Libraries & Adapters (External Integration Layer)
**Purpose**: Handle external APIs, platform-specific implementations, and low-level operations.

**Characteristics**:
- ✅ Handle external API calls
- ✅ Platform-specific implementations
- ✅ Low-level operations (crypto, storage)
- ✅ Called only by services
- ✅ Minimal business logic
- ✅ Focus on integration

**Examples**:
```typescript
// ✅ Good Library - External API integration
export const loginWithCognito = async (email: string, password: string) => {
  const result = await Auth.signIn(email, password);
  return result.user;
};

// ✅ Good Library - Platform-specific storage
export const storeUserSecretKeyEncrypted = async (encryptedKey: string) => {
  const adapter = await getPlatformAdapter();
  return adapter.storeUserSecretKey(encryptedKey);
};

// ✅ Good Library - Cryptographic operations
export const deriveKey = async (password: string, salt: string): Promise<string> => {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = encoder.encode(salt);
  
  const key = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    key,
    256
  );
  
  return btoa(String.fromCharCode(...new Uint8Array(derivedBits)));
};
```

## Package Structure

```
packages/
├── app/                    # Shared UI Components
│   ├── components/         # React Native components
│   ├── screens/           # Screen components
│   └── core/              # App-specific logic
│       ├── hooks/         # Layer 1: UI Hooks
│       │   ├── useLoginFlow.ts
│       │   ├── useRefreshData.ts
│       │   ├── useCredentials.ts
│       │   ├── useAuth.ts
│       │   ├── useVault.ts
│       │   └── index.ts
│       │
│       ├── services/      # Layer 2: Business Logic
│       │   ├── auth.ts
│       │   ├── session.ts
│       │   ├── items.ts
│       │   ├── cryptography.ts
│       │   ├── vault.ts
│       │   ├── states.ts
│       │   └── index.ts
│       │
│       ├── libraries/     # Layer 3: External Integrations
│       │   ├── auth/
│       │   │   ├── cognito.ts
│       │   │   ├── firebase.ts
│       │   │   └── index.ts
│       │   ├── database/
│       │   │   ├── firestore.ts
│       │   │   └── index.ts
│       │   ├── crypto/
│       │   │   ├── crypto.ts
│       │   │   └── index.ts
│       │   ├── platform/
│       │   │   ├── platform.ts
│       │   │   └── index.ts
│       │   └── index.ts
│       │
│       ├── states/        # Zustand stores
│       │   ├── auth.state.ts
│       │   ├── credentials.state.ts
│       │   ├── bankCards.state.ts
│       │   ├── secureNotes.state.ts
│       │   └── index.ts
│       │
│       └── types/         # Type definitions
│           ├── auth.types.ts
│           ├── items.types.ts
│           ├── platform.types.ts
│           └── index.ts
│
├── mobile/                # Mobile-specific code
│   ├── adapters/          # Mobile platform adapter
│   ├── services/          # Mobile services
│   └── utils/             # Mobile utilities
│
├── extension/             # Extension-specific code
│   ├── adapters/          # Extension platform adapter
│   ├── background/        # Background script
│   ├── content/           # Content scripts
│   └── utils/             # Extension utilities
│
└── shared/                # Shared utilities
    ├── constants/         # Shared constants
    ├── types/             # Shared types
    └── utils/             # Shared utilities
```

## Data Flow Architecture

### Authentication Flow

```mermaid
sequenceDiagram
    participant UI as UI Component
    participant Hook as useLoginFlow
    participant Auth as auth.ts
    participant Session as session.ts
    participant Refresh as useRefreshData
    participant Items as items.ts
    participant Crypto as cryptography.ts
    participant States as states.ts
    participant Vault as vault.ts
    participant Cognito as cognito.ts
    participant Firebase as firebase.ts
    participant Platform as platform.ts

    UI->>Hook: login(email, password)
    Hook->>Auth: loginUser(email, password)
    Auth->>Cognito: loginWithCognito(email, password)
    Auth->>Cognito: getCognitoUserSalt(user)
    Auth->>Firebase: signInWithFirebaseToken(user)
    Hook->>Session: initializeUserSession(userData)
    Session->>Platform: deriveKey(password, salt)
    Session->>Platform: encryptWithDeviceFingerprint(key)
    Session->>Platform: storeUserSecretKeyEncrypted(encryptedKey)
    Hook->>Refresh: refresh()
    Refresh->>Items: getAllItemsFromFirestore()
    Items->>Firebase: getCollection('users', userId, 'items')
    Refresh->>Crypto: decryptAllItems(encryptedItems)
    Crypto->>Platform: decryptItem(item)
    Refresh->>States: setDataInStates(decryptedItems)
    Refresh->>Vault: setLocalVault(decryptedItems)
    States->>UI: Update UI state
```

### Credential Management Flow

```mermaid
sequenceDiagram
    participant UI as CredentialCard
    participant Hook as useCredentials
    participant Items as items.ts
    participant Crypto as cryptography.ts
    participant States as states.ts
    participant Firestore as firestore.ts

    UI->>Hook: addCredential(credential)
    Hook->>Items: addItemToFirestore(encryptedCredential)
    Items->>Firestore: addDocument(collection, encryptedCredential)
    Hook->>States: addCredential(decryptedCredential)
    States->>UI: Update UI state

    UI->>Hook: copyPassword(credentialId)
    Hook->>Crypto: decryptCredential(encryptedCredential)
    Crypto->>Platform: decryptData(encryptedData, key)
    Hook->>Platform: copyToClipboard(decryptedPassword)
```

## Platform Adapter Pattern

### Interface Definition

```typescript
interface PlatformAdapter {
  // Storage Operations
  getUserSecretKey(): Promise<string | null>;
  storeUserSecretKey(key: string): Promise<void>;
  deleteUserSecretKey(): Promise<void>;
  
  // Platform Information
  getPlatformName(): 'mobile' | 'extension';
  supportsBiometric(): boolean;
  supportsOfflineVault(): boolean;
  
  // Authentication
  authenticateWithBiometrics?(): Promise<boolean>;
  isBiometricAvailable?(): Promise<boolean>;
  
  // Clipboard
  copyToClipboard(text: string): Promise<void>;
  getFromClipboard(): Promise<string>;
  
  // Session Management
  clearSession(): Promise<void>;
  getDeviceFingerprint(): Promise<string>;
  
  // Network
  isOnline(): Promise<boolean>;
  getNetworkStatus(): Promise<'online' | 'offline' | 'unknown'>;
}
```

### Platform Implementations

#### Mobile Platform Adapter

```typescript
class MobilePlatformAdapter implements PlatformAdapter {
  async getUserSecretKey() {
    return SecureStore.getItemAsync('userSecretKey');
  }
  
  async storeUserSecretKey(key: string) {
    return SecureStore.setItemAsync('userSecretKey', key);
  }
  
  async authenticateWithBiometrics() {
    return LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access SimpliPass',
    });
  }
  
  getPlatformName() {
    return 'mobile';
  }
  
  supportsBiometric() {
    return true;
  }
  
  supportsOfflineVault() {
    return false; // Mobile always fetches from Firestore
  }
}
```

#### Extension Platform Adapter

```typescript
class ExtensionPlatformAdapter implements PlatformAdapter {
  async getUserSecretKey() {
    const result = await chrome.storage.local.get('userSecretKey');
    return this.decryptFromStorage(result.userSecretKey);
  }
  
  async storeUserSecretKey(key: string) {
    const encrypted = await this.encryptForStorage(key);
    return chrome.storage.local.set({ userSecretKey: encrypted });
  }
  
  async getEncryptedVault() {
    return chrome.storage.local.get('encryptedVault');
  }
  
  getPlatformName() {
    return 'extension';
  }
  
  supportsBiometric() {
    return false; // Extensions don't support biometrics
  }
  
  supportsOfflineVault() {
    return true; // Extensions have local encrypted vault
  }
}
```

## State Management Architecture

### Zustand Store Structure

```typescript
// Auth State
interface AuthStore {
  user: User | null;
  session: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User) => void;
  setSession: (session: UserSession) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
}

// Credentials State
interface CredentialsStore {
  credentials: Credential[];
  searchQuery: string;
  filters: SearchFilters;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCredentials: (credentials: Credential[]) => void;
  addCredential: (credential: Credential) => void;
  updateCredential: (id: string, updates: Partial<Credential>) => void;
  deleteCredential: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: SearchFilters) => void;
}
```

### State Synchronization

```typescript
// State synchronization utility
export const syncAllStates = async (data: {
  credentials?: Credential[];
  bankCards?: BankCard[];
  secureNotes?: SecureNote[];
  user?: User;
  auth?: AuthState;
}) => {
  const errors: string[] = [];
  const updatedStates: string[] = [];
  
  // Sync credentials
  if (data.credentials) {
    try {
      useCredentialsStore.getState().setCredentials(data.credentials);
      updatedStates.push('credentials');
    } catch (error) {
      errors.push(`Failed to sync credentials: ${error}`);
    }
  }
  
  // Sync other states...
  
  return {
    success: errors.length === 0,
    errors,
    updatedStates,
  };
};
```

## Security Architecture

### Encryption Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐                │
│  │   Application   │  │   Transport     │                │
│  │   Encryption    │  │   Encryption    │                │
│  │   (AES-256)     │  │   (TLS 1.3)    │                │
│  └─────────────────┘  └─────────────────┘                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐                │
│  │   Platform      │  │   Storage       │                │
│  │   Security      │  │   Encryption    │                │
│  │   (Keychain)    │  │   (Device Key)  │                │
│  └─────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### Key Derivation

```typescript
// PBKDF2 key derivation
async function deriveUserKey(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = encoder.encode(salt);
  
  const key = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    key,
    256
  );
  
  return btoa(String.fromCharCode(...new Uint8Array(derivedBits)));
}
```

## Error Handling Architecture

### Error Hierarchy

```typescript
// Base platform error
export class SimpliPassError extends Error {
  constructor(
    message: string,
    public code: string,
    public layer: 'hook' | 'service' | 'library',
    public originalError?: Error
  ) {
    super(message);
    this.name = 'SimpliPassError';
  }
}

// Specific error types
export class AuthenticationError extends SimpliPassError {
  constructor(message: string, originalError?: Error) {
    super(message, 'AUTH_ERROR', 'service', originalError);
    this.name = 'AuthenticationError';
  }
}

export class CryptographyError extends SimpliPassError {
  constructor(message: string, originalError?: Error) {
    super(message, 'CRYPTO_ERROR', 'library', originalError);
    this.name = 'CryptographyError';
  }
}

export class NetworkError extends SimpliPassError {
  constructor(message: string, originalError?: Error) {
    super(message, 'NETWORK_ERROR', 'library', originalError);
    this.name = 'NetworkError';
  }
}
```

### Error Handling Flow

```typescript
// Error boundary pattern
export function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorHandler: (error: SimpliPassError) => void
): Promise<T> {
  return operation().catch((error) => {
    const simpliPassError = new SimpliPassError(
      error.message,
      'UNKNOWN_ERROR',
      'unknown',
      error
    );
    errorHandler(simpliPassError);
    throw simpliPassError;
  });
}
```

## Testing Architecture

### Test Structure

```
tests/
├── unit/                    # Unit tests
│   ├── hooks/              # Hook tests
│   ├── services/           # Service tests
│   ├── libraries/          # Library tests
│   └── utils/              # Utility tests
├── integration/             # Integration tests
│   ├── auth/               # Authentication flow tests
│   ├── vault/              # Vault operations tests
│   └── platform/           # Platform-specific tests
└── e2e/                    # End-to-end tests
    ├── mobile/             # Mobile E2E tests
    └── extension/          # Extension E2E tests
```

### Mock Strategy

```typescript
// Platform adapter mocks
const createMockPlatformAdapter = (overrides: Partial<PlatformAdapter>) => {
  return {
    getUserSecretKey: jest.fn(() => Promise.resolve('mock-key')),
    storeUserSecretKey: jest.fn(() => Promise.resolve()),
    deleteUserSecretKey: jest.fn(() => Promise.resolve()),
    getPlatformName: jest.fn(() => 'mobile'),
    supportsBiometric: jest.fn(() => true),
    supportsOfflineVault: jest.fn(() => false),
    ...overrides,
  } as PlatformAdapter;
};

// State mocks
const createMockAuthStore = () => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  setUser: jest.fn(),
  setSession: jest.fn(),
  setAuthenticated: jest.fn(),
  setLoading: jest.fn(),
  setError: jest.fn(),
  clearAuth: jest.fn(),
});
```

## Performance Considerations

### Memory Management

```typescript
// Automatic memory clearing
export const clearSessionMemory = async () => {
  // Clear all Zustand stores
  useAuthStore.getState().clearAuth();
  useCredentialsStore.getState().setCredentials([]);
  useBankCardsStore.getState().setBankCards([]);
  useSecureNotesStore.getState().setSecureNotes([]);
  
  // Clear platform-specific memory
  const adapter = await getPlatformAdapter();
  await adapter.clearSession();
};
```

### Lazy Loading

```typescript
// Lazy load platform adapters
export const getPlatformAdapter = async (): Promise<PlatformAdapter> => {
  if (!platformAdapter) {
    const platform = detectPlatform();
    
    if (platform === 'mobile') {
      const { MobilePlatformAdapter } = await import('@mobile/adapters/platform.adapter');
      platformAdapter = new MobilePlatformAdapter();
    } else {
      const { ExtensionPlatformAdapter } = await import('@extension/adapters/platform.adapter');
      platformAdapter = new ExtensionPlatformAdapter();
    }
  }
  
  return platformAdapter;
};
```

## Deployment Architecture

### Build Process

```mermaid
graph TD
    A[Source Code] --> B[TypeScript Compilation]
    B --> C[Platform Detection]
    C --> D[Mobile Build]
    C --> E[Extension Build]
    D --> F[Mobile Bundle]
    E --> G[Extension Bundle]
    F --> H[App Store]
    G --> I[Chrome Web Store]
```

### Platform-Specific Builds

```json
{
  "scripts": {
    "build:mobile": "expo build",
    "build:extension": "vite build",
    "build:all": "npm run build:mobile && npm run build:extension",
    "test:mobile": "jest --config jest.mobile.config.js",
    "test:extension": "jest --config jest.extension.config.js",
    "test:all": "npm run test:mobile && npm run test:extension"
  }
}
```

## Future Architecture Enhancements

### Planned Improvements

1. **Plugin System**: Allow third-party platform adapters
2. **Dynamic Feature Detection**: Runtime platform capability detection
3. **Performance Monitoring**: Cross-platform performance metrics
4. **Security Auditing**: Automated security compliance checks
5. **Offline Sync**: Enhanced offline synchronization
6. **Cross-Platform Migration**: Seamless data migration between platforms

### Architecture Evolution

```mermaid
graph TD
    A[Current: Three-Layer Architecture] --> B[Next: Plugin System]
    B --> C[Future: Dynamic Adapters]
    C --> D[Advanced: AI-Powered Optimization]
    
    A --> E[Current: Manual Testing] --> F[Next: Automated Testing]
    F --> G[Future: AI-Powered Testing]
    
    A --> H[Current: Static Security] --> I[Next: Dynamic Security]
    I --> J[Future: Adaptive Security]
```

## Conclusion

The SimpliPass three-layer architecture provides a robust foundation for cross-platform password management while maintaining security, performance, and developer experience. The clear separation between hooks, services, and libraries ensures maintainability and testability while allowing platform-specific optimizations through the adapter pattern. 