# Architecture Review & Refactoring Plan

## Overview
This plan outlines the systematic review and refactoring of all pages and components to ensure they follow React Native best practices and align with the three-layer architecture:

**Layer 1: Hooks** → UI state management only  
**Layer 2: Services** → business logic orchestration  
**Layer 3: Libraries/Adapters** → low-level integration and utility functions

## Goals
- ✅ **Maximize shared code and logic**
- ✅ **Proper separation of concerns** (UI, Business Logic, Integration)
- ✅ **Follow React Native best practices**
- ✅ **Ensure consistent patterns across the codebase**
- ✅ **Optimize performance and maintainability**

---

## Phase 1: Analysis & Assessment

### 1.1 Current State Analysis
- [ ] **Audit all pages** for business logic in components
- [ ] **Audit all components** for logic that should be in services
- [ ] **Identify duplicate code** across pages and components
- [ ] **Map current architecture violations**

### 1.2 Patterns to Identify
- [ ] **Form validation logic** in components (→ move to services)
- [ ] **Data transformation** in components (→ move to services)
- [ ] **Formatting logic** in components (→ move to libraries)
- [ ] **API calls** directly in components (→ move to services)
- [ ] **Navigation logic** mixed with business logic
- [ ] **UI state management** that could be shared (→ move to hooks)

---

## Phase 2: Service Layer Enhancement

### 2.1 Validation Services

#### `validationService.ts`
```typescript
// packages/common/core/services/validationService.ts
export const cardValidationService = {
  validateCardNumber: (number: string): ValidationResult => {
    // Business logic for card validation
    const cleaned = number.replace(/\s/g, '');
    const isValid = /^\d{13,19}$/.test(cleaned);
    return { isValid, error: isValid ? null : 'Invalid card number' };
  },
  
  validateExpirationDate: (date: string): ValidationResult => {
    // Business logic for date validation
    const [month, year] = date.split('/');
    const currentDate = new Date();
    const cardDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const isValid = cardDate > currentDate;
    return { isValid, error: isValid ? null : 'Card expired' };
  },
  
  validateCVV: (cvv: string): ValidationResult => {
    // Business logic for CVV validation
    const isValid = /^\d{3,4}$/.test(cvv);
    return { isValid, error: isValid ? null : 'Invalid CVV' };
  }
};

export const credentialValidationService = {
  validatePassword: (password: string): ValidationResult => {
    // Business logic for password validation
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    const isValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
    return { isValid, error: isValid ? null : 'Password too weak' };
  },
  
  validateEmail: (email: string): ValidationResult => {
    // Business logic for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    return { isValid, error: isValid ? null : 'Invalid email format' };
  }
};
```

### 2.2 Formatting Services

#### `formattingService.ts`
```typescript
// packages/common/core/services/formattingService.ts
export const cardFormattingService = {
  formatCardNumber: (number: string): string => {
    // Business logic for card formatting
    const cleaned = number.replace(/\s/g, '');
    return cleaned.replace(/(\d{4})/g, '$1 ').trim();
  },
  
  formatExpirationDate: (date: string): string => {
    // Business logic for date formatting
    const cleaned = date.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  },
  
  maskCardNumber: (number: string): string => {
    // Business logic for card masking
    const lastFour = number.slice(-4);
    return `**** **** **** ${lastFour}`;
  }
};
```

### 2.3 Form Data Transformation Services

#### `formTransformationService.ts`
```typescript
// packages/common/core/services/formTransformationService.ts
export const cardFormTransformationService = {
  transformFormToCard: (formData: CardFormData): BankCard => {
    // Business logic for transforming form data to card object
    return {
      id: generateId(),
      type: 'bankCard',
      title: formData.title,
      cardNumber: formData.cardNumber,
      cardholderName: formData.cardholderName,
      expirationDate: formData.expirationDate,
      cvv: formData.cvv,
      // ... other transformations
    };
  },
  
  transformCardToForm: (card: BankCard): CardFormData => {
    // Business logic for transforming card object to form data
    return {
      title: card.title,
      cardNumber: card.cardNumber,
      cardholderName: card.cardholderName,
      expirationDate: card.expirationDate,
      cvv: card.cvv,
      // ... other transformations
    };
  }
};
```

---

## Phase 3: UI Layer Hooks (Layer 1)

### 3.1 Form State Management Hooks

#### `useFormState.ts`
```typescript
// packages/common/hooks/useFormState.ts
export const useFormState = <T extends Record<string, any>>(
  initialData: T
) => {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);
  
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setIsSubmitting(false);
  }, [initialData]);
  
  return {
    formData,
    errors,
    isSubmitting,
    updateField,
    resetForm,
    setErrors,
    setIsSubmitting
  };
};
```

