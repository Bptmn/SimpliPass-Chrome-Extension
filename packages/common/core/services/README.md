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
- ✅ **Error Handling**: Provide meaningful error messages with proper categorization
- ✅ **Platform Agnostic**: Work across all platforms
- ✅ **Testable**: Isolated business logic for easy testing
- ✅ **Reusable**: Shared across all platforms

## 🏛️ Architecture Rules

### Service Responsibilities
1. **Business Logic**: Implement complex business rules and operations
2. **Data Validation**: Validate data according to business rules
3. **Data Formatting**: Transform data for display and storage
4. **Data Transformation**: Convert between different data formats
5. **Error Handling**: Provide meaningful error messages with proper categorization
6. **Orchestration**: Coordinate between multiple libraries/adapters

### What Services Should NOT Do
- ❌ **UI Logic**: No component rendering or UI state management
- ❌ **Direct User Interaction**: No user input handling or feedback
- ❌ **Navigation**: No routing or navigation logic
- ❌ **Platform-Specific Code**: No platform-specific implementations
- ❌ **Direct Library Calls**: Always use adapters, never call libraries directly

### Error Handling Strategy
- **Proper Error Categorization**: Use specific error types (`AuthenticationError`, `NetworkError`, `CryptographyError`, etc.)
- **Error Propagation**: Propagate errors to UI layer for user feedback
- **Consistent Patterns**: Use helper methods for common error handling
- **Detailed Logging**: Log errors with service context for debugging

## 📚 Available Services

### Authentication Services

#### `authService.ts`
Handles user authentication, login/logout flows, and authentication state management. Orchestrates between Cognito and Firebase authentication providers while maintaining proper error categorization for UI feedback.

#### `userService.ts`
Manages user data operations, user state, and user information retrieval. Handles user authentication state changes and provides user data to the application.

### Data Management Services

#### `itemsService.ts`
Central hub for all item operations (credentials, bank cards, secure notes). Manages item CRUD operations, encryption/decryption, and real-time synchronization. Includes state management for UI updates and external change handling.

#### `cryptoService.ts`
Handles encryption and decryption of sensitive data. Provides secure data transformation with proper error handling and validation. Ensures data integrity and security compliance.

#### `secretsService.ts`
Manages user secret keys and cryptographic operations. Handles key derivation, storage, and retrieval with proper security measures and error handling.

### Real-time Services

#### `listenerService.ts`
Manages real-time data synchronization and authentication state changes. Handles database listeners and authentication listeners with proper error handling and state management.

#### `initializationService.ts`
Orchestrates application initialization with smart checks for existing state. Manages platform-specific initialization and ensures proper service startup order.

### Storage Services

#### `vaultService.ts`
Manages local vault storage operations with platform-specific implementations. Handles secure storage of encrypted data with proper error categorization.

### Validation Services

#### `validationService.ts`
Comprehensive validation for all item types with business rules. Includes card validation (Luhn algorithm), credential validation, and secure note validation with detailed error messages.

### Transformation Services

#### `formTransformationService.ts`
Transforms form data to item objects and vice versa. Handles business rules during transformation, generates required fields, and provides validation during transformation.

## 🧪 Testing Guidelines

### Service Testing Strategy
- **Test Business Logic**: Verify business rules and validation
- **Test Data Transformation**: Verify data formatting and conversion
- **Test Error Handling**: Verify error scenarios and messages
- **Test Edge Cases**: Verify boundary conditions and edge cases
- **Mock Dependencies**: Mock libraries/adapters for isolated testing

## 🔄 Migration Guide

### From Old Pattern to New Pattern

**Old Pattern (Business Logic in Hooks)**:
- Business logic mixed with UI state management
- Direct library calls from hooks
- Poor error handling and propagation

**New Pattern (Business Logic in Services)**:
- Pure business logic in services
- Services call adapters, not libraries directly
- Proper error categorization and propagation
- Comprehensive error handling with UI feedback

## 📚 Best Practices

1. **Keep Services Pure**: Focus on business logic only
2. **Use Adapters**: Call adapters for external operations, never libraries directly
3. **Handle Errors Properly**: Provide meaningful error messages with categorization
4. **Type Safety**: Use strict TypeScript types
5. **Test Thoroughly**: Write comprehensive tests for business logic
6. **Document APIs**: Provide clear documentation and examples
7. **Follow Naming**: Use descriptive names for services and methods
8. **Single Responsibility**: Each service should have a single purpose
9. **Error Propagation**: Always propagate errors to UI layer for user feedback
10. **Consistent Patterns**: Use helper methods for common operations

## 🏛️ Service Categories

### Authentication Services
- User authentication and authorization
- Authentication state management
- User data operations

### Data Management Services
- Item CRUD operations
- Data encryption/decryption
- Real-time synchronization

### Validation Services
- Input validation
- Business rule validation
- Data integrity checks

### Transformation Services
- Form-to-item conversion
- Item-to-form conversion
- Data structure transformation

### Storage Services
- Secure data storage
- Platform-specific storage operations
- Vault management

---

**SimpliPass Services**: Robust business logic layer for secure, cross-platform password management with comprehensive error handling and proper architecture compliance. 