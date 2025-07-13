# 📋 SimpliPass Comprehensive Refactor Plan

## Executive Summary

This document outlines a complete architectural refactor of SimpliPass to address growing complexity, code redundancy, and platform separation issues. The plan incorporates best practices from monorepo architecture, password manager security patterns, and is optimized for execution with Cursor AI.

---

## 🎯 Key Problems Being Addressed

### Current Issues
1. **Code Spreading**: Logic scattered across multiple packages without clear boundaries
2. **Redundancy**: Duplicate implementations for similar functionality
3. **Platform Confusion**: Unclear separation between mobile and extension-specific code
4. **State Management**: Inconsistent data flow between storage, memory, and UI
5. **Cursor Inefficiency**: AI assistant creating redundant code due to unclear architecture

### Root Causes
- Rapid evolution from single platform to multi-platform without architectural refactor
- Missing clear adapter pattern for platform-specific implementations
- Insufficient documentation of architectural decisions
- No clear separation of concerns between packages

---

## 🏗️ Target Architecture

### Core Principles
1. **Single Source of Truth**: All UI data comes from RAM (Zustand states)
2. **Platform Abstraction**: All platform-specific code isolated behind adapters
3. **Feature Verticals**: Related code grouped by business domain
4. **Security First**: Zero-knowledge architecture with memory-only decrypted data
5. **Clear Boundaries**: Each package has a single, well-defined responsibility

### Package Structure

```
packages/
├── app/                    # Shared UI & Components (Platform-agnostic)
│   ├── components/         # Reusable UI components
│   ├── screens/           # Application screens
│   ├── navigation/        # Navigation configuration
│   └── styles/            # Shared styles and theme
│
├── core/                  # Business Logic & State (Platform-agnostic)
│   ├── adapters/         # Platform adapter interfaces
│   ├── auth/             # Authentication logic
│   ├── crypto/           # Encryption/decryption
│   ├── database/         # Firestore abstractions
│   ├── logic/            # Business rules
│   ├── states/           # Zustand stores
│   └── types/            # Shared TypeScript types
│
├── mobile/               # Mobile-specific implementations
│   ├── adapters/        # Platform adapter implementations
│   ├── auth/            # Biometric authentication
│   ├── storage/         # Keychain/Keystore access
│   └── services/        # Mobile-specific services
│
├── extension/           # Chrome Extension-specific
│   ├── adapters/       # Platform adapter implementations
│   ├── background/     # Service worker
│   ├── content/        # Content scripts
│   ├── popup/          # Extension popup entry
│   ├── autofill/       # Autofill logic
│   └── vault/          # Local vault management
│
└── shared/             # Static utilities
    ├── constants/      # App-wide constants
    ├── types/          # Base type definitions
    └── utils/          # Pure utility functions
```

---

## 📐 Architectural Patterns

### 1. Platform Adapter Pattern

```typescript
// core/adapters/platform.adapter.ts
export interface PlatformAdapter {
  // Storage Operations
  getUserSecretKey(): Promise<string | null>;
  storeUserSecretKey(key: string): Promise<void>;
  deleteUserSecretKey(): Promise<void>;
  
  // Vault Operations (Extension only)
  getEncryptedVault?(): Promise<EncryptedVault | null>;
  storeEncryptedVault?(vault: EncryptedVault): Promise<void>;
  
  // Platform Info
  getPlatformName(): 'mobile' | 'extension';
  supportsBiometric(): boolean;
  supportsOfflineVault(): boolean;
}

// mobile/adapters/platform.adapter.ts
export class MobilePlatformAdapter implements PlatformAdapter {
  async getUserSecretKey() {
    return SecureStore.getItemAsync('userSecretKey');
  }
  // ... mobile-specific implementations
}

// extension/adapters/platform.adapter.ts
export class ExtensionPlatformAdapter implements PlatformAdapter {
  async getUserSecretKey() {
    return this.decryptFromStorage();
  }
  // ... extension-specific implementations
}
```

### 2. Data Flow Architecture

#### Mobile Flow
```
Login → Derive Key → Store in Keychain
     ↓
Firestore → Decrypt → Zustand States → UI
     ↑                        ↓
     └── Auto-sync on change ←┘
```

#### Extension Flow
```
Login → Derive Key → Store in RAM + Encrypted Storage
     ↓
Try States → Try Local Vault → Fetch Firestore
     ↓              ↓               ↓
     └──────────────┴───────────────┘
                    ↓
            Decrypt → States + Local → UI
```