#### `useFormValidation.ts`
```typescript
// packages/common/hooks/useFormValidation.ts
export const useFormValidation = <T extends Record<string, any>>(
  validationService: ValidationService<T>
) => {
  const validateField = useCallback((field: keyof T, value: any) => {
    const result = validationService.validateField(field, value);
    return result;
  }, [validationService]);
  
  const validateForm = useCallback((formData: T) => {
    const errors: Partial<Record<keyof T, string>> = {};
    let isValid = true;
    
    Object.keys(formData).forEach(key => {
      const result = validationService.validateField(key as keyof T, formData[key]);
      if (!result.isValid) {
        errors[key as keyof T] = result.error;
        isValid = false;
      }
    });
    
    return { isValid, errors };
  }, [validationService]);
  
  return { validateField, validateForm };
};
```

### 3.2 Item-Specific UI Hooks

#### `useCardForm.ts`
```typescript
// packages/common/hooks/useCardForm.ts
export const useCardForm = (initialData?: Partial<CardFormData>) => {
  const { formData, errors, isSubmitting, updateField, resetForm, setErrors, setIsSubmitting } = 
    useFormState(cardFormInitialData);
  
  const { validateField, validateForm } = useFormValidation(cardValidationService);
  const { addItem } = useItems();
  const { navigate } = useAppRouterContext();
  
  const handleFieldChange = useCallback((field: keyof CardFormData, value: string) => {
    updateField(field, value);
    
    // Real-time validation
    const result = validateField(field, value);
    if (!result.isValid) {
      setErrors(prev => ({ ...prev, [field]: result.error }));
    }
  }, [updateField, validateField, setErrors]);
  
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      const { isValid, errors: validationErrors } = validateForm(formData);
      if (!isValid) {
        setErrors(validationErrors);
        return;
      }
      
      const cardData = cardFormTransformationService.transformFormToCard(formData);
      await addItem(cardData);
      
      navigate(ROUTES.HOME);
    } catch (error) {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, addItem, navigate, setIsSubmitting]);
  
  return {
    formData,
    errors,
    isSubmitting,
    handleFieldChange,
    handleSubmit,
    resetForm
  };
};
```

#### `useCredentialForm.ts`
```typescript
// packages/common/hooks/useCredentialForm.ts
export const useCredentialForm = (initialData?: Partial<CredentialFormData>) => {
  const { formData, errors, isSubmitting, updateField, resetForm, setErrors, setIsSubmitting } = 
    useFormState(credentialFormInitialData);
  
  const { validateField, validateForm } = useFormValidation(credentialValidationService);
  const { addItem } = useItems();
  const { generatePassword } = usePasswordGenerator();
  const { navigate } = useAppRouterContext();
  
  const handleGeneratePassword = useCallback(() => {
    const newPassword = generatePassword();
    updateField('password', newPassword);
  }, [generatePassword, updateField]);
  
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      const { isValid, errors: validationErrors } = validateForm(formData);
      if (!isValid) {
        setErrors(validationErrors);
        return;
      }
      
      const credentialData = credentialFormTransformationService.transformFormToCredential(formData);
      await addItem(credentialData);
      
      navigate(ROUTES.HOME);
    } catch (error) {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, addItem, navigate, setIsSubmitting]);
  
  return {
    formData,
    errors,
    isSubmitting,
    handleFieldChange: updateField,
    handleGeneratePassword,
    handleSubmit,
    resetForm
  };
};
```

### 3.3 UI Behavior Hooks

#### `usePasswordVisibility.ts`
```typescript
// packages/common/hooks/usePasswordVisibility.ts
export const usePasswordVisibility = () => {
  const [showPassword, setShowPassword] = useState(false);
  
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);
  
  return { showPassword, togglePasswordVisibility };
};
```

#### `useContentSize.ts`
```typescript
// packages/common/hooks/useContentSize.ts
export const useContentSize = (isNote: boolean) => {
  const [inputHeight, setInputHeight] = useState(isNote ? 72 : 48);
  
  const handleContentSizeChange = useCallback((event: any) => {
    if (isNote) {
      const { height } = event.nativeEvent.contentSize;
      setInputHeight(Math.max(72, Math.min(height, 200)));
    }
  }, [isNote]);
  
  return { inputHeight, handleContentSizeChange };
};
```

#### `useClipboard.ts`
```typescript
// packages/common/hooks/useClipboard.ts
export const useClipboard = () => {
  const { showToast } = useToast();
  
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard', 'success');
      return true;
    } catch (error) {
      showToast('Failed to copy', 'error');
      return false;
    }
  }, [showToast]);
  
  return { copyToClipboard };
};
```

---

## Phase 4: Page Refactoring

### 4.1 Add Pages Refactoring

