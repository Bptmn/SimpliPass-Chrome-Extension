# Platform-Agnostic Architecture

This directory contains only the essential platform-agnostic abstractions that are truly needed for cross-platform functionality.

## Architecture Overview

### Mobile Platform
- **userSecretKey**: Stored securely in device keychain (iOS Keychain/Android Keystore)
- **Vault**: No local storage - always fetch from Firestore, decrypt, and store in states
- **Data Flow**: Firestore → Decrypt → States → UI

### Extension Platform  
- **userSecretKey**: Stored in RAM + encrypted with device fingerprint in local storage
- **Vault**: Encrypted local storage (chrome.storage.local) + states for fast access
- **Data Flow**: Firestore → Decrypt → States + Local Vault → UI

## Platform Abstractions

### `clipboard.ts`
- **Mobile**: React Native Clipboard API
- **Extension**: Web Clipboard API

### `session.ts`
- **Mobile**: Basic session management
- **Extension**: chrome.storage + memory management

## Platform-Specific Implementations

### Mobile (`@/mobile/utils/`)
- `localStorage.ts`: Uses secure storage (keychain) for sensitive data
- `secureStorage.ts`: Hardware-backed secure storage (Keychain/Keystore)

### Extension (`@/extension/utils/`)
- `localStorage.ts`: Uses chrome.storage.local for secure storage
- `vaultLoader.ts`: Handles vault loading and decryption
- `autofillBridge.ts`: Handles autofill functionality

## Data Flow

### Mobile
1. Login → Derive userSecretKey → Store in keychain
2. Fetch encrypted data from Firestore
3. Decrypt with userSecretKey
4. Store decrypted data in states
5. UI displays from states
6. If states empty → Repeat steps 2-4

### Extension
1. Login → Derive userSecretKey → Store in RAM + encrypted local storage
2. Try to get data from states
3. If states empty → Try local vault
4. If no local vault → Fetch from Firestore
5. Decrypt with userSecretKey
6. Store in states + local vault
7. UI displays from states

## Integration with App Logic

The platform abstractions are integrated with the app logic through the following connections:

### User Logic (`@/core/logic/user.ts`)
- Uses platform-specific userSecretKey storage during login/logout
- Integrates with persistent storage for "Remember me" functionality

### Items Logic (`@/core/logic/items.ts`)
- Uses platform-specific vault storage for cached data
- Integrates with Firestore for data synchronization

### Platform Detection
- Automatically detects mobile vs extension environment
- Throws error for unsupported platforms
- Ensures consistent behavior across platforms

## Key Benefits

1. **Maximum Code Reuse**: Common logic in `@/app` package
2. **Platform-Specific Security**: Each platform uses appropriate security measures
3. **Clean Separation**: Platform-specific code isolated in respective packages
4. **Consistent API**: Same interface across all platforms
5. **Maintainable**: Easy to add new platforms or modify existing ones

## Usage

```typescript
// Always use platform-agnostic APIs
import { 
  writeToClipboard, 
  clearSessionMemory 
} from '@app/core/platform';

// The platform detection and appropriate implementation is automatic
await writeToClipboard('password');
await clearSessionMemory();
```

## Adding New Platform-Specific Features

1. Create a new implementation in the appropriate platform package (`@/mobile` or `@/extension`)
2. Add platform detection logic if needed
3. Export through the main index file
4. Update the adapter factory function
5. Add convenience functions if needed

This architecture ensures that the `@/app` package remains truly platform-agnostic while properly handling the different security and storage requirements of each platform. 