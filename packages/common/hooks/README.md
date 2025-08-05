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
- ✅ **Error Handling**: Provide clear error messages to users and propagate to ErrorBoundary
- ✅ **Platform Agnostic**: Work across mobile, extension, and web platforms
- ✅ **Type Safe**: Full TypeScript support with strict typing
- ✅ **Reusable**: Shared across all platforms

## 📁 Optimized Structure

Hooks are now organized into focused categories with unified operations:

```
hooks/
├── core/           # App-wide state (useAppState, useAuth, useAppInitialization)
├── forms/          # Form-specific hooks (useFormState, useFormValidation, useCardForm, useCredentialForm)
├── operations/     # Unified business operations (useItemsOperations, useItemDetails, useItemSearch, useItemSelection)
├── ui/            # UI behavior hooks (useClipboard, usePasswordVisibility, useContentSize, usePasswordGenerator)
├── formatting/    # Formatting hooks (useCardFormatting, useTextFormatting)
├── autofill/      # Autofill hooks (useAutofillState, useAutofillSuggestions, useAutofillInjection)
└── legacy/        # Legacy hooks maintained for backward compatibility
```

## 🎯 **Key Optimizations**

### **1. Unified Operations**
- **`useItemsOperations`**: Single hook for all CRUD operations
- **`useItemDetails`**: Unified item detail operations (edit, delete, copy)
- **`useItemSearch`**: Centralized search functionality
- **`useItemSelection`**: Unified selection state management

### **2. Consistent Error Handling**
- ✅ **Error Propagation**: All errors propagate to ErrorBoundary
- ✅ **Error Clearing**: Consistent error clearing mechanisms
- ✅ **Error Messages**: Clear, user-friendly error messages
- ✅ **Error Logging**: Comprehensive error logging for debugging

### **3. Eliminated Duplication**
- ❌ **Removed**: `useItemsState` + `useItemsCRUD` → **`useItemsOperations`**
- ❌ **Removed**: `useBankCardDetails` + `useCredentialDetails` → **`useItemDetails`**
- ❌ **Removed**: Multiple search hooks → **`useItemSearch`**
- ❌ **Removed**: Multiple selection hooks → **`useItemSelection`**

## 📚 Available Hooks

### Core Hooks (App State & Initialization)

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

#### `useAppInitialization`
Handles application initialization logic.

```typescript
const { 
  isInitializing, 
  initializationError, 
  resetInitializationState 
} = useAppInitialization({ platform });
```

#### `useAuth`
Authentication state management and operations.

```typescript
const { 
  user, 
  isLoading, 
  logout, 
  getCurrentUser, 
  clearError 
} = useAuth({ user });
```

#### `useLogin`
Focused hook for login form state management.

```typescript
const { 
  email, 
  password, 
  emailError, 
  passwordError, 
  isLoading, 
  handleLogin 
} = useLogin();
```

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

### Unified Operations Hooks

#### `useItemsOperations`
**Unified operations for all item types** - replaces multiple hooks.

```typescript
const { 
  items, 
  credentials, 
  bankCards, 
  secureNotes,
  searchValue,
  filteredItems,
  loading, 
  error,
  addItem, 
  editItem, 
  deleteItem,
  setSearchValue,
  clearSearch,
  refreshData,
  clearError 
} = useItemsOperations({ user });
```

#### `useItemDetails`
**Unified item detail operations** - replaces item-specific detail hooks.

```typescript
const { 
  handleEdit, 
  handleDelete, 
  handleCopy, 
  handleLaunch,
  formatCardNumber,
  formatURL,
  isActionLoading,
  error,
  clearError 
} = useItemDetails({ onBack, showToast, copyToClipboard });
```

#### `useItemSearch`
**Unified search functionality** with validation.

```typescript
const { 
  searchValue, 
  isSearching,
  error,
  setSearchValue, 
  clearSearch,
  validateSearch,
  clearError 
} = useItemSearch({ initialValue: '', maxLength: 100 });
```

