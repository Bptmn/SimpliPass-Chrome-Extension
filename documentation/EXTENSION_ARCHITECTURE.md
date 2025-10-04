# SimpliPass Chrome Extension Architecture

## Overview

SimpliPass is a Chrome extension built with React DOM, featuring a clean three-layer architecture that separates UI concerns from business logic.

## 🏗️ Architecture Principles

### Three-Layer Model

**Layer 1: UI Layer (Hooks & Components)**
- **Purpose**: Pure UI state management and user interactions
- **Location**: `packages/extension/ui/` and `packages/extension/hooks/`
- **Responsibilities**: Form state, validation integration, UI interactions
- **Characteristics**: Simple, readable functions that manage UI state only

**Layer 2: Business Logic Layer (Services)**
- **Purpose**: Business logic orchestration, validation, and data transformation
- **Location**: `packages/common/core/services/`
- **Responsibilities**: Form validation, business rules, error handling
- **Characteristics**: Coordinate multiple lower-level libraries, transform data for UI

**Layer 3: Integration Layer (Libraries/Adapters)**
- **Purpose**: Platform-specific APIs and external integrations
- **Location**: `packages/common/core/libraries/` and `packages/common/core/adapters/`
- **Responsibilities**: Low-level external API calls, platform-specific code
- **Characteristics**: Pure implementation, no business logic

## 📁 Project Structure

```
packages/
├── common/                    # Shared business logic
│   ├── core/                 # Business logic and integration layer
│   │   ├── services/         # Layer 2: Business logic orchestration
│   │   ├── libraries/        # Layer 3: Low-level integration
│   │   ├── adapters/         # Layer 3: Platform-specific adapters
│   │   └── types/            # Shared TypeScript types
│   ├── hooks/                # UI state management hooks
│   └── utils/                # Pure utility functions
├── extension/                # Chrome extension specific code
│   ├── ui/                   # React DOM components and pages
│   │   ├── components/       # Reusable DOM components
│   │   ├── pages/            # Extension pages
│   │   └── router/           # Extension routing
│   ├── hooks/                # Extension-specific hooks
│   ├── popovers/             # DOM popovers for autofill
│   ├── services/             # Extension orchestration services
│   ├── adapters/             # Extension platform adapters
│   └── utils/                # Extension utilities
└── shared/                   # Shared constants and types
    ├── constants/            # Application constants
    ├── types/                # Base types
    └── utils/                # Shared utilities
```

## 🔄 Data Flow

### Secure Data Pipeline
```
Firestore (encrypted) → secureLocalStorage → Zustand state → UI
```

### Error Handling Flow
```
Libraries/Adapters → Services → Hooks → UI/Error Boundaries
```

## 🛠️ Development Guidelines

### For Extension Development
1. **UI Components**: Use `packages/extension/ui/components/`
2. **Pages**: Add to `packages/extension/ui/pages/`
3. **Hooks**: Extension-specific hooks in `packages/extension/hooks/`
4. **Business Logic**: Import from `@common/core/services/`

### For Shared Logic
1. **Services**: Keep in `packages/common/core/services/`
2. **Adapters**: Keep in `packages/common/core/adapters/`
3. **Utils**: Keep in `packages/common/utils/`
4. **Types**: Keep in `packages/shared/types/`

## 🔐 Security Principles

- All passwords are encrypted locally before storage
- Uses Chrome's secure storage APIs
- No plaintext passwords are ever stored
- Secure autofill implementation with proper validation
- Content scripts are untrusted entry points - all data must be sanitized

## 🧪 Testing Strategy

- **Unit Tests**: Services, adapters, and critical utilities
- **Integration Tests**: Extension contexts with Chrome APIs mocked
- **Component Tests**: DOM components using React Testing Library
- **Focus**: Business logic and error handling over UI rendering

## 📦 Build Configuration

- **Vite**: Build tool for the extension
- **TypeScript**: Type safety with extension-specific config
- **ESLint/Prettier**: Code quality and formatting
- **Jest**: Testing framework with DOM environment

## 🚀 Key Benefits

- **Clean Separation**: UI and business logic are properly separated
- **Maintainable**: Clear patterns and consistent structure
- **Testable**: Isolated business logic for easy testing
- **Secure**: Proper encryption and secure storage practices
- **Extensible**: Easy to add new features following established patterns