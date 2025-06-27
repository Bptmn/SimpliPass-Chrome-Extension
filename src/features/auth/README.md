# Authentication Feature

## Purpose

Handles user authentication, login flows, MFA verification, and session management for the SimpliPass Chrome Extension.

## Components

- `LoginPage` - Main authentication interface with email/password inputs
- `EmailConfirmationPage` - MFA code verification interface

## Services

- `user.ts` - Core authentication logic including:
  - `loginUser()` - Authenticate user with email/password
  - `confirmMfa()` - Verify MFA codes
  - `logoutUser()` - Clean logout and session cleanup
  - `getUserSecretKey()` / `storeUserSecretKey()` - Secure key management

## Public API

```typescript
// Components
import { LoginPage, EmailConfirmationPage } from 'features/auth';

// Services
import { loginUser, confirmMfa, logoutUser } from 'features/auth';
```

## Dependencies

- AWS Cognito for authentication
- Firebase for session management
- Secure local storage for encryption keys
