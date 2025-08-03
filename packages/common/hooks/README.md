# Hooks Layer (Layer 1: UI Layer)

This directory contains React hooks that handle UI state and user interactions. These hooks provide simple, readable interfaces for components while abstracting complex business logic to services.

## 🏗️ Purpose

Hooks in this layer serve as the **UI Layer** in our three-layer architecture:

```
UI Components → Hooks → Services → Libraries/Adapters
```

## ✨ Characteristics

- ✅ **Pure UI State Management**: Handle only UI state, no business logic
- ✅ **Simple and Readable**: Easy to understand and use
- ✅ **Service Integration**: Call services for business logic
- ✅ **Error Handling**: Provide clear error messages to users
- ✅ **Platform Agnostic**: Work across mobile, extension, and web platforms
- ✅ **Type Safe**: Full TypeScript support with strict typing
- ✅ **Reusable**: Shared across all platforms

## 📚 Available Hooks

### Form Management Hooks

#### `useFormState`
Generic form state management with error handling and dirty state tracking.

```typescript
const { 
  formData, 
  errors, 
  isSubmitting, 
  isDirty,
  updateField, 
  resetForm, 
  setFieldError 
} = useFormState(initialData);
```

#### `useFormValidation`
Integration with validation services for form validation.

```typescript
const { 
  validateField, 
  validateForm, 
  isFieldValid, 
  getFieldError 
} = useFormValidation(validationService);
```

### Item-Specific Form Hooks

#### `useCardForm`
Card form orchestration with validation, formatting, and transformation services.

```typescript
const { 
  formData, 
  errors, 
  isSubmitting, 
  handleFieldChange, 
  handleCardNumberChange, 
  handleExpirationDateChange, 
  handleCVVChange, 
  handleSubmit 
} = useCardForm(initialData);
```

#### `useCredentialForm`
Credential form orchestration with validation, transformation, and password generation.

```typescript
const { 
  formData, 
  errors, 
  isSubmitting, 
  handleFieldChange, 
  handleEmailChange, 
  handleURLChange, 
  handleGeneratePassword, 
  handleSubmit 
} = useCredentialForm(initialData);
```

### UI Behavior Hooks

#### `usePasswordVisibility`
Password field visibility toggle state management.

```typescript
const { 
  isPasswordVisible, 
  togglePasswordVisibility, 
  showPassword, 
  hidePassword 
} = usePasswordVisibility();
```

#### `useContentSize`
Dynamic input height management for notes and multi-line inputs.

```typescript
const { 
  inputHeight, 
  handleContentSizeChange, 
  resetHeight, 
  getHeightStyle 
} = useContentSize(isNote, minHeight, maxHeight);
```

#### `useClipboard`
Clipboard operations with toast notifications.

```typescript
const { 
  isCopying, 
  copyToClipboard, 
  copyToClipboardSilent, 
  isClipboardAvailable 
} = useClipboard();
```

### Legacy Hooks (Maintained for Compatibility)

#### `useAppState`
Reads current app state without triggering initialization.

```typescript
const { 
  state, 
  user, 
  vault, 
  refreshState, 
  clearError 
} = useAppState();
```

#### `useItems`
Provides real-time access to items data with automatic UI updates.

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

#### `useAuth`
Authentication state management and operations.

```typescript
const { 
  user, 
  isAuthenticated, 
  login, 
  logout, 
  isLoading 
} = useAuth();
```

#### `usePasswordGenerator`
Password generation with strength analysis.

```typescript
const { 
  generatePassword, 
  passwordStrength, 
  isGenerating 
} = usePasswordGenerator();
```

## 🏛️ Architecture Rules

### Hook Responsibilities
1. **UI State Management**: Manage form state, loading states, error states
2. **User Interactions**: Handle user actions and provide feedback
3. **Service Integration**: Call services for business logic
4. **Navigation**: Handle navigation via `useAppRouterContext()`
5. **Side Effects**: Wrap side effects with `useEffect`

