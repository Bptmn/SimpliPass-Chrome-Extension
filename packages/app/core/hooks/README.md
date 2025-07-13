# 🪝 Custom Hooks Module

The hooks module provides React hooks for common functionality across the SimpliPass application. These hooks encapsulate UI state management and provide a clean interface for components to interact with the application.

## 📁 Structure

```
hooks/
├── __tests__/           # Hook tests
├── useDebouncedValue.ts
├── useInputLogic.tsx
├── useLazyCredentialIcon.tsx
├── useSecretKeyCheck.ts
├── useToast.tsx
└── index.ts
```

## 🏗️ Architecture

### Hook Categories

The hooks are organized into several categories:

1. **UI State Hooks**: Manage component state, forms, and user interactions
2. **Utility Hooks**: Provide common functionality like debouncing and validation
3. **Authentication Hooks**: Handle authentication state and validation

### Design Principles

- **Single Responsibility**: Each hook has a clear, focused purpose
- **Platform Agnostic**: Hooks work across mobile and extension platforms
- **Type Safety**: Full TypeScript support with proper typing
- **Error Handling**: Consistent error handling patterns
- **Performance**: Optimized for React rendering cycles

## 🔧 Core Hooks

### UI State Hooks

#### `useInputLogic`
Handles form input logic and validation.

```typescript
const {
  value,
  error,
  isValid,
  handleChange,
  handleBlur,
  handleFocus
} = useInputLogic('text');
```

#### `useLazyCredentialIcon`
Manages lazy loading of credential icons.

```typescript
const { icon, isLoading, error } = useLazyCredentialIcon(url, title);
```

### Utility Hooks

#### `useDebouncedValue`
Provides debounced value updates for search and filtering.

```typescript
const debouncedValue = useDebouncedValue(value, 300);
```

#### `useToast`
Manages toast notifications across the application.

```typescript
const { toast, showToast } = useToast();
```

### Authentication Hooks

#### `useSecretKeyCheck`
Handles secret key validation and restoration.

```typescript
const { checkSecretKey, isChecking, hasValidKey } = useSecretKeyCheck();
```

## 🧪 Testing

### Test Structure
```
__tests__/
├── useInputLogic.test.tsx
├── useLazyCredentialIcon.test.tsx
└── useSecretKeyCheck.test.tsx
```

### Testing Patterns
- **Hook Testing**: Use `@testing-library/react-hooks` for isolated hook testing
- **Component Integration**: Test hooks within component context
- **Mock Dependencies**: Mock external dependencies and services
- **State Testing**: Verify state changes and side effects

### Example Test
```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useInputLogic } from '../useInputLogic';

describe('useInputLogic', () => {
  it('should handle input changes', () => {
    const { result } = renderHook(() => useInputLogic('text'));
    
    act(() => {
      result.current.handleChange('test@example.com');
    });
    
    expect(result.current.value).toBe('test@example.com');
  });
});
```

## 📋 Usage Examples

### Basic Hook Usage

```typescript
import { useInputLogic, useToast } from '@app/core/hooks';

const InputComponent = () => {
  const inputHook = useInputLogic('email');
  const { showToast } = useToast();
  
  const handleSubmit = async () => {
    if (inputHook.isValid) {
      showToast('Input valid!');
    }
  };
  
  return (
    // Component JSX
  );
};
```

### Custom Hook Composition

```typescript
import { useDebouncedValue, useInputLogic } from '@app/core/hooks';

const SearchComponent = () => {
  const { value, handleChange } = useInputLogic('text');
  const debouncedValue = useDebouncedValue(value, 500);
  
  // Use debounced value for API calls
  useEffect(() => {
    if (debouncedValue) {
      // Perform search
    }
  }, [debouncedValue]);
  
  return (
    // Component JSX
  );
};
```

### Error Handling

```typescript
import { useSecretKeyCheck } from '@app/core/hooks';

const SecretKeyComponent = () => {
  const { checkSecretKey, isChecking, error } = useSecretKeyCheck();
  
  useEffect(() => {
    const validateKey = async () => {
      try {
        await checkSecretKey();
      } catch (error) {
        console.error('Secret key validation failed:', error);
      }
    };
    
    validateKey();
  }, []);
  
  if (isChecking) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <SecretKeyForm />;
};
```

## 🔧 Integration

### With State Management

Hooks integrate with Zustand stores for state management:

```typescript
import { useCredentialsStore } from '@app/core/states';

const useInputLogic = () => {
  const credentials = useCredentialsStore(state => state.credentials);
  // Hook logic
};
```

### With Platform Adapters

Hooks use platform adapters for platform-specific functionality:

```typescript
import { getPlatformAdapter } from '@app/core/adapters';

const useSecretKeyCheck = () => {
  const checkSecretKey = async () => {
    const adapter = await getPlatformAdapter();
    return adapter.getUserSecretKey();
  };
  
  return { checkSecretKey };
};
```

### With Business Logic

Hooks consume unified business logic functions:

```typescript
import { unifiedLogin } from '@app/core/logic';

const useLoginPage = () => {
  const handleSubmit = async () => {
    const result = await unifiedLogin(email, password);
    // Handle result
  };
  
  return { handleSubmit };
};
```

## 📝 Best Practices

### 1. Keep Hooks Focused
```typescript
// ✅ Good - Single responsibility
const useEmailValidation = (email: string) => {
  return useMemo(() => validateEmail(email), [email]);
};

// ❌ Bad - Multiple responsibilities
const useLoginForm = () => {
  // Email validation, password validation, form submission, etc.
};
```

### 2. Use Proper Dependencies
```typescript
// ✅ Good - Proper dependency array
useEffect(() => {
  fetchData();
}, [userId, filters]);

// ❌ Bad - Missing dependencies
useEffect(() => {
  fetchData();
}, []); // Missing userId and filters
```

### 3. Handle Loading States
```typescript
// ✅ Good - Proper loading state
const useDataFetching = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const result = await api.getData();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return { data, isLoading, error, fetchData };
};
```

### 4. Provide Clean APIs
```typescript
// ✅ Good - Clean, intuitive API
const useCounter = () => {
  const [count, setCount] = useState(0);
  
  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  const reset = () => setCount(0);
  
  return { count, increment, decrement, reset };
};

// ❌ Bad - Exposing internal state
const useCounter = () => {
  const [count, setCount] = useState(0);
  return { count, setCount }; // Exposes implementation details
};
```

## 🔄 Migration Guide

### From Business Logic Hooks
1. Move business logic to `@app/core/logic` layer
2. Keep only UI state management in hooks
3. Use direct state management in components
4. Implement proper cleanup in useEffect

### From Context Providers
1. Create focused hooks for specific functionality
2. Use Zustand for global state management
3. Keep context providers minimal
4. Prefer composition over inheritance

## 📚 Related Documentation

- [State Management](../states/README.md)
- [Business Logic](../logic/README.md)
- [Platform Adapters](../adapters/README.md)
- [Testing Strategy](../../../TEST_STRATEGY.md) 