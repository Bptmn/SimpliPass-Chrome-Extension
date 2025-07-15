# Hooks Layer (Layer 1: UI Layer)

This directory contains React hooks that handle UI state and user interactions. These hooks provide simple, readable interfaces for components while abstracting complex business logic.

## Purpose

Hooks in this layer serve as the **UI Layer** in our three-layer architecture:

```
UI Components → Hooks → Services → Libraries
```

## Characteristics

- ✅ **Simple and Readable**: Easy to understand and use
- ✅ **UI State Management**: Handle loading states, errors, and user interactions
- ✅ **Error Handling**: Provide clear error messages to users
- ✅ **Data Abstraction**: Return data from memory (Zustand states)
- ✅ **Platform Agnostic**: Work across mobile, extension, and web platforms

## Available Hooks

### Authentication Hooks

#### `useLoginFlow`
Handles the complete login flow with error handling and loading states.

```typescript
const { login, isLoading, error, clearError } = useLoginFlow();

const handleLogin = async () => {
  await login(email, password);
};
```

#### `useSecretKeyCheck`
Checks if the user has a valid secret key for authentication.

```typescript
const { hasSecretKey, isLoading } = useSecretKeyCheck();
```

### Data Management Hooks

#### `useRefreshData`
Refreshes data from external sources and updates local state.

```typescript
const { refresh, isLoading } = useRefreshData();

const handleRefresh = async () => {
  await refresh();
};
```

#### `useCredentials`
Manages credential operations (add, update, delete, copy).

```typescript
const { 
  addCredential, 
  updateCredential, 
  deleteCredential, 
  copyPassword 
} = useCredentials();

const handleAddCredential = async (credential) => {
  await addCredential(credential);
};
```

## Usage Guidelines

### 1. Always Handle Loading States
```typescript
const { login, isLoading, error } = useLoginFlow();

if (isLoading) {
  return <LoadingSpinner />;
}
```

### 2. Provide Clear Error Messages
```typescript
const { login, error } = useLoginFlow();

if (error) {
  return <ErrorMessage message={error} />;
}
```

### 3. Use Destructuring for Clean Code
```typescript
// ✅ Good
const { login, isLoading, error } = useLoginFlow();

// ❌ Avoid
const loginFlow = useLoginFlow();
const login = loginFlow.login;
```

### 4. Handle Async Operations Properly
```typescript
const handleLogin = async () => {
  try {
    await login(email, password);
    // Success handling
  } catch (error) {
    // Error handling
  }
};
```

## Testing Hooks

### Example Test
```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useLoginFlow } from './useLoginFlow';

describe('useLoginFlow', () => {
  it('should handle successful login', async () => {
    const { result } = renderHook(() => useLoginFlow());
    
    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });
});
```

## Error Handling

Hooks should provide clear error messages and handle errors gracefully:

```typescript
const { login, error } = useLoginFlow();

// Error messages should be user-friendly
if (error) {
  switch (error.type) {
    case 'AUTH_ERROR':
      return 'Invalid email or password';
    case 'NETWORK_ERROR':
      return 'Network connection failed';
    default:
      return 'An unexpected error occurred';
  }
}
```

## State Management

Hooks should work with Zustand states for data persistence:

```typescript
// Hooks read from states
const credentials = useCredentialsStore(state => state.credentials);

// Hooks update states through services
const { addCredential } = useCredentials();
await addCredential(newCredential); // Updates state automatically
```

## Platform Considerations

Hooks should be platform-agnostic and work across:

- **Mobile** (React Native)
- **Extension** (Chrome Extension)
- **Web** (React)

Platform-specific logic should be handled in the libraries layer.

## Development Guidelines

1. **Keep Hooks Simple**: Focus on UI concerns, not business logic
2. **Handle All States**: Loading, error, success, and idle states
3. **Provide Clear APIs**: Easy to understand and use
4. **Test Thoroughly**: Each hook should have comprehensive tests
5. **Document Usage**: Clear examples and documentation

## Integration with Other Layers

### Hooks → Services
Hooks call services for business logic:

```typescript
const { login } = useLoginFlow();
// Internally calls loginUser service
```

### Hooks → States
Hooks read from and update Zustand states:

```typescript
const credentials = useCredentialsStore(state => state.credentials);
// Reads from state

const { addCredential } = useCredentials();
await addCredential(credential);
// Updates state through service
```

### Hooks → Components
Components use hooks for data and interactions:

```typescript
const MyComponent = () => {
  const { login, isLoading, error } = useLoginFlow();
  
  return (
    <LoginForm 
      onSubmit={login}
      isLoading={isLoading}
      error={error}
    />
  );
};
``` 