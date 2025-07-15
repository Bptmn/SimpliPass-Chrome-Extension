# SimpliPass Core Package

This package contains the core business logic for SimpliPass, implementing a clean three-layer architecture pattern.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Three-Layer Architecture                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Hooks     │  │  Services   │  │ Libraries   │          │
│  │   (UI)      │  │ (Business)  │  │(External)   │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## Layer Structure

### Layer 1: Hooks (UI Layer)
**Location**: `packages/app/core/hooks/`
**Purpose**: Handle UI state and user interactions

**Characteristics**:
- Simple, readable functions
- Handle loading states and errors
- Abstract complexity from components
- Always return data from memory (Zustand states)

**Key Hooks**:
- `useLoginFlow` - Handle login flow with error handling
- `useRefreshData` - Refresh data from external sources
- `useCredentials` - Manage credential operations
- `useSecretKeyCheck` - Check user authentication status

### Layer 2: Services (Business Logic Layer)
**Location**: `packages/app/core/services/`
**Purpose**: Orchestrate complex business logic

**Characteristics**:
- Handle complex operations
- Coordinate between multiple libraries
- Implement business rules
- Handle error transformation

**Key Services**:
- `auth.ts` - Authentication operations
- `cryptography.ts` - Encryption/decryption operations
- `items.ts` - Item management (credentials, bank cards, notes)
- `vault.ts` - Vault storage and synchronization
- `states.ts` - State management operations
- `session.ts` - Session management

### Layer 3: Libraries & Adapters (External Integration Layer)
**Location**: `packages/app/core/libraries/`
**Purpose**: Handle external APIs and platform-specific operations

**Characteristics**:
- Handle external API calls
- Platform-specific implementations
- Low-level operations (crypto, storage)
- Called only by services

**Key Libraries**:
- `auth/` - Authentication providers (Cognito, Firebase)
- `crypto/` - Cryptographic operations
- `database/` - Database operations (Firestore)
- `platform/` - Platform adapters (mobile, extension)

## State Management

**Location**: `packages/app/core/states/`
**Purpose**: Centralized state management using Zustand

**Key States**:
- `auth.state.ts` - Authentication state
- `credentials.state.ts` - Credentials state
- `bankCards.state.ts` - Bank cards state
- `secureNotes.state.ts` - Secure notes state
- `user.state.ts` - User state

## Type Definitions

**Location**: `packages/app/core/types/`
**Purpose**: TypeScript type definitions for the entire application

**Key Types**:
- `auth.types.ts` - Authentication types
- `items.types.ts` - Item types (credentials, bank cards, notes)
- `platform.types.ts` - Platform adapter types
- `errors.types.ts` - Error handling types
- `shared.types.ts` - Shared utility types

## Data Flow

### Authentication Flow
```
UI Component → useLoginFlow → loginUser Service → Cognito/Firebase Libraries
```

### Data Refresh Flow
```
UI Component → useRefreshData → getAllItems Service → Firestore Library → States
```

### Item Management Flow
```
UI Component → useCredentials → addCredential Service → Crypto Library → Firestore Library
```

## Error Handling

The core package implements a comprehensive error handling system:

- **SimpliPassError** - Base error class
- **AuthenticationError** - Authentication-related errors
- **CryptographyError** - Encryption/decryption errors
- **NetworkError** - Network-related errors
- **VaultError** - Vault operation errors

## Testing Strategy

Each layer has specific testing requirements:

- **Hooks**: Test UI state management and error handling
- **Services**: Test business logic orchestration
- **Libraries**: Test external API integrations
- **States**: Test state updates and persistence

## Usage Examples

### Using a Hook
```typescript
import { useLoginFlow } from '@common/core/hooks/useLoginFlow';

const { login, isLoading, error } = useLoginFlow();

const handleLogin = async () => {
  await login(email, password);
};
```

### Using a Service
```typescript
import { loginUser } from '@common/core/services/auth';

const result = await loginUser(email, password);
```

### Using a Library
```typescript
import { getPlatformAdapter } from '@common/core/libraries/platform';

const adapter = await getPlatformAdapter();
const secretKey = await adapter.getUserSecretKey();
```

## Development Guidelines

1. **Layer Separation**: Never call libraries directly from hooks
2. **Error Handling**: Always use custom error classes
3. **Type Safety**: Use strict TypeScript types throughout
4. **Testing**: Write tests for each layer independently
5. **Documentation**: Document all public APIs

## Platform Support

The core package is designed to work across multiple platforms:

- **Mobile** (React Native) - iOS and Android
- **Extension** (Chrome Extension) - Browser extension
- **Web** (React) - Web application

Platform-specific code is isolated in the libraries layer through adapters. 