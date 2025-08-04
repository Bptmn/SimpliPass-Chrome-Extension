# Libraries Layer (Layer 3: External Integration Layer)

## Purpose and Role

The Libraries layer provides **pure provider functions** that connect the application to external services and APIs. This is where the application bridges to the outside world - Firebase, AWS Cognito, Chrome APIs, and Expo APIs.

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
- **Provider Agnostic**: Easy to replace providers without changing business logic
- **No Business Logic**: All orchestration belongs in services layer
- **Single Responsibility**: Each library has one clear purpose

## Available Libraries

### Authentication (`auth/`)
**Purpose**: Handle AWS Cognito and Firebase authentication operations.

**Files**:
- `cognito.ts` - AWS Cognito integration functions
- `firebase.ts` - Firebase authentication functions  
- `config.ts` - Platform-agnostic configuration
- `index.ts` - Exports all authentication functions

### Database (`database/`)
**Purpose**: Handle Firebase Firestore database operations.

**Files**:
- `firestore.ts` - Firebase Firestore integration functions
- `index.ts` - Exports all database functions
- `mock_database.ts` - Mock implementation for testing

## Architecture Approach

### Layer Separation
1. **Hooks (Layer 1)**: Handle UI state and user interactions
2. **Services (Layer 2)**: Contain business logic and orchestration  
3. **Libraries (Layer 4)**: Provide pure external API integration

### Data Flow
```
User Action → Hook → Service → Library → External API
```

### Platform Management
Platform-specific functionality is managed through global state rather than libraries. The platform type ('mobile' or 'extension') is set at application startup and accessed through global state.

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

## Integration with Other Layers

### Libraries → Services
Services call libraries for external operations. Services are responsible for:
- Orchestrating multiple library calls
- Handling business logic errors
- Managing application state

### Libraries → External APIs
Libraries handle the low-level details of external API interactions:
- Authentication and authorization
- Request/response formatting
- Error handling and retry logic 