# Platform Adapter

This module provides platform-specific functionality abstraction for SimpliPass, ensuring the app remains platform-agnostic.

## Overview

The platform adapter loads the appropriate implementation (mobile or extension) once at startup and provides a unified interface for all platform-specific operations.

## Usage

### 1. Initialize at App Startup

Call `initializePlatform()` at your app startup to load the correct platform implementation:

```typescript
import { initializePlatform } from '@common/core/platform';

// In your app startup (e.g., App.tsx, main.tsx)
const App = () => {
  useEffect(() => {
    const initApp = async () => {
      try {
        await initializePlatform();
        console.log('Platform initialized successfully');
      } catch (error) {
        console.error('Failed to initialize platform:', error);
      }
    };
    
    initApp();
  }, []);

  return <YourApp />;
};
```

### 2. Use Platform Functions

Once initialized, you can use platform functions directly:

```typescript
import { platform } from '@common/core/platform';

// Storage operations
const secretKey = await platform.getUserSecretKey();
await platform.storeUserSecretKey('my-secret-key');

// Clipboard operations
await platform.copyToClipboard('text to copy');
const clipboardText = await platform.getFromClipboard();

// Platform information
const platformName = platform.getPlatformName(); // 'mobile' | 'extension'
const supportsBiometric = platform.supportsBiometric(); // boolean

// Network operations
const isOnline = await platform.isOnline();
const networkStatus = await platform.getNetworkStatus(); // 'online' | 'offline' | 'unknown'
```

### 3. Direct Adapter Access (Advanced)

If you need direct access to the platform adapter:

```typescript
import { initializePlatformAdapter } from '@common/core/platform';

const adapter = await initializePlatformAdapter();
await adapter.authenticateWithBiometrics();
```

## Platform Detection

The platform is automatically detected based on available APIs:

- **Extension**: Detected when `chrome.storage` is available
- **Mobile**: Detected when `navigator.userAgent` includes 'ReactNative'
- **Default**: Falls back to extension for web builds

## Available Operations

### Storage Operations
- `getUserSecretKey()` - Get user's secret key from secure storage
- `storeUserSecretKey(key)` - Store user's secret key in secure storage
- `deleteUserSecretKey()` - Delete user's secret key from storage

### Session Metadata
- `getSessionMetadata()` - Get session metadata
- `storeSessionMetadata(metadata)` - Store session metadata
- `deleteSessionMetadata()` - Delete session metadata

### Platform Information
- `getPlatformName()` - Get current platform ('mobile' | 'extension')
- `supportsBiometric()` - Check if biometric authentication is supported
- `supportsOfflineVault()` - Check if offline vault storage is supported

### Authentication
- `authenticateWithBiometrics()` - Authenticate with biometrics (mobile only)
- `isBiometricAvailable()` - Check if biometric authentication is available

### Clipboard Operations
- `copyToClipboard(text)` - Copy text to clipboard
- `getFromClipboard()` - Get text from clipboard

### Session Management
- `clearSession()` - Clear all session data
- `getDeviceFingerprint()` - Get device fingerprint for encryption

### Network Operations
- `isOnline()` - Check if device is online
- `getNetworkStatus()` - Get network status ('online' | 'offline' | 'unknown')

### Email Remembering
- `setRememberedEmail(email)` - Set remembered email
- `getRememberedEmail()` - Get remembered email

### Vault Operations (Extension only)
- `getEncryptedVault()` - Get encrypted vault from storage
- `storeEncryptedVault(vault)` - Store encrypted vault
- `deleteEncryptedVault()` - Delete encrypted vault

## Error Handling

The platform adapter throws meaningful errors when:

- Platform initialization fails
- Platform-specific operations fail
- Platform adapter is used before initialization

```typescript
try {
  await platform.copyToClipboard('text');
} catch (error) {
  console.error('Clipboard operation failed:', error.message);
}
```

## Performance Benefits

- **Single initialization**: Platform is detected and loaded once at startup
- **No repeated detection**: Platform functions use the pre-loaded implementation
- **Lazy loading**: Platform-specific code is only loaded when needed
- **Cached instance**: The same adapter instance is reused for all operations 