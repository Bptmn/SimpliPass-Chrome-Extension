# 🔐 Authentication Library

## Purpose and Role

The Authentication Library provides **pure provider functions** for all authentication-related external API calls. This library serves as the bridge between the application's authentication needs and external providers like AWS Cognito and Firebase.

### Global Application Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYERS                      │
├─────────────────────────────────────────────────────────────┤
│ Layer 1: Hooks (UI Layer)                                │
│ Layer 2: Services (Business Logic Layer)                  │
│ Layer 3: Adapters (Provider Abstraction Layer)            │
│ Layer 4: Libraries (External Integration Layer) ← YOU ARE HERE
│ External APIs & Services                                  │
└─────────────────────────────────────────────────────────────┘
```

## Core Principles

- **Pure Functions**: Only stateless functions that interact with external APIs
- **No Business Logic**: All orchestration moved to services layer
- **No Classes**: Removed unnecessary abstractions
- **No Mock Data**: Removed all mock implementations from production code

## Library Structure

### Files and Their Purposes

**`cognito.ts`** - AWS Cognito Integration
- **Purpose**: Handles all AWS Cognito authentication operations
- **Functions**: Login, logout, user salt retrieval, token management

**`firebase.ts`** - Firebase Authentication Integration
- **Purpose**: Handles all Firebase authentication operations
- **Functions**: Firebase initialization, custom token authentication, auth state management

**`config.ts`** - Platform-Agnostic Configuration
- **Purpose**: Loads authentication configuration based on current platform
- **Functions**: Configuration loading, validation, platform detection

**`index.ts`** - Function Exports
- **Purpose**: Provides clean interface for all authentication functions
- **Functions**: Centralized exports for easy importing

## Authentication Flow

### Multi-Provider Strategy
1. **Cognito Primary**: AWS Cognito handles initial user authentication
2. **Firebase Secondary**: Firebase provides real-time authentication state
3. **Token Exchange**: Cognito tokens exchanged for Firebase custom tokens
4. **Unified State**: Both providers work together seamlessly

### Security Architecture
- **Zero-Knowledge**: No decrypted data ever persisted
- **Token Management**: All tokens managed securely and never logged
- **Platform Security**: Uses platform-specific secure storage
- **Memory Security**: All decrypted data is ephemeral

## Integration with Other Layers

### Libraries → Services
Services consume the authentication library for business logic:
- **Orchestration**: Services coordinate multiple authentication operations
- **Error Handling**: Services handle business-specific error scenarios
- **State Management**: Services manage application state based on authentication results

### Libraries → External APIs
The authentication library handles external API interactions:
- **AWS Cognito**: User authentication, token management, user attributes
- **Firebase**: Custom token authentication, auth state listeners
- **Error Handling**: Converts external API errors into consistent error types

## Development Guidelines

### Design Principles
- **Pure Functions**: Every function has a single, clear purpose
- **No State**: Libraries should not maintain internal state
- **Error Propagation**: Always propagate errors up to the calling layer
- **Type Safety**: Use TypeScript interfaces for all external API interactions

### Security Considerations
- Never log sensitive data
- Use secure storage for keys and tokens
- Validate all inputs before processing
- Handle errors without exposing sensitive information

## Platform Considerations

### Mobile Platform
- **Secure Storage**: Uses Expo SecureStore for token storage
- **Biometric Integration**: Supports biometric authentication through platform adapters
- **Offline Support**: Handles offline authentication scenarios
- **Network Handling**: Manages network connectivity issues gracefully

### Extension Platform
- **Secure Storage**: Uses Chrome Storage API for token storage
- **Browser Integration**: Leverages browser-specific authentication features
- **Tab Management**: Handles authentication across multiple tabs
- **Extension APIs**: Uses Chrome extension APIs for enhanced functionality 