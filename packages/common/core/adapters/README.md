# Adapters Layer

## Purpose and Role

The Adapters layer provides provider-agnostic interfaces that abstract away specific implementation details of external services. This layer acts as a bridge between business logic and external providers, allowing easy provider switching without changing business logic.

### Global Application Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYERS                      │
├─────────────────────────────────────────────────────────────┤
│ Layer 1: Hooks (UI Layer)                                │
│ Layer 2: Services (Business Logic Layer)                  │
│ Layer 3: Adapters (Provider Abstraction Layer) ← YOU ARE HERE
│ Layer 4: Libraries (External Integration Layer)           │
│ External APIs & Services                                  │
└─────────────────────────────────────────────────────────────┘
```

## Core Principles

- **Provider Agnostic**: Same interface works with different providers
- **Interface Consistency**: Well-defined interfaces hide provider complexity
- **Dynamic Loading**: Platform-specific adapters loaded based on global state
- **Pure References**: Only reference library functions, no business logic

## Available Adapters

### Auth Adapter (`auth.adapter.ts`)
**Purpose**: Unified interface for authentication operations across providers.

**What it does**: Abstracts authentication operations, handles both Cognito and Firebase, provides consistent error handling.

**Current Implementation**: AWS Cognito + Firebase Auth integration

### Database Adapter (`database.adapter.ts`)
**Purpose**: Unified interface for database operations regardless of provider.

**What it does**: Abstracts CRUD operations, handles real-time data synchronization, manages database connections.

**Current Implementation**: Firebase Firestore with real-time listeners

### Platform Adapter (`platform.adapter.ts`)
**Purpose**: Platform-specific functionality with consistent interface.

**What it does**: Handles platform features (biometrics, clipboard, network), manages platform information.

**Current Implementation**: Dynamic loading of mobile or extension platform adapters

### Platform Storage Adapter (`platform.storage.adapter.ts`)
**Purpose**: Secure local storage operations across platforms.

**What it does**: Handles secure storage of sensitive data, provides platform-specific implementations.

**Current Implementation**: Dynamic loading of mobile (Expo SecureStore) or extension (Chrome Storage) storage adapters

## Architecture Approach

### Adapter Pattern Implementation
- **Provider Independence**: Business logic doesn't depend on specific providers
- **Easy Testing**: Mock adapters can be used for testing
- **Flexible Migration**: Providers can be swapped without code changes
- **Consistent Interface**: Same API regardless of underlying provider

### Proxy Pattern for Dynamic Loading
1. **Global State Check**: Adapter checks platform type from global state
2. **Dynamic Import**: Loads appropriate platform-specific adapter
3. **Method Delegation**: Delegates method calls to loaded adapter
4. **Fallback Handling**: Provides default implementations for optional methods

### Platform Management
Platform adapters integrate with global state management:
1. **Platform Detection**: Platform type determined at application startup
2. **State Storage**: Platform type stored in Zustand global state
3. **Dynamic Loading**: Adapters load platform-specific implementations based on state

## Integration with Other Layers

### Adapters → Services
Services consume adapters for external operations. Services are responsible for:
- Orchestrating multiple adapter calls
- Handling business logic errors
- Managing application state

### Adapters → Libraries
Adapters use libraries for low-level operations. Adapters are responsible for:
- Providing consistent interfaces
- Handling provider-specific details
- Managing dynamic loading

## Development Guidelines

### Design Principles
- **Interface Consistency**: All adapters provide consistent, predictable interfaces
- **Error Handling**: Convert provider-specific errors into consistent error types
- **Type Safety**: Use TypeScript interfaces for all adapter methods
- **Documentation**: Clearly document all methods and their expected behavior

### Security Considerations
- Never log sensitive data
- Use secure storage for keys and tokens
- Validate all inputs before processing
- Handle errors without exposing sensitive information

## Benefits

### Provider Flexibility
- Switch from Firebase to MongoDB without changing business logic
- Replace Cognito with Auth0 seamlessly
- Add new platform support without affecting existing code

### Testing Simplicity
- Test business logic without external dependencies
- Simulate different provider behaviors
- Test error scenarios easily

### Maintenance Efficiency
- Single interface to maintain across providers
- Consistent error handling patterns
- Centralized provider-specific logic 