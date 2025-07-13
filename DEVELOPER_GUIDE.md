# SimpliPass Developer Guide

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- React Native development environment (for mobile)
- Chrome extension development environment (for extension)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd SimpliPass-React-ReactNative

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test
```

## Architecture Overview

### Core Principles

1. **Platform Agnostic**: App and core logic never directly access platform APIs
2. **Single Source of Truth**: All UI data comes from Zustand states
3. **Adapter Pattern**: Platform-specific code is isolated in adapters
4. **Security First**: No decrypted data is ever persisted

### Package Structure

```
packages/
├── app/                    # Shared UI Components
│   ├── components/         # React Native components
│   ├── screens/           # Screen components
│   └── core/              # App-specific logic
│       ├── adapters/      # Platform adapter interface
│       ├── logic/         # Business logic
│       ├── states/        # Zustand stores
│       └── types/         # Type definitions
├── mobile/                # Mobile-specific code
├── extension/             # Extension-specific code
└── shared/                # Shared utilities
```

## Development Workflow

### 1. Adding New Features

When adding new features, follow this workflow:

#### Step 1: Define Types
```typescript
// packages/app/core/types/shared.types.ts
export interface NewFeature {
  id: string;
  title: string;
  data: any;
}
```

#### Step 2: Add to State
```typescript
// packages/app/core/states/newFeature.state.ts
import { create } from 'zustand';

interface NewFeatureStore {
  items: NewFeature[];
  isLoading: boolean;
  error: string | null;
  