#### `useItemSelection`
**Unified selection state management** for all item types.

```typescript
const { 
  selectedCredential, 
  selectedBankCard, 
  selectedSecureNote,
  error,
  setSelectedCredential, 
  setSelectedBankCard, 
  setSelectedSecureNote,
  clearSelection,
  validateSelection,
  clearError 
} = useItemSelection();
```

### UI Behavior Hooks

#### `useClipboard`
Clipboard operations with toast notifications and error handling.

```typescript
const { 
  isCopying, 
  copyToClipboard, 
  copyToClipboardSilent, 
  isClipboardAvailable 
} = useClipboard();
```

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

#### `usePasswordGenerator`
Password generation with strength calculation.

```typescript
const { 
  password, 
  strength,
  hasUppercase, 
  hasNumbers, 
  hasSymbols, 
  hasLowercase,
  length,
  setHasUppercase, 
  setHasNumbers, 
  setHasSymbols, 
  setHasLowercase,
  setLength,
  handleRegenerate,
  handleCopyPassword 
} = usePasswordGenerator();
```

### Formatting Hooks

#### `useCardFormatting`
Provides UI-specific formatting for bank cards.

```typescript
const { 
  formatCardNumber, 
  formatCardDisplay 
} = useCardFormatting();
```

#### `useTextFormatting`
Provides UI-specific text formatting.

```typescript
const { 
  formatURL, 
  formatText 
} = useTextFormatting();
```

### Autofill Hooks

#### `useAutofillSuggestions`
Generates autofill suggestions based on domain and vault items.

```typescript
const suggestions = useAutofillSuggestions(domain, vaultItems);
```

#### `useAutofillInjection`
Handles credential injection logic.

```typescript
const { 
  isAutofilling, 
  error, 
  autofillCredential 
} = useAutofillInjection();
```

#### `useAutofillState`
Orchestrates autofill functionality, combining suggestions and injection.

```typescript
const { 
  suggestions, 
  isAutofilling, 
  error, 
  autofillCredential, 
  refreshSuggestions, 
  clearError 
} = useAutofillState();
```

### Legacy Hooks (Maintained for Compatibility)

Legacy hooks are maintained in the `legacy/` folder for backward compatibility:

```typescript
// Legacy hooks (use with caution, prefer new unified hooks)
export { useAddCard2 } from './legacy/useAddCard2';
export { useBankCardDetails } from './legacy/useBankCardDetails';
export { useCredentialDetails } from './legacy/useCredentialDetails';
// ... other legacy hooks
```

## 🏛️ Architecture Rules

### Hook Responsibilities
1. **UI State Management**: Manage form state, loading states, error states
2. **User Interactions**: Handle user actions and provide feedback
3. **Service Integration**: Call services for business logic
4. **Navigation**: Handle navigation via `useAppRouterContext()`
5. **Side Effects**: Wrap side effects with `useEffect`
6. **Error Handling**: Propagate errors to ErrorBoundary

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

### Error Handling Pattern
```typescript
// ✅ Correct: Propagate errors to ErrorBoundary
try {
  await service.operation();
} catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Operation failed';
  setError(errorMessage);
  console.error('[HookName] Operation failed:', err);
  throw new Error(errorMessage); // Propagate to ErrorBoundary
}

// ❌ Incorrect: Swallow errors
try {
  await service.operation();
} catch (err) {
  setError('Something went wrong'); // Generic error
  // No propagation to ErrorBoundary
}
```

## 📝 Usage Examples