### What Hooks Should NOT Do
- ❌ **Business Logic**: No validation, formatting, or transformation logic
- ❌ **Direct API Calls**: No direct calls to libraries or adapters
- ❌ **Data Persistence**: No direct database or storage operations
- ❌ **Complex Orchestration**: No complex business rule implementation

### Service Integration Pattern
```typescript
// ✅ Correct: Hook calls service
const { validateField } = useFormValidation(validationService);
const result = validateField('cardNumber', value);

// ❌ Incorrect: Hook implements business logic
const validateCardNumber = (value: string) => {
  // Business logic should be in services
};
```

## 📝 Usage Examples

### Creating a Form Component
```typescript
import { useCardForm } from '@common/hooks/useCardForm';

const AddCardForm = () => {
  const { 
    formData, 
    errors, 
    isSubmitting, 
    handleFieldChange, 
    handleSubmit 
  } = useCardForm();

  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={formData.title}
        onChange={(value) => handleFieldChange('title', value)}
        error={errors.title}
      />
      <Button type="submit" disabled={isSubmitting}>
        Add Card
      </Button>
    </form>
  );
};
```

### Using Clipboard Operations
```typescript
import { useClipboard } from '@common/hooks/useClipboard';

const CopyButton = ({ text }) => {
  const { copyToClipboard, isCopying } = useClipboard();

  const handleCopy = () => {
    copyToClipboard(text, 'Copied to clipboard!');
  };

  return (
    <Button onClick={handleCopy} disabled={isCopying}>
      {isCopying ? 'Copying...' : 'Copy'}
    </Button>
  );
};
```

### Managing Password Visibility
```typescript
import { usePasswordVisibility } from '@common/hooks/usePasswordVisibility';

const PasswordInput = () => {
  const { isPasswordVisible, togglePasswordVisibility } = usePasswordVisibility();

  return (
    <View>
      <TextInput
        secureTextEntry={!isPasswordVisible}
        placeholder="Enter password"
      />
      <Button onPress={togglePasswordVisibility}>
        {isPasswordVisible ? 'Hide' : 'Show'}
      </Button>
    </View>
  );
};
```

## 🧪 Testing Guidelines

### Hook Testing Strategy
- **Test UI State**: Verify state changes and user interactions
- **Test Service Integration**: Mock services and verify calls
- **Test Error Handling**: Verify error states and messages
- **Test Platform Compatibility**: Ensure hooks work across platforms

### Example Test
```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useCardForm } from './useCardForm';

describe('useCardForm', () => {
  it('should handle field changes', () => {
    const { result } = renderHook(() => useCardForm());
    
    act(() => {
      result.current.handleFieldChange('title', 'New Card');
    });
    
    expect(result.current.formData.title).toBe('New Card');
  });
});
```

## 🔄 Migration Guide

### From Old Pattern to New Pattern

**Old Pattern (Business Logic in Hooks)**:
```typescript
const useCardForm = () => {
  const validateCardNumber = (value: string) => {
    // Business logic in hook ❌
    if (value.length < 13) return 'Invalid card number';
    // Luhn algorithm implementation...
  };
};
```

**New Pattern (Business Logic in Services)**:
```typescript
const useCardForm = () => {
  const { validateField } = useFormValidation(cardValidationService);
  
  const handleCardNumberChange = (value: string) => {
    const result = validateField('cardNumber', value);
    // UI state management only ✅
  };
};
```

## 📚 Best Practices

1. **Keep Hooks Simple**: Focus on UI state management only
2. **Use Services**: Call services for all business logic
3. **Handle Errors**: Provide clear error messages to users
4. **Type Safety**: Use strict TypeScript types
5. **Test Thoroughly**: Write comprehensive tests for UI behavior
6. **Document APIs**: Provide clear documentation and examples

---

**SimpliPass Hooks**: Clean, reusable UI state management for cross-platform password management. 