  setItems: (items: NewFeature[]) => void;
  addItem: (item: NewFeature) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useNewFeatureStore = create<NewFeatureStore>((set) => ({
  items: [],
  isLoading: false,
  error: null,
  
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ 
    items: [...state.items, item] 
  })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
```

#### Step 3: Add Business Logic
```typescript
// packages/app/core/logic/newFeature.ts
import { getPlatformAdapter } from '../adapters/adapter.factory';
import { useNewFeatureStore } from '../states/newFeature.state';

export const createNewFeature = async (data: any) => {
  try {
    const adapter = await getPlatformAdapter();
    
    // Platform-agnostic logic
    const newFeature = {
      id: generateId(),
      title: data.title,
      data: data.data,
    };
    
    // Update state
    useNewFeatureStore.getState().addItem(newFeature);
    
    return { success: true, data: newFeature };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};
```

#### Step 4: Create UI Component
```typescript
// packages/app/components/NewFeatureComponent.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useNewFeatureStore } from '@app/core/states/newFeature.state';

export const NewFeatureComponent: React.FC = () => {
  const { items, isLoading, error } = useNewFeatureStore();
  
  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;
  
  return (
    <View>
      {items.map(item => (
        <Text key={item.id}>{item.title}</Text>
      ))}
    </View>
  );
};
```

### 2. Platform-Specific Features

When adding platform-specific functionality:

#### Step 1: Add to Adapter Interface
```typescript
// packages/app/core/adapters/platform.adapter.ts
export interface PlatformAdapter {
  // ... existing methods
  
  // New platform-specific method
  newPlatformFeature?(): Promise<any>;
}
```

#### Step 2: Implement in Both Adapters
```typescript
// packages/mobile/adapters/platform.adapter.ts
class MobilePlatformAdapter implements PlatformAdapter {
  // ... existing methods
  
  async newPlatformFeature() {
    // Mobile-specific implementation
    return await MobileSpecificAPI.doSomething();
  }
}
```

```typescript
// packages/extension/adapters/platform.adapter.ts
class ExtensionPlatformAdapter implements PlatformAdapter {
  // ... existing methods
  
  async newPlatformFeature() {
    // Extension-specific implementation
    return await chrome.runtime.sendMessage({ type: 'newFeature' });
  }
}
```

#### Step 3: Use in Business Logic
```typescript
// packages/app/core/logic/platformFeature.ts
import { getPlatformAdapter } from '../adapters/adapter.factory';

export const usePlatformFeature = async () => {
  const adapter = await getPlatformAdapter();
  
  if (adapter.newPlatformFeature) {
    return await adapter.newPlatformFeature();
  }
  
  throw new Error('Platform feature not supported');
};
```

### 3. Testing New Features

#### Unit Tests
```typescript
// packages/app/core/logic/__tests__/newFeature.test.ts
import { createNewFeature } from '../newFeature';

describe('NewFeature', () => {
  it('should create new feature successfully', async () => {
    const result = await createNewFeature({
      title: 'Test Feature',
      data: { test: true },
    });
    
    expect(result.success).toBe(true);
    expect(result.data.title).toBe('Test Feature');
  });
  
  it('should handle errors gracefully', async () => {
    // Mock adapter to throw error
    const result = await createNewFeature({
      title: 'Error Test',
      data: null,
    });
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

#### Integration Tests
```typescript
// packages/app/core/logic/__tests__/newFeature.integration.test.ts
import { createNewFeature } from '../newFeature';
import { useNewFeatureStore } from '../../states/newFeature.state';

describe('NewFeature Integration', () => {
  it('should update state when feature is created', async () => {
    const result = await createNewFeature({
      title: 'Integration Test',
      data: { test: true },
    });
    
    expect(result.success).toBe(true);
    
    const state = useNewFeatureStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].title).toBe('Integration Test');
  });
});
```

## Best Practices

### 1. State Management

#### ✅ Do
```typescript
// Use Zustand for all state
const { user, login, logout } = useAuthStore();

// UI only reads from state
const isAuthenticated = useAuthStore(state => state.isAuthenticated);

// Business logic updates state
const handleLogin = async (credentials) => {
  const result = await loginUser(credentials);
  if (result.success) {
    login(result.data);
  }
};
```

#### ❌ Don't
```typescript
// Don't access storage directly from UI
const userKey = await SecureStore.getItemAsync('userKey');

// Don't bypass state management
const user = await fetchUserFromAPI();
```

### 2. Platform Adapters

#### ✅ Do
```typescript
// Use adapter factory
const adapter = await getPlatformAdapter();
const userKey = await adapter.getUserSecretKey();

// Check platform capabilities
if (adapter.supportsBiometric()) {
  await adapter.authenticateWithBiometrics();
}
```

#### ❌ Don't
```typescript
// Don't access platform APIs directly
if (Platform.OS === 'ios') {
  await SecureStore.setItemAsync('key', value);
}

// Don't check platform directly
if (typeof chrome !== 'undefined') {
  await chrome.storage.local.set({ key: value });
}
```

### 3. Error Handling

#### ✅ Do
```typescript
// Use standardized error types
try {
  await adapter.authenticateWithBiometrics();
} catch (error) {
  throw new BiometricError('Authentication failed', adapter.getPlatformName(), error);
}

// Handle errors gracefully
const result = await someOperation();
if (!result.success) {
  console.error('Operation failed:', result.error);
  // Show user-friendly error message
}
```

#### ❌ Don't
```typescript
// Don't ignore errors
await adapter.authenticateWithBiometrics();

// Don't expose raw errors to users
catch (error) {
  showError(error.message); // May contain sensitive info
}
```

### 4. Type Safety

#### ✅ Do
```typescript
// Use proper TypeScript types
interface Credential {
  id: string;
  title: string;
  username: string;
  password: string;
}

// Use type guards
function isCredential(obj: any): obj is Credential {
  return obj && typeof obj.id === 'string' && typeof obj.title === 'string';
}
```

#### ❌ Don't
```typescript
// Don't use any
const credential: any = await getCredential();

// Don't ignore type errors
// @ts-ignore
const result = await someFunction();
```

## Debugging

### 1. Platform Detection

```typescript
import { detectPlatform } from '@app/core/adapters/platform.detection';

console.log('Current platform:', detectPlatform());
```

### 2. Adapter Debugging

```typescript
import { getPlatformAdapter } from '@app/core/adapters/adapter.factory';

const adapter = await getPlatformAdapter();
console.log('Platform:', adapter.getPlatformName());
console.log('Supports biometric:', adapter.supportsBiometric());
console.log('Supports offline vault:', adapter.supportsOfflineVault());
```

### 3. State Debugging

```typescript
import { useAuthStore } from '@app/core/states/auth.state';

// Subscribe to state changes
useAuthStore.subscribe((state) => {
  console.log('Auth state changed:', state);
});
```

### 4. Network Debugging

```typescript
import { getPlatformAdapter } from '@app/core/adapters/adapter.factory';

const adapter = await getPlatformAdapter();
const isOnline = await adapter.isOnline();
const networkStatus = await adapter.getNetworkStatus();

console.log('Online:', isOnline);
console.log('Network status:', networkStatus);
```

## Performance Optimization

### 1. Lazy Loading

```typescript
// Lazy load heavy components
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

// Lazy load platform adapters
const adapter = await getPlatformAdapter(); // Already lazy loaded
```

### 2. State Optimization

```typescript
// Use selectors to prevent unnecessary re-renders
const user = useAuthStore(state => state.user);
const isAuthenticated = useAuthStore(state => state.isAuthenticated);

// Don't select entire state
// ❌ const authState = useAuthStore(); // This causes re-renders
```

### 3. Memory Management

```typescript
// Clear memory on logout
export const logout = async () => {
  // Clear all states
  useAuthStore.getState().clearAuth();
  useCredentialsStore.getState().setCredentials([]);
  
  // Clear platform-specific memory
  const adapter = await getPlatformAdapter();
  await adapter.clearSession();
};
```

## Security Guidelines

### 1. Data Encryption

```typescript
// Always encrypt sensitive data
const encryptedData = await encryptData(sensitiveData, userKey);
await adapter.storeUserSecretKey(encryptedData);

// Never store decrypted data
// ❌ await adapter.storeUserSecretKey(plainTextData);
```

### 2. Key Management

```typescript
// Use secure key derivation
const userKey = await deriveUserKey(password, salt);

// Clear keys from memory
const clearKeys = () => {
  // Overwrite key in memory
  userKey = null;
};
```

### 3. Session Management

```typescript
// Implement proper session timeouts
const sessionTimeout = 30 * 60 * 1000; // 30 minutes

setTimeout(() => {
  logout();
}, sessionTimeout);
```

## Deployment

### 1. Mobile Build

```bash
# Build for iOS
npm run build:mobile:ios

# Build for Android
npm run build:mobile:android

# Build for both
npm run build:mobile
```

### 2. Extension Build

```bash
# Build extension
npm run build:extension

# Build for development
npm run build:extension:dev
```

### 3. Testing Before Deployment

```bash
# Run all tests
npm test

# Run linting
npm run lint

# Run type checking
npm run type-check

# Build all packages
npm run build:all
```

## Troubleshooting

### Common Issues

#### 1. Platform Detection Fails
```typescript
// Check platform detection logic
import { detectPlatform } from '@app/core/adapters/platform.detection';
console.log('Detected platform:', detectPlatform());
```

#### 2. Adapter Not Found
```typescript
// Check adapter factory
import { getPlatformAdapter } from '@app/core/adapters/adapter.factory';
const adapter = await getPlatformAdapter();
console.log('Adapter:', adapter.constructor.name);
```

#### 3. State Not Updating
```typescript
// Check state subscriptions
useAuthStore.subscribe((state) => {
  console.log('Auth state:', state);
});
```

#### 4. Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
npm run clean
npm run build
```

### Getting Help

1. **Check the documentation** in `packages/app/core/`
2. **Review existing code** for patterns
3. **Run tests** to understand expected behavior
4. **Check platform-specific logs** for errors
5. **Use debugging tools** to trace issues

## Contributing

### Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Add comprehensive tests
- Update documentation for new features
- Use conventional commit messages

### Pull Request Process

1. Create feature branch from main
2. Implement feature with tests
3. Update documentation
4. Run all tests and builds
5. Submit pull request with description

### Review Checklist

- [ ] Code follows architecture patterns
- [ ] Tests are comprehensive
- [ ] Documentation is updated
- [ ] No platform-specific code in app/core
- [ ] Error handling is proper
- [ ] Performance is considered
- [ ] Security is maintained 