#### `AddCard1.tsx` → `AddCard1Page.tsx`
**Refactored Component:**
```typescript
// packages/common/ui/pages/AddCard1Page.tsx
export const AddCard1Page = () => {
  const { formData, errors, isSubmitting, handleFieldChange, handleSubmit } = useCardForm();
  
  return (
    <PopupLayout>
      <HeaderTitle title="Add Bank Card" />
      <View style={formContainer}>
        <InputFields
          label="Card Number"
          value={formData.cardNumber}
          onChangeText={(value) => handleFieldChange('cardNumber', value)}
          error={errors.cardNumber}
          placeholder="1234 5678 9012 3456"
        />
        <InputFields
          label="Cardholder Name"
          value={formData.cardholderName}
          onChangeText={(value) => handleFieldChange('cardholderName', value)}
          error={errors.cardholderName}
          placeholder="John Doe"
        />
        <Buttons
          title="Continue"
          onPress={handleSubmit}
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </View>
    </PopupLayout>
  );
};
```

#### `AddCard2.tsx` → `AddCard2Page.tsx`
**Refactored Component:**
```typescript
// packages/common/ui/pages/AddCard2Page.tsx
export const AddCard2Page = () => {
  const { formData, errors, isSubmitting, handleFieldChange, handleSubmit } = useCardForm();
  const { formatCardNumber, formatExpirationDate } = useCardFormatting();
  
  return (
    <PopupLayout>
      <HeaderTitle title="Card Details" />
      <View style={formContainer}>
        <InputFields
          label="Expiration Date"
          value={formData.expirationDate}
          onChangeText={(value) => {
            const formatted = formatExpirationDate(value);
            handleFieldChange('expirationDate', formatted);
          }}
          error={errors.expirationDate}
          placeholder="MM/YY"
        />
        <InputFields
          label="CVV"
          value={formData.cvv}
          onChangeText={(value) => handleFieldChange('cvv', value)}
          error={errors.cvv}
          placeholder="123"
          secureTextEntry
        />
        <Buttons
          title="Save Card"
          onPress={handleSubmit}
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </View>
    </PopupLayout>
  );
};
```

### 4.2 Details Pages Refactoring

#### `BankCardDetailsPage.tsx`
**Refactored Component:**
```typescript
// packages/common/ui/pages/BankCardDetailsPage.tsx
export const BankCardDetailsPage = () => {
  const { item } = useItemDetails();
  const { copyToClipboard } = useClipboard();
  const { navigate } = useAppRouterContext();
  
  const handleCopyCardNumber = useCallback(() => {
    copyToClipboard(item.cardNumber);
  }, [item.cardNumber, copyToClipboard]);
  
  const handleEdit = useCallback(() => {
    navigate(ROUTES.MODIFY_BANK_CARD, { itemId: item.id });
  }, [item.id, navigate]);
  
  return (
    <PopupLayout>
      <HeaderTitle title="Card Details" />
      <View style={detailsContainer}>
        <DetailField
          label="Card Number"
          value={item.cardNumber}
          onCopy={handleCopyCardNumber}
        />
        <DetailField
          label="Cardholder Name"
          value={item.cardholderName}
        />
        <DetailField
          label="Expiration Date"
          value={item.expirationDate}
        />
        <Buttons title="Edit" onPress={handleEdit} />
      </View>
    </PopupLayout>
  );
};
```

---

## Phase 5: Component Refactoring

### 5.1 Form Components

#### `InputFields.tsx` Refactoring
**Refactored Component:**
```typescript
// packages/common/ui/components/InputFields.tsx
export const InputFields = ({ 
  label, 
  value, 
  onChangeText, 
  error, 
  placeholder,
  secureTextEntry 
}: InputFieldsProps) => {
  const { showPassword, togglePasswordVisibility } = usePasswordVisibility();
  const { inputHeight, handleContentSizeChange } = useContentSize(false);
  
  return (
    <View style={inputContainer}>
      <Text style={labelStyle}>{label}</Text>
      <View style={inputWrapper}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry && !showPassword}
          onContentSizeChange={handleContentSizeChange}
          style={[inputStyle, { height: inputHeight }]}
        />
        {secureTextEntry && (
          <Pressable onPress={togglePasswordVisibility} style={eyeIconContainer}>
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} />
          </Pressable>
        )}
      </View>
      {error && <Text style={errorStyle}>{error}</Text>}
    </View>
  );
};
```

### 5.2 Card Components

