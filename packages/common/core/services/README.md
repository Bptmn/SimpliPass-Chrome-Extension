# Services Layer (Layer 2: Business Logic Layer)

This directory contains the business logic services that orchestrate complex operations, implement validation rules, format data, and transform information. These services form the **Business Logic Layer** in our three-layer architecture.

## 🏗️ Purpose

Services in this layer serve as the **Business Logic Layer** in our three-layer architecture:

```
UI Components → Hooks → Services → Libraries/Adapters
```

## ✨ Characteristics

- ✅ **Business Logic Orchestration**: Handle complex business operations
- ✅ **Validation Rules**: Implement comprehensive validation logic
- ✅ **Data Formatting**: Transform and format data for display
- ✅ **Data Transformation**: Convert between different data formats
- ✅ **Error Handling**: Provide meaningful error messages
- ✅ **Platform Agnostic**: Work across all platforms
- ✅ **Testable**: Isolated business logic for easy testing
- ✅ **Reusable**: Shared across all platforms

## 📚 Available Services

### Validation Services

#### `validationService.ts`
Comprehensive validation for all item types with business rules.

```typescript
import { validationService } from '@common/core/services/validationService';

// Card validation
const cardResult = validationService.cardValidationService.validateCardNumber('4111111111111111');
const cvvResult = validationService.cardValidationService.validateCVV('123');

// Credential validation
const emailResult = validationService.credentialValidationService.validateEmail('user@example.com');
const passwordResult = validationService.credentialValidationService.validatePassword('MyPassword123!');

// Secure note validation
const titleResult = validationService.secureNoteValidationService.validateTitle('My Note');

// Common validation
const requiredResult = validationService.commonValidationService.validateRequired('value');
```

**Available Validation Services**:
- `cardValidationService` - Bank card validation (Luhn algorithm, CVV, expiration)
- `credentialValidationService` - Credential validation (email, password, URL)
- `secureNoteValidationService` - Secure note validation
- `commonValidationService` - Generic validation utilities

### Formatting Services

#### `formattingService.ts`
Data formatting and transformation utilities.

```typescript
import { formattingService } from '@common/core/services/formattingService';

// Card formatting
const formattedNumber = formattingService.cardFormattingService.formatCardNumber('4111111111111111');
// Returns: "4111 1111 1111 1111"

const maskedNumber = formattingService.cardFormattingService.maskCardNumber('4111111111111111');
// Returns: "**** **** **** 1111"

// Date formatting
const formattedDate = formattingService.dateFormattingService.formatDate(new Date());
// Returns: "January 15, 2024"

// Text formatting
const capitalized = formattingService.textFormattingService.capitalizeWords('hello world');
// Returns: "Hello World"

// Display formatting
const fileSize = formattingService.displayFormattingService.formatFileSize(1024);
// Returns: "1 KB"

const strengthColor = formattingService.displayFormattingService.getPasswordStrengthColor('strong', themeColors);
// Returns: theme color for password strength
```

**Available Formatting Services**:
- `cardFormattingService` - Card number formatting, masking, card type detection
- `dateFormattingService` - Date formatting utilities
- `textFormattingService` - Text formatting, capitalization, truncation
- `displayFormattingService` - Display utilities (file size, currency, password strength)

### Form Transformation Services

#### `formTransformationService.ts`
Form data transformation with business rules.

```typescript
import { formTransformationService } from '@common/core/services/formTransformationService';

// Transform card form to item
const cardItem = formTransformationService.cardFormTransformationService.transformFormToCard({
  title: 'My Card',
  cardNumber: '4111111111111111',
  cardholderName: 'John Doe',
  expirationDate: '12/25',
  cvv: '123',
  notes: 'Personal card'
});

// Transform credential form to item
const credentialItem = formTransformationService.credentialFormTransformationService.transformFormToCredential({
  title: 'My Account',
  email: 'user@example.com',
  password: 'MyPassword123!',
  url: 'https://example.com',
  notes: 'Work account'
});
```

**Available Transformation Services**:
- `cardFormTransformationService` - Card form to item transformation
- `credentialFormTransformationService` - Credential form to item transformation
- `secureNoteFormTransformationService` - Secure note form to item transformation
- `genericFormTransformationService` - Generic form transformation utilities

### Business Logic Services

#### `itemsService.ts`
Item management operations (credentials, bank cards, secure notes).

```typescript
import { itemsService } from '@common/core/services/itemsService';

// Add new item
const newItem = await itemsService.addItem(itemData);

// Get all items
const allItems = await itemsService.getAllItems();

// Update item
const updatedItem = await itemsService.updateItem(itemId, updatedData);

// Delete item
await itemsService.deleteItem(itemId);
```

#### `userService.ts`
User management operations.

```typescript
import { userService } from '@common/core/services/userService';

// Get current user
const user = await userService.getCurrentUser();

// Update user profile
const updatedUser = await userService.updateUser(userId, profileData);
```

#### `secretsService.ts`
Secret key management for encryption/decryption.

```typescript
import { secretsService } from '@common/core/services/secretsService';

// Get user secret key
const secretKey = await secretsService.getUserSecretKey();

// Generate new secret key
const newSecretKey = await secretsService.generateUserSecretKey();
```

#### `vaultService.ts`
Vault operations and synchronization.

```typescript
import { vaultService } from '@common/core/services/vaultService';

// Initialize vault
await vaultService.initializeVault();

// Sync vault data
await vaultService.syncVaultData();

// Backup vault
const backup = await vaultService.createBackup();
```

#### `listenerService.ts`
Real-time data listeners and synchronization.

```typescript
import { listenerService } from '@common/core/services/listenerService';

// Start listening for changes
await listenerService.startListening();

// Stop listening
await listenerService.stopListening();
```

## 🏛️ Architecture Rules

### Service Responsibilities
1. **Business Logic**: Implement complex business rules and operations
2. **Data Validation**: Validate data according to business rules
3. **Data Formatting**: Transform data for display and storage
4. **Data Transformation**: Convert between different data formats
5. **Error Handling**: Provide meaningful error messages
6. **Orchestration**: Coordinate between multiple libraries/adapters

### What Services Should NOT Do
- ❌ **UI Logic**: No component rendering or UI state management
- ❌ **Direct User Interaction**: No user input handling or feedback
- ❌ **Navigation**: No routing or navigation logic
- ❌ **Platform-Specific Code**: No platform-specific implementations

### Library Integration Pattern
```typescript
// ✅ Correct: Service calls library/adapter
const secretKey = await getUserSecretKey();
const encryptedData = await encryptData(secretKey, plainText);

// ❌ Incorrect: Service implements low-level operations
const encryptData = (data: string) => {
  // Low-level operations should be in libraries
};
```

## 📝 Usage Examples

### Creating a Validation Service
```typescript
// validationService.ts
export const cardValidationService = {
  validateCardNumber: (number: string): ValidationResult => {
    const cleaned = number.replace(/\s/g, '');
    
    if (!/^\d{13,19}$/.test(cleaned)) {
      return { isValid: false, error: 'Invalid card number' };
    }
    
    // Luhn algorithm validation
    const isValid = validateLuhn(cleaned);
    
    return { 
      isValid, 
      error: isValid ? null : 'Invalid card number' 
    };
  },
  
  validateCVV: (cvv: string): ValidationResult => {
    const cleaned = cvv.replace(/\D/g, '');
    
    if (cleaned.length !== 3 && cleaned.length !== 4) {
      return { isValid: false, error: 'CVV must be 3 or 4 digits' };
    }
    
    return { isValid: true, error: null };
  }
};
```

### Creating a Formatting Service
```typescript
// formattingService.ts
export const cardFormattingService = {
  formatCardNumber: (number: string): string => {
    const cleaned = number.replace(/\s/g, '');
    return cleaned.replace(/(\d{4})/g, '$1 ').trim();
  },
  
  maskCardNumber: (number: string): string => {
    const cleaned = number.replace(/\s/g, '');
    const lastFour = cleaned.slice(-4);
    return `**** **** **** ${lastFour}`;
  },
  
  getCardType: (number: string): string => {
    const cleaned = number.replace(/\s/g, '');
    
    if (/^4/.test(cleaned)) return 'Visa';
    if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'American Express';
    
    return 'Unknown';
  }
};
```

### Creating a Transformation Service
```typescript
// formTransformationService.ts
export const cardFormTransformationService = {
  transformFormToCard: (formData: CardFormData): BankCard => {
    return {
      id: generateItemKey(),
      type: 'bankCard',
      title: formData.title.trim(),
      cardNumber: formData.cardNumber.replace(/\s/g, ''),
      cardholderName: formData.cardholderName.trim(),
      expirationDate: parseExpirationDate(formData.expirationDate),
      cvv: formData.cvv,
      notes: formData.notes.trim(),
      createdDateTime: new Date(),
      lastUseDateTime: new Date()
    };
  },
  
  transformCardToForm: (card: BankCard): CardFormData => {
    return {
      title: card.title,
      cardNumber: card.cardNumber,
      cardholderName: card.cardholderName,
      expirationDate: formatExpirationDate(card.expirationDate),
      cvv: card.cvv,
      notes: card.notes
    };
  }
};
```

## 🧪 Testing Guidelines

### Service Testing Strategy
- **Test Business Logic**: Verify business rules and validation
- **Test Data Transformation**: Verify data formatting and conversion
- **Test Error Handling**: Verify error scenarios and messages
- **Test Edge Cases**: Verify boundary conditions and edge cases
- **Mock Dependencies**: Mock libraries/adapters for isolated testing

### Example Test
```typescript
import { cardValidationService } from './validationService';

describe('cardValidationService', () => {
  describe('validateCardNumber', () => {
    it('should validate valid card numbers', () => {
      const result = cardValidationService.validateCardNumber('4111111111111111');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });
    
    it('should reject invalid card numbers', () => {
      const result = cardValidationService.validateCardNumber('1234567890123456');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid card number');
    });
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
// Service contains business logic ✅
export const cardValidationService = {
  validateCardNumber: (number: string): ValidationResult => {
    // Business logic in service
    if (number.length < 13) {
      return { isValid: false, error: 'Invalid card number' };
    }
    // Luhn algorithm implementation...
  }
};

// Hook calls service ✅
const useCardForm = () => {
  const validateField = (field: string, value: string) => {
    return cardValidationService.validateCardNumber(value);
  };
};
```

## 📚 Best Practices

1. **Keep Services Pure**: Focus on business logic only
2. **Use Libraries**: Call libraries/adapters for external operations
3. **Handle Errors**: Provide meaningful error messages
4. **Type Safety**: Use strict TypeScript types
5. **Test Thoroughly**: Write comprehensive tests for business logic
6. **Document APIs**: Provide clear documentation and examples
7. **Follow Naming**: Use descriptive names for services and methods
8. **Single Responsibility**: Each service should have a single purpose

## 🏛️ Service Categories

### Validation Services
- Input validation
- Business rule validation
- Data integrity checks

### Formatting Services
- Data display formatting
- Data transformation
- Output formatting

### Transformation Services
- Form-to-item conversion
- Item-to-form conversion
- Data structure transformation

### Business Logic Services
- Item management
- User management
- Vault operations
- Real-time synchronization

---

**SimpliPass Services**: Robust business logic layer for secure, cross-platform password management. 