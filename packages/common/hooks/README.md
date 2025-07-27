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
- ✅ **Numbered Steps**: Complex operations follow Step 1, Step 2, Step 3... pattern

## Available Hooks

### Authentication Hooks



#### `useAppState`
Reads current app state without triggering initialization (4 steps).

```typescript
const { 
  state, 
  user, 
  vault, 
  refreshState, 
  clearError 
} = useAppState();
```

#### `useLoginPage`
Handles login page UI state and user interactions (3 steps).

```typescript
const { login, isLoading, error, clearError } = useLoginPage();

const handleLogin = async () => {
  await login(email, password);
};
```

#### `useLogoutFlow`
Handles logout process with 4 steps.

```typescript
const { logout, isLoading, error } = useLogoutFlow();
```

#### `useReEnterPassword`
Handles password re-entry flow with 4 steps.

```typescript
const { reEnterPassword, isLoading, error, clearError } = useReEnterPassword();
```

### Data Management Hooks

#### `useItems`
Provides real-time access to items data with automatic UI updates (3 steps).

```typescript
const { 
  items, 
  credentials, 
  bankCards, 
  secureNotes, 
  loading, 
  error 
} = useItems();
```

#### `useItems`
Provides comprehensive items functionality including data access, CRUD operations, search, and user management (13 steps).

```typescript
const { 
  // Data
  items, 
  credentials, 
  bankCards, 
  secureNotes,
  
  // User data
  user,
  
  // Search and filtering
  searchValue,
  filteredItems,
  filteredCredentials,
  filteredBankCards,
  filteredSecureNotes,
  
  // Selection state
  selected,
  selectedBankCard,
  selectedSecureNote,
  
  // State
  loading,
  error,
  isActionLoading,
  
  // Actions
  addItem,
  editItem,
  deleteItem,
  setSearchValue,
  clearSearch,
  setSelected,
  setSelectedBankCard,
  setSelectedSecureNote,
  refreshData,
  clearError,
} = useItems();
```

#### `useUser`
Provides simple access to user data from secure storage (5 steps).

```typescript
const { 
  user, 
  isLoading, 
  error, 
  refreshUser, 
  clearUser 
} = useUser();
```

#### `useAccount`
Provides account management functionality including logout and session management (4 steps).

```typescript
const { 
  user, 
  isLoading, 
  error, 
  logout, 
  getCurrentUser, 
  clearError 
} = useAccount();
```

#### `useRefreshData`
Provides simple interface for data refresh operations (2 steps).

```typescript
const { refreshData, refresh, isLoading } = useRefreshData();
```

#### `useManualRefresh`
Provides manual refresh functionality for UI components (5 steps).

```typescript
const { 
  refreshAllData, 
  refreshUserOnly, 
  refreshVaultOnly, 
  isRefreshing, 
  error, 
  clearError 
} = useManualRefresh();
```

### UI State Hooks



#### `usePasswordGenerator`
Handles password generation, strength checking, and regeneration (5 steps).

```typescript
const { 
  hasUppercase, 
  hasNumbers, 
  hasSymbols, 
  hasLowercase, 
  length, 
  password, 
  strength, 
  setHasUppercase, 
  setHasNumbers, 
  setHasSymbols, 
  setHasLowercase, 
  setLength, 
  handleRegenerate, 
  handleCopyPassword 
} = usePasswordGenerator();
```

#### `useHelperBar`
Handles navigation and button text based on current page (4 steps).

```typescript
const { 
  addButtonText, 
  handleAdd, 
  handleFAQ, 
  handleRefresh 
} = useHelperBar(currentPage);
```

#### `useInputLogic`
Handles password visibility, content size, and strength calculations (4 steps).

```typescript
const { 
  showPassword, 
  inputHeight, 
  togglePasswordVisibility, 
  handleContentSizeChange, 
  getStrengthColor 
} = useInputLogic(type);
```

#### `useLazyCredentialIcon`
Handles favicon loading, domain parsing, and fallback logic (6 steps).

```typescript
const { 
  faviconUrl, 
  isFaviconLoaded, 
  showFavicon, 
  placeholderLetter, 
  handleFaviconLoad, 
  handleFaviconError 
} = useLazyCredentialIcon(url, title);
```

#### `useToast`
Provides access to toast notifications.

```typescript
const { showToast } = useToast();
```



#### `useSettings`
Provides settings management functionality (5 steps).

```typescript
const { 
  settings, 
  isLoading, 
  error, 
  updateSettings, 
  toggleDarkMode, 
  setLockTimeout, 
  toggleAutoLock, 
  toggleBiometric, 
  clearError 
} = useSettings();
```

