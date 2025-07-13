# Platform Adapters Documentation

## Overview

The platform adapter system provides a unified interface for platform-specific functionality while keeping the core application logic platform-agnostic. This ensures that the `app/` and `core/` packages can work consistently across mobile and extension platforms.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   App/Core      │    │  Platform       │    │   Platform      │
│   Logic         │◄──►│  Adapter        │◄──►│   Specific      │
│                 │    │  Interface      │    │   Implementation│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Core Principles

1. **Platform Agnostic**: App and core logic never directly access platform APIs
2. **Single Interface**: All platform functionality goes through the adapter interface
3. **Consistent API**: Same methods work across all platforms
4. **Error Handling**: Platform-specific errors are abstracted into common error types

## Platform Adapter Interface

### Storage Operations

```typescript
interface PlatformAdapter {
  // User secret key management
  getUserSecretKey(): Promise<string | null>;
  storeUserSecretKey(key: string): Promise<void>;
  deleteUserSecretKey(): Promise<void>;
  
  // Vault operations (Extension only)
  getEncryptedVault?(): Promise<EncryptedVault | null>;
  storeEncryptedVault?(vault: EncryptedVault): Promise<void>;
  deleteEncryptedVault?(): Promise<void>;
}
```

### Platform Information

```typescript
interface PlatformAdapter {
  getPlatformName(): 'mobile' | 'extension';
  supportsBiometric(): boolean;
  supportsOfflineVault(): boolean;
}
```

### Authentication

```typescript
interface PlatformAdapter {
  authenticateWithBiometrics?(): Promise<boolean>;
  isBiometricAvailable?(): Promise<boolean>;
}
```

### Clipboard Operations

```typescript
interface PlatformAdapter {
  copyToClipboard(text: string): Promise<void>;
  getFromClipboard(): Promise<string>;
}
```

### Session Management

```typescript
interface PlatformAdapter {
  clearSession(): Promise<void>;
  getDeviceFingerprint(): Promise<string>;
}
```

### Network Operations

```typescript
interface PlatformAdapter {
  isOnline(): Promise<boolean>;
  getNetworkStatus(): Promise<'online' | 'offline' | 'unknown'>;
}
```

## Platform Implementations

### Mobile Platform Adapter

**Location**: `packages/mobile/adapters/platform.adapter.ts`

**Features**:
- Uses iOS Keychain / Android Keystore for secure storage
- Supports biometric authentication
- No local vault (always fetches from Firestore)
- Automatic memory clearing on background

**Key Methods**:
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
}
```

### Extension Platform Adapter

**Location**: `packages/extension/adapters/platform.adapter.ts`

**Features**:
- Uses Chrome storage for encrypted vault
- Device fingerprint-based encryption
- Background script owns decrypted vault
- Content script receives only needed data

**Key Methods**:
```typescript
class ExtensionPlatformAdapter implements PlatformAdapter {
  async getUserSecretKey() {
    const encrypted = await chrome.storage.local.get('userSecretKey');
    return this.decryptFromStorage(encrypted.userSecretKey);
  }
  
  async storeUserSecretKey(key: string) {
    const encrypted = await this.encryptForStorage(key);
    return chrome.storage.local.set({ userSecretKey: encrypted });
  }
  
  async getEncryptedVault() {
    return chrome.storage.local.get('encryptedVault');
  }
}
```

## Adapter Factory

**Location**: `packages/app/core/adapters/adapter.factory.ts`

The adapter factory automatically detects the current platform and returns the appropriate adapter implementation.

```typescript
import { getPlatformAdapter } from '@app/core/adapters/adapter.factory';

// Get the appropriate adapter for the current platform
const adapter = await getPlatformAdapter();

// Use platform-agnostic code
const userSecretKey = await adapter.getUserSecretKey();
await adapter.copyToClipboard('password123');
```

## Platform Detection

**Location**: `packages/app/core/adapters/platform.detection.ts`

Automatically detects whether the code is running on mobile or extension:

```typescript
import { detectPlatform } from '@app/core/adapters/platform.detection';