#### `ItemBankCard.tsx` Refactoring
**Refactored Component:**
```typescript
// packages/common/ui/components/ItemBankCard.tsx
export const ItemBankCard = ({ item, onPress }: ItemBankCardProps) => {
  const { formatCardNumber, maskCardNumber } = useCardFormatting();
  
  const displayCardNumber = useMemo(() => {
    return maskCardNumber(item.cardNumber);
  }, [item.cardNumber, maskCardNumber]);
  
  return (
    <Pressable onPress={onPress} style={cardContainer}>
      <Text style={cardNumberStyle}>{displayCardNumber}</Text>
      <Text style={cardholderStyle}>{item.cardholderName}</Text>
      <Text style={expirationStyle}>{item.expirationDate}</Text>
    </Pressable>
  );
};
```

---

## Phase 6: Implementation Order

### 6.1 Priority 1: Service Layer (Layer 2)
1. **Create validation services** (cardValidationService, credentialValidationService)
2. **Create formatting services** (cardFormattingService)
3. **Create transformation services** (cardFormTransformationService)
4. **Update existing services** to use new utilities

### 6.2 Priority 2: UI Hooks (Layer 1)
1. **Create useFormState** hook for form state management
2. **Create useFormValidation** hook for validation integration
3. **Create useCardForm** and useCredentialForm hooks
4. **Create UI behavior hooks** (usePasswordVisibility, useContentSize, useClipboard)

### 6.3 Priority 3: Page Refactoring
1. **Refactor AddCard2.tsx** (most complex form)
2. **Refactor AddCard1.tsx** and AddCredential1.tsx
3. **Refactor details pages** (BankCardDetailsPage, CredentialDetailsPage)
4. **Refactor modify pages** (ModifyBankCardPage, ModifyCredentialPage)

### 6.4 Priority 4: Component Refactoring
1. **Refactor InputFields.tsx** to use new hooks
2. **Refactor ItemBankCard.tsx** to use formatting services
3. **Refactor CopyButton.tsx** to use useClipboard hook
4. **Update all components** to use shared hooks

### 6.5 Priority 5: Testing & Documentation
1. **Test all services** in isolation
2. **Test all hooks** for UI behavior only
3. **Update Storybook stories**
4. **Update documentation**

---

## Phase 7: Quality Assurance

### 7.1 Architecture Compliance
- [ ] **No business logic** in hooks (only UI state management)
- [ ] **No business logic** in components (only UI rendering)
- [ ] **All validation logic** in services
- [ ] **All formatting logic** in services
- [ ] **All transformation logic** in services

### 7.2 Code Quality Checks
- [ ] **Linting passes** with no errors
- [ ] **TypeScript compilation** successful
- [ ] **Build process** works correctly
- [ ] **All tests pass**

### 7.3 Performance Validation
- [ ] **No unnecessary re-renders** in components
- [ ] **Optimized hook dependencies**
- [ ] **Efficient state management**
- [ ] **Minimal bundle size impact**

---

## Expected Outcomes

### ✅ **Proper Architecture Alignment**
- **Layer 1 (Hooks)**: UI state management only
- **Layer 2 (Services)**: Business logic orchestration
- **Layer 3 (Libraries)**: Low-level utilities and formatting

### ✅ **Improved Code Quality**
- **Reduced duplication** by 70-80%
- **Clear separation** of concerns
- **Consistent patterns** across codebase
- **Easier testing** with isolated logic

### ✅ **Enhanced Performance**
- **Optimized re-renders** through proper hook usage
- **Reduced bundle size** through shared services
- **Better memory usage** through efficient state management

### ✅ **Better Developer Experience**
- **Reusable services** for business logic
- **Reusable hooks** for UI behavior
- **Consistent API** across components
- **Clear documentation** and examples

---

## Timeline Estimate

- **Phase 1-2**: 2-3 days (Service Layer)
- **Phase 3**: 2-3 days (UI Hooks)
- **Phase 4**: 3-4 days (Page Refactoring)
- **Phase 5**: 2-3 days (Component Refactoring)
- **Phase 6**: 1-2 days (Implementation)
- **Phase 7**: 1 day (Quality Assurance)

**Total Estimated Time**: 11-16 days

---

## Success Metrics

- [ ] **Zero business logic** in UI components
- [ ] **Zero business logic** in hooks
- [ ] **90%+ code reuse** for common patterns
- [ ] **All tests passing** with new architecture
- [ ] **Performance improvement** of 25%+ in form interactions
- [ ] **Reduced bundle size** by 20%+ through shared services

---

## Next Steps

1. **Review this revised plan** and approve the architecture alignment
2. **Start with Phase 1** (Service Layer Enhancement)
3. **Create validation and formatting services** as the foundation
4. **Create UI hooks** that use the services
5. **Refactor pages** to use the new hooks
6. **Iterate and improve** based on learnings

This revised plan ensures proper alignment with the three-layer architecture and maximizes code reuse while maintaining clean separation of concerns. 