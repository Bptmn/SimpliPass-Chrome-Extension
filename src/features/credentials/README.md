# Credentials Feature

## Purpose

Manages password storage, retrieval, encryption/decryption, and CRUD operations for user credentials in the SimpliPass vault.

## Components

- `HomePage` - Main dashboard displaying credential list with search/filter
- `AddCredentialPage` - Form for creating new password entries
- `CredentialDetailsPage` - View/edit individual credential details
- `ModifyCredentialPage` - Edit existing credential information

## Services

- `items.ts` - Core credential management including:
  - `refreshCredentialsInVaultDb()` - Sync credentials from Firebase
  - `getAllCredentialsFromVaultDb()` - Retrieve all stored credentials
  - `createCredential()` - Add new credential with encryption
  - `updateCredential()` - Modify existing credential
  - `deleteCredential()` - Remove credential from vault
  - `getCredentialsByDomainFromVaultDb()` - Domain-specific credential lookup

## Public API

```typescript
// Components
import {
  HomePage,
  AddCredentialPage,
  CredentialDetailsPage,
  ModifyCredentialPage,
} from 'features/credentials';

// Services
import {
  createCredential,
  updateCredential,
  deleteCredential,
  getAllCredentialsFromVaultDb,
} from 'features/credentials';
```

## Dependencies

- Firestore for cloud storage
- IndexedDB for local caching
- Cryptography service for encryption/decryption
- Domain utilities for URL matching