const platform = detectPlatform(); // 'mobile' | 'extension'
```

## Error Handling

All platform adapters throw standardized error types:

```typescript
export class PlatformError extends Error {
  constructor(
    message: string,
    public code: string,
    public platform: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'PlatformError';
  }
}

export class BiometricError extends PlatformError {
  constructor(message: string, platform: string, originalError?: Error) {
    super(message, 'BIOMETRIC_ERROR', platform, originalError);
    this.name = 'BiometricError';
  }
}

export class StorageError extends PlatformError {
  constructor(message: string, platform: string, originalError?: Error) {
    super(message, 'STORAGE_ERROR', platform, originalError);
    this.name = 'StorageError';
  }
}
```

## Usage Examples

### Authentication Flow

```typescript
import { getPlatformAdapter } from '@app/core/adapters/adapter.factory';

async function loginUser(email: string, password: string) {
  const adapter = await getPlatformAdapter();
  
  // Store user secret key securely
  const userSecretKey = deriveKey(password, salt);
  await adapter.storeUserSecretKey(userSecretKey);
  
  // Biometric authentication if supported
  if (adapter.supportsBiometric()) {
    const isAvailable = await adapter.isBiometricAvailable?.();
    if (isAvailable) {
      const authenticated = await adapter.authenticateWithBiometrics?.();
      if (!authenticated) {
        throw new BiometricError('Authentication failed', adapter.getPlatformName());
      }
    }
  }
}
```

### Clipboard Operations

```typescript
import { getPlatformAdapter } from '@app/core/adapters/adapter.factory';

async function copyPassword(password: string) {
  const adapter = await getPlatformAdapter();
  await adapter.copyToClipboard(password);
}
```

### Vault Management

```typescript
import { getPlatformAdapter } from '@app/core/adapters/adapter.factory';

async function loadVault() {
  const adapter = await getPlatformAdapter();
  
  if (adapter.getPlatformName() === 'mobile') {
    // Mobile: Always fetch from Firestore
    return await fetchFromFirestore();
  } else {
    // Extension: Try local vault first, then Firestore
    const localVault = await adapter.getEncryptedVault?.();
    if (localVault) {
      return await decryptVault(localVault);
    }
    return await fetchFromFirestore();
  }
}
```

## Testing

Platform adapters should be tested with platform-specific mocks:

```typescript
// Mock mobile platform
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve('mock-key')),
  setItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock extension platform
jest.mock('chrome', () => ({
  storage: {
    local: {
      get: jest.fn(() => Promise.resolve({ userSecretKey: 'mock-key' })),
      set: jest.fn(() => Promise.resolve()),
    },
  },
}));
```

## Best Practices

1. **Never access platform APIs directly** from app/core logic
2. **Always use the adapter interface** for platform-specific operations
3. **Handle errors consistently** using the standardized error types
4. **Test with platform mocks** to ensure cross-platform compatibility
5. **Document platform-specific behavior** in adapter implementations

## Migration Guide

When adding new platform-specific functionality:

1. **Add method to interface** in `platform.adapter.ts`
2. **Implement in both adapters** (mobile and extension)
3. **Add comprehensive tests** for both implementations
4. **Update documentation** with usage examples
5. **Consider backward compatibility** for existing code

## Troubleshooting

### Common Issues

1. **Platform detection fails**: Check that platform detection logic is up to date
2. **Adapter not found**: Ensure adapter factory is properly configured
3. **Method not implemented**: Verify both platform adapters implement the interface
4. **Type errors**: Check that interface and implementations match

### Debug Tips

```typescript
import { getPlatformAdapter } from '@app/core/adapters/adapter.factory';

// Debug platform detection
const adapter = await getPlatformAdapter();
console.log('Platform:', adapter.getPlatformName());
console.log('Supports biometric:', adapter.supportsBiometric());
console.log('Supports offline vault:', adapter.supportsOfflineVault());
``` 