### Using Unified Operations
```typescript
import { useItemsOperations, useItemDetails } from '@common/hooks';

const MyComponent = () => {
  const user = useAppStateStore(state => state.user);
  const { items, addItem, deleteItem, loading, error } = useItemsOperations({ user });
  const { handleEdit, handleDelete, handleCopy } = useItemDetails({ 
    onBack, 
    showToast, 
    copyToClipboard 
  });

  const handleAddItem = async (item) => {
    try {
      await addItem(item);
      showToast('Item added successfully');
    } catch (error) {
      // Error is automatically propagated to ErrorBoundary
      console.error('Failed to add item:', error);
    }
  };

  return (
    <div>
      {items.map(item => (
        <ItemCard 
          key={item.id}
          item={item}
          onEdit={() => handleEdit(item)}
          onDelete={() => handleDelete(item.id)}
          onCopy={() => handleCopy(item.title, 'Copied!')}
        />
      ))}
    </div>
  );
};
```

### Using Form Hooks
```typescript
import { useCardForm } from '@common/hooks';

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

### Using UI Hooks
```typescript
import { useClipboard, usePasswordVisibility } from '@common/hooks';

const CopyButton = ({ text }) => {
  const { copyToClipboard, isCopying } = useClipboard();
  const { isPasswordVisible, togglePasswordVisibility } = usePasswordVisibility();

  const handleCopy = async () => {
    try {
      await copyToClipboard(text, 'Copied to clipboard!');
    } catch (error) {
      // Error is automatically propagated to ErrorBoundary
      console.error('Copy failed:', error);
    }
  };

  return (
    <View>
      <TextInput
        secureTextEntry={!isPasswordVisible}
        placeholder="Enter password"
      />
      <Button onPress={togglePasswordVisibility}>
        {isPasswordVisible ? 'Hide' : 'Show'}
      </Button>
      <Button onClick={handleCopy} disabled={isCopying}>
        {isCopying ? 'Copying...' : 'Copy'}
      </Button>
    </View>
  );
};
```

## 🧪 Testing Guidelines

### Hook Testing Strategy
- **Test UI State**: Verify state changes and user interactions
- **Test Service Integration**: Mock services and verify calls
- **Test Error Handling**: Verify error states and ErrorBoundary propagation
- **Test Platform Compatibility**: Ensure hooks work across platforms

### Example Test
```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useItemsOperations } from './operations/useItemsOperations';

describe('useItemsOperations', () => {
  it('should handle add item with error propagation', async () => {
    const { result } = renderHook(() => useItemsOperations({ user: mockUser }));
    
    // Mock service to throw error
    jest.spyOn(itemsService, 'addItem').mockRejectedValue(new Error('Service error'));
    
    await expect(result.current.addItem(mockItem)).rejects.toThrow('Service error');
    expect(result.current.error).toBe('Failed to add item');
  });
});
```

## 🔄 Migration Guide

### From Old Pattern to New Pattern

**Old Pattern (Multiple Hooks)**:
```typescript
// ❌ Multiple hooks with duplication
const { items, addItem } = useItemsState({ user });
const { deleteItem } = useItemsCRUD();
const { handleEdit } = useBankCardDetails(card);
```

**New Pattern (Unified Hooks)**:
```typescript
// ✅ Single unified hook
const { 
  items, 
  addItem, 
  deleteItem 
} = useItemsOperations({ user });
const { 
  handleEdit, 
  handleDelete, 
  handleCopy 
} = useItemDetails({ onBack, showToast, copyToClipboard });
```

## 📚 Best Practices

1. **Use Unified Hooks**: Prefer `useItemsOperations` over legacy hooks
2. **Propagate Errors**: Always throw errors to ErrorBoundary
3. **Keep Hooks Simple**: Focus on UI state management only
4. **Use Services**: Call services for all business logic
5. **Handle Errors**: Provide clear error messages to users
6. **Type Safety**: Use strict TypeScript types
7. **Test Thoroughly**: Write comprehensive tests for UI behavior
8. **Document APIs**: Provide clear documentation and examples

---

**SimpliPass Hooks**: Clean, unified, and error-resilient UI state management for cross-platform password management. 