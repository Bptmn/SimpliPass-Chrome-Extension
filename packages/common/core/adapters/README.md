# Adapters Layer

This layer provides provider-agnostic interfaces for authentication, database operations, and platform-specific functionality. This allows you to easily swap providers without changing your application code.

## Architecture

The adapters follow the **Adapter Pattern** to abstract away the specific implementation details of different providers:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │───▶│   Adapter       │───▶│   Provider      │
│   (Business     │    │   (Interface)   │    │   (Firebase,    │
│    Logic)       │    │                 │    │    MongoDB,     │
└─────────────────┘    └─────────────────┘    │    etc.)        │
                                              └─────────────────┘
```

## Available Adapters

### Auth Adapter (`auth.adapter.ts`)

Provides a unified interface for authentication operations:

```typescript
interface AuthAdapter {
  login(email: string, password: string): Promise<string>;
  isAuthenticated(): Promise<boolean>;
  signOut(): Promise<void>;
  storeUserSecretKey(userSecretKey: string): Promise<void>;
  checkAuthenticationStatus(): Promise<any>;
  fetchUserSalt(): Promise<string>;
}
```

**Current Implementation**: AWS Cognito + Firebase Auth

### Database Adapter (`database.adapter.ts`)

Provides a unified interface for database operations:

```typescript
interface DatabaseAdapter {
  getCollection<T>(collectionPath: string): Promise<T[]>;
  getDocument<T>(docPath: string): Promise<T | null>;
  addDocument<T>(collectionPath: string, data: T): Promise<string>;
  updateDocument<T>(docPath: string, data: Partial<T>): Promise<void>;
  deleteDocument(docPath: string): Promise<void>;
  generateItemId(): string;
}
```

**Current Implementation**: Firebase Firestore

### Platform Adapter (`platform.adapter.ts`)

Provides a unified interface for platform-specific functionality:

```typescript
interface PlatformAdapter {
  getUserSecretKey(): Promise<string | null>;
  storeUserSecretKey(key: string): Promise<void>;
  deleteUserSecretKey(): Promise<void>;
  getSessionMetadata(): Promise<any>;
  storeSessionMetadata(metadata: any): Promise<void>;
  deleteSessionMetadata(): Promise<void>;
  getPlatformName(): 'mobile' | 'extension';
  supportsBiometric(): boolean;
  supportsOfflineVault(): boolean;
  copyToClipboard(text: string): Promise<void>;
  getFromClipboard(): Promise<string>;
  clearSession(): Promise<void>;
  getDeviceFingerprint(): Promise<string>;
  isOnline(): Promise<boolean>;
  getNetworkStatus(): Promise<'online' | 'offline' | 'unknown'>;
}
```

**Current Implementation**: Dynamic loading of mobile or extension platform adapters

## Usage

### Importing Adapters

```typescript
import { auth, db, platform, initializePlatform } from '@common/core/adapters';

// Initialize platform adapter at app startup
await initializePlatform();

// Use auth adapter
const result = await auth.login('user@example.com', 'password');
if (result.mfaRequired) {
  await auth.confirmMfa('123456');
}

// Use database adapter
const users = await db.getCollection('users');
const user = await db.getDocument('users/123');

// Use platform adapter
const secretKey = await platform.getUserSecretKey();
await platform.copyToClipboard('text to copy');
const isOnline = await platform.isOnline();
```

### Swapping Providers

To swap providers, simply implement the adapter interface and update the export:

#### Example: Switch to Mock Database

```typescript
// In database.adapter.ts
import { mockDb } from './mock.adapter';

// Change this line:
export const db: DatabaseAdapter = mockDb;
```

#### Example: Switch to MongoDB

```typescript
// Create mongodb.adapter.ts
export const mongoDb: DatabaseAdapter = {
  getCollection: async (collectionPath) => {
    // MongoDB implementation
  },
  // ... other methods
};

// In database.adapter.ts
import { mongoDb } from './mongodb.adapter';
export const db: DatabaseAdapter = mongoDb;
```

#### Example: Switch to Different Auth Provider

```typescript
// Create auth0.adapter.ts
export const auth0Auth: AuthAdapter = {
  login: async (email, password) => {
    // Auth0 implementation
  },
  // ... other methods
};

// In auth.adapter.ts
import { auth0Auth } from './auth0.adapter';
export const auth: AuthAdapter = auth0Auth;
```

#### Example: Switch to Different Platform

```typescript
// Create web.adapter.ts
export const webPlatform: PlatformAdapter = {
  getUserSecretKey: async () => {
    // Web-specific implementation
  },
  // ... other methods
};

// In platform.adapter.ts
export const platform: PlatformAdapter = webPlatform;
```

## Benefits

1. **Provider Agnostic**: Your application code doesn't depend on specific providers
2. **Easy Testing**: Use mock adapters for testing
3. **Flexible Migration**: Switch providers without changing business logic
4. **Consistent Interface**: Same API regardless of underlying provider
5. **Type Safety**: TypeScript ensures correct implementation
6. **Platform Independence**: Core logic works across mobile and extension platforms

## Testing

Use the mock adapters for testing:

```typescript
import { mockDb } from '@common/core/database/mock.adapter';

// In your tests
jest.mock('@common/core/adapters', () => ({
  db: mockDb,
  auth: mockAuth,
  platform: mockPlatform,
}));
```

## Adding New Providers

1. Create a new adapter file (e.g., `mongodb.adapter.ts`)
2. Implement the interface (`DatabaseAdapter`, `AuthAdapter`, or `PlatformAdapter`)
3. Update the main adapter file to export your new implementation
4. Your application code remains unchanged!

## Migration Strategy

When migrating from one provider to another:

1. Implement the new provider adapter
2. Test thoroughly with the new adapter
3. Update the export in the main adapter file
4. Deploy the change
5. Your application continues working without any code changes! 