### 3. State Management Pattern

```typescript
// core/states/credentials.state.ts
interface CredentialsState {
  credentials: CredentialDecrypted[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCredentials: (credentials: CredentialDecrypted[]) => void;
  addCredential: (credential: CredentialDecrypted) => void;
  updateCredential: (id: string, updates: Partial<CredentialDecrypted>) => void;
  deleteCredential: (id: string) => void;
  clearCredentials: () => void;
}

// UI components ONLY read from states
const credentials = useCredentialsStore(state => state.credentials);
```

---

## 🔒 Security Architecture

### Core Security Principles
1. **Zero Persistence**: No plaintext data ever written to disk
2. **Memory-First**: All decrypted data lives only in RAM
3. **Platform Security**: Leverage platform-specific secure storage
4. **Encryption at Rest**: All persistent data is encrypted
5. **Key Isolation**: Master keys never leave secure storage

### Security Implementation

```typescript
// Mobile Security
- UserSecretKey → iOS Keychain / Android Keystore
- No local vault (always fetch from Firestore)
- Biometric authentication support
- Automatic memory clearing on background

// Extension Security
- UserSecretKey → Encrypted with device fingerprint
- Local encrypted vault for offline access
- Background script owns decrypted vault
- Content script receives only needed data
```

---

## 🚀 Implementation Plan

### Phase 1: Foundation (Week 1)
1. [x] Create comprehensive adapter interfaces
2. [x] Set up platform detection utilities
3. [x] Create shared type definitions
4. [x] Establish clear package boundaries
5. [x] Document architectural decisions

### Phase 2: Platform Separation (Week 2)
1. [x] Extract mobile-specific code to `mobile/`
2. [x] Extract extension-specific code to `extension/`
3. [x] Implement platform adapters
4. [x] Create platform-specific services
5. [ ] Remove platform code from `core/`

### Phase 3: State Unification (Week 3)
1. [x] Consolidate all Zustand stores
2. [x] Implement consistent state patterns
3. [x] Create state synchronization logic
4. [x] Add state persistence adapters
5. [ ] Remove direct storage access from UI

### Phase 4: Logic Consolidation (Week 4)
1. [x] Merge duplicate business logic
2. [x] Create unified data flow
3. [x] Implement consistent error handling
4. [x] Standardize naming conventions
5. [ ] Remove dead code

### Phase 5: Testing & Documentation (Week 5)
1. [x] Update all tests for new architecture
2. [x] Create integration tests
3. [x] Document all adapters
4. [x] Create architecture diagrams
5. [x] Update developer guides

---



## 📊 Success Metrics

### Code Quality Metrics
- [ ] Zero platform-specific code in `app/` or `core/`
- [ ] 100% of UI data from Zustand states
- [ ] All platform features behind adapters
- [ ] No duplicate business logic
- [ ] Consistent naming across codebase

### Security Metrics
- [ ] No plaintext in storage
- [ ] All keys in secure storage
- [ ] Memory cleared on logout
- [ ] Encryption on all persistent data
- [ ] Security events logged

### Developer Experience Metrics
- [ ] Zero platform-specific bugs in shared code
- [ ] Clear documentation for all patterns


## 📝 Appendix

### A. File Naming Conventions
```
Components: PascalCase.tsx
Hooks: useCamelCase.ts
Utilities: camelCase.ts
Types: types.ts or interfaces.ts
Tests: *.test.ts or *.test.tsx
Stories: *.stories.tsx
```

### B. Import Order
```typescript
// 1. External imports
import React from 'react';
import { View } from 'react-native';

// 2. Internal aliases
import { Button } from '@app/components';
import { useAuth } from '@core/hooks';

// 3. Relative imports
import { LocalComponent } from './LocalComponent';
import styles from './styles';

// 4. Types
import type { Props } from './types';
```

### C. Error Handling Pattern
```typescript
try {
  const result = await riskyOperation();
  return { success: true, data: result };
} catch (error) {
  logger.error('Operation failed', { error, context });
  return { success: false, error: error.message };
}
```

### D. Testing Pattern
```typescript
describe('FeatureName', () => {
  describe('ComponentName', () => {
    it('should handle success case', () => {
      // Arrange
      // Act
      // Assert
    });
    
    it('should handle error case', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

---

*This refactor plan is designed to be executed incrementally with Cursor AI assistance. Each section provides clear patterns and examples that Cursor can use to generate consistent, high-quality code. The architecture prioritizes security, maintainability, and developer experience.* 