#### `useDebouncedValue`
Debounces a value by a given delay for search inputs.

```typescript
const debouncedValue = useDebouncedValue(value, 300);
```

### Chrome Extension Specific Hooks

#### `useCurrentTabDomain`
Provides current tab domain functionality for Chrome extension (5 steps).

```typescript
const { 
  currentDomain, 
  isLoading, 
  error, 
  refreshDomain, 
  clearError 
} = useCurrentTabDomain();
```

#### `useAutofill`
Provides comprehensive autofill functionality for Chrome extension (8 steps).

```typescript
const { 
  isAutofilling,
  suggestions,
  isLoading,
  error, 
  autofillCredential,
  refreshSuggestions,
  clearError 
} = useAutofill();
```

## Usage Guidelines

### 1. Always Handle Loading States
```typescript
const { login, isLoading, error } = useLoginPage();

if (isLoading) {
  return <LoadingSpinner />;
}
```

### 2. Provide Clear Error Messages
```typescript
const { login, error } = useLoginPage();

if (error) {
  return <ErrorMessage message={error} />;
}
```

### 3. Use Destructuring for Clean Code
```typescript
// ✅ Good
const { login, isLoading, error } = useLoginPage();

// ❌ Avoid
const loginPage = useLoginPage();
const login = loginPage.login;
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

### 5. Follow Numbered Steps Pattern
All hooks with complex operations follow Step 1, Step 2, Step 3... pattern for clarity.

## Testing Hooks

### Example Test
```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useLoginPage } from './useLoginPage';

describe('useLoginPage', () => {
  it('should handle successful login', async () => {
    const { result } = renderHook(() => useLoginPage());
    
    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });
});
```

## Error Handling

Hooks provide clear error messages and handle errors gracefully:

```typescript
const { login, error } = useLoginPage();

// Error messages are user-friendly
if (error) {
  return <ErrorMessage message={error} />;
}
```

## State Management

Hooks work with centralized state managers:

```typescript
// Hooks read from state managers
const { items, loading } = useItems();

// Hooks update states through services
const { refreshData } = useHomePage();
await refreshData(); // Updates state automatically
```

## Platform Considerations

Hooks are platform-agnostic and work across:

- **Mobile** (React Native)
- **Extension** (Chrome Extension)
- **Web** (React)

Platform-specific logic is handled in the libraries layer.

## Development Guidelines

1. **Keep Hooks Simple**: Focus on UI concerns, not business logic
2. **Handle All States**: Loading, error, success, and idle states
3. **Provide Clear APIs**: Easy to understand and use
4. **Test Thoroughly**: Each hook should have comprehensive tests
5. **Document Usage**: Clear examples and documentation
6. **Follow Numbered Steps**: Complex operations use Step 1, Step 2, Step 3...
7. **Layer Separation**: Only UI logic, business logic goes to services

## Integration with Other Layers

### Hooks → Services
Hooks call services for business logic:

```typescript
const { login } = useLoginPage();
// Internally calls auth.login service
```

### Hooks → State Managers
Hooks read from and update state managers:

```typescript
const { items } = useItems();
// Reads from itemsStateManager

const { refreshData } = useHomePage();
await refreshData(); // Updates state through service
```

### Hooks → Components
Components use hooks for data and interactions:

```typescript
const MyComponent = () => {
  const { login, isLoading, error } = useLoginPage();
  
  return (
    <LoginForm 
      onSubmit={login}
      isLoading={isLoading}
      error={error}
    />
  );
};
```

## Testing Requirements

All hooks must have comprehensive tests covering:

1. **Initial State**: Verify correct initial state
2. **Loading States**: Test loading state transitions
3. **Error Handling**: Test error scenarios
4. **Success Scenarios**: Test successful operations
5. **Cleanup**: Test proper cleanup on unmount
6. **Async Operations**: Test async function calls
7. **State Updates**: Test state changes
8. **Event Handlers**: Test user interactions

### Test Structure
```typescript
describe('useHookName', () => {
  describe('initial state', () => {
    it('should have correct initial state', () => {
      // Test initial state
    });
  });

  describe('loading states', () => {
    it('should handle loading state correctly', () => {
      // Test loading states
    });
  });

  describe('error handling', () => {
    it('should handle errors gracefully', () => {
      // Test error scenarios
    });
  });

  describe('success scenarios', () => {
    it('should handle successful operations', async () => {
      // Test success scenarios
    });
  });
});
``` 