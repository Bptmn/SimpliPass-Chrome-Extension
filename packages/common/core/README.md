# SimpliPass Core Package

This package contains the core business logic for SimpliPass, implementing a clean three-layer architecture pattern that ensures maximum code reuse and maintainability.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Three-Layer Architecture                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Hooks     │  │  Services   │  │ Libraries   │          │
│  │   (UI)      │  │ (Business)  │  │(External)   │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Layer Structure

### Layer 1: Hooks (UI Layer)
**Location**: `packages/common/hooks/`
**Purpose**: Pure UI state management and user interactions

**Characteristics**:
- Simple, readable functions
- Handle UI state only (no business logic)
- Abstract complexity from components
- Always return stable, typed results for UI consumption

**Key Hooks**:
- `useCardForm` - Card form orchestration with validation and formatting
- `useCredentialForm` - Credential form orchestration with validation
- `useClipboard` - Clipboard operations with toast integration
- `usePasswordVisibility` - Password visibility toggle state
- `useContentSize` - Dynamic input height management
- `useFormState` - Generic form state management
- `useFormValidation` - Validation integration with services

### Layer 2: Services (Business Logic Layer)
**Location**: `packages/common/core/services/`
**Purpose**: Business logic orchestration, validation, formatting, and data transformation

**Characteristics**:
- Handle complex business operations
- Implement validation rules
- Format and transform data
- Coordinate between multiple libraries
- Handle error transformation

**Key Services**:
- `validationService.ts` - Comprehensive validation for all item types
  - `cardValidationService` - Bank card validation (Luhn algorithm, CVV, expiration)
  - `credentialValidationService` - Credential validation (email, password, URL)
  - `secureNoteValidationService` - Secure note validation
  - `commonValidationService` - Generic validation utilities

- `formattingService.ts` - Data formatting and transformation
  - `cardFormattingService` - Card number formatting, masking, card type detection
  - `dateFormattingService` - Date formatting utilities
  - `textFormattingService` - Text formatting, capitalization, truncation
  - `displayFormattingService` - Display utilities (file size, currency, password strength)

- `formTransformationService.ts` - Form data transformation
  - `cardFormTransformationService` - Card form to item transformation
  - `credentialFormTransformationService` - Credential form to item transformation
  - `secureNoteFormTransformationService` - Secure note form to item transformation

- `itemsService.ts` - Item management operations
- `userService.ts` - User management operations
- `secretsService.ts` - Secret key management
- `vaultService.ts` - Vault operations
- `listenerService.ts` - Real-time data listeners

### Layer 3: Libraries & Adapters (Integration Layer)
**Location**: `packages/common/core/libraries/` and `packages/common/core/adapters/`
**Purpose**: Low-level integration with external APIs, platform-specific calls, and utilities

**Characteristics**:
- Handle external API calls
- Platform-specific implementations
- Low-level operations (crypto, storage)
- Called only by services

**Key Libraries**:
- `auth/` - Authentication providers (Cognito, Firebase)
  - `auth.ts` - Authentication operations
  - `cognito.ts` - AWS Cognito integration
  - `firebase.ts` - Firebase authentication
  - `config.ts` - Authentication configuration

- `database/` - Database operations
  - `firestore.ts` - Firestore database operations
  - `mock_database.ts` - Mock database for testing

- `crypto/` - Cryptographic utilities
  - Built-in crypto operations for encryption/decryption

**Key Adapters**:
- `auth.adapter.ts` - Authentication adapter interface
- `database.adapter.ts` - Database adapter interface
- `platform.adapter.ts` - Platform-specific adapter interface
- `platform.storage.adapter.ts` - Secure storage adapter interface

## 🔄 Data Flow Examples

### Card Form Flow
```
UI Component → useCardForm → validationService → formattingService → formTransformationService → itemsService → database.adapter
```

### Credential Form Flow
```
UI Component → useCredentialForm → validationService → formTransformationService → itemsService → crypto → database.adapter
```

### Copy Operation Flow
```
UI Component → useClipboard → platform.adapter → Toast notification
```

## 🛡️ Error Handling

The core package implements a comprehensive error handling system:

- **SimpliPassError** - Base error class with layer information
- **AuthenticationError** - Authentication-related errors
- **ValidationError** - Form validation errors
- **FormattingError** - Data formatting errors
- **TransformationError** - Data transformation errors
- **NetworkError** - Network-related errors
- **VaultError** - Vault operation errors

## 🧪 Testing Strategy

Each layer has specific testing requirements:

- **Hooks**: Test UI state management and error handling
- **Services**: Test business logic orchestration and validation
- **Libraries**: Test external API integrations
- **Adapters**: Test platform-specific implementations

## 📝 Usage Examples

### Using a Form Hook
```typescript
import { useCardForm } from '@common/hooks/useCardForm';

const { 
  formData, 
  errors, 
  isSubmitting, 
  handleFieldChange, 
  handleSubmit 
} = useCardForm();

const handleCardNumberChange = (value: string) => {
  handleFieldChange('cardNumber', value);
};
```

### Using a Service
```typescript
import { cardValidationService } from '@common/core/services/validationService';

const validationResult = cardValidationService.validateCardNumber('4111111111111111');
if (!validationResult.isValid) {
  console.error(validationResult.error);
}
```

### Using a Formatting Service
```typescript
import { cardFormattingService } from '@common/core/services/formattingService';

const formattedNumber = cardFormattingService.formatCardNumber('4111111111111111');
// Returns: "4111 1111 1111 1111"
```

### Using an Adapter
```typescript
import { getPlatformAdapter } from '@common/core/adapters/platform.adapter';

const adapter = await getPlatformAdapter();
const secretKey = await adapter.getUserSecretKey();
```

## 🏛️ Architecture Principles

### Design Principles
- **Separation of Concerns**: Each layer has a single responsibility
- **Dependency Inversion**: Higher layers depend on abstractions, not implementations
- **Code Reuse**: Shared services and hooks across platforms
- **Testability**: Isolated business logic for easy testing
- **Maintainability**: Clear patterns and consistent structure

### Layer Rules
1. **Hooks**: Only manage UI state, call services for business logic
2. **Services**: Contain business logic, call adapters for external operations
3. **Libraries/Adapters**: Handle external APIs and platform-specific code
4. **No Cross-Layer Dependencies**: Hooks never call libraries directly

## 🌐 Platform Support

The core package is designed to work across multiple platforms:

- **Mobile** (React Native) - iOS and Android
- **Extension** (Chrome Extension) - Browser extension
- **Web** (React) - Web application

Platform-specific code is isolated in the adapters layer, ensuring 90%+ code reuse across platforms.

## 📚 Development Guidelines

1. **Layer Separation**: Never call libraries directly from hooks
2. **Business Logic**: Always place business logic in services
3. **Error Handling**: Always use custom error classes with layer information
4. **Type Safety**: Use strict TypeScript types throughout
5. **Testing**: Write tests for each layer independently
6. **Documentation**: Document all public APIs with clear examples

---

**SimpliPass Core**: The foundation of secure, cross-platform password management with clean architecture. 