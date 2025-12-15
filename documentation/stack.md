# Technology Stack

> Complete overview of technologies used in SimpliPass Chrome Extension

## Table of Contents

- [Core Technologies](#core-technologies)
- [Build & Bundling](#build--bundling)
- [Backend & Authentication](#backend--authentication)
- [Security & Cryptography](#security--cryptography)
- [State Management](#state-management)
- [Routing](#routing)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [UI Components & Utilities](#ui-components--utilities)

---

## Core Technologies

### React 18
**Purpose**: UI framework for building component-based interfaces

- Declarative, component-based architecture
- Virtual DOM for efficient rendering
- Hooks API for state and side effects
- Used for popup, content scripts, and web mode

### React DOM
**Purpose**: React renderer for web browsers

- Renders React components to the DOM
- Handles browser-specific events and reconciliation

### TypeScript 5.2
**Purpose**: Type-safe JavaScript superset

- Static type checking at compile time
- Enhanced IDE support and autocompletion
- Interface and type definitions for all data structures
- Strict mode enabled for maximum type safety

---

## Build & Bundling

### Vite 7
**Purpose**: Modern build tool and dev server

- Fast HMR (Hot Module Replacement) during development
- Optimized production builds with tree-shaking
- Native ES modules support
- Multiple build configurations:
  - `vite.config.ts` - Main extension build
  - `vite.config.web.ts` - Web development mode
  - `vite.background.config.ts` - Background script
  - `vite.content.config.ts` - Content scripts

### CRXJS Vite Plugin
**Purpose**: Chrome Extension integration for Vite

- Manifest V3 support
- Automatic HMR for extension development
- Content script and background worker bundling
- Asset handling for extension resources

### Babel
**Purpose**: JavaScript compiler/transpiler

- TypeScript transformation
- React JSX transformation
- Module resolution with aliases
- Jest compatibility for testing

**Presets**:
- `@babel/preset-env` - Environment-specific transforms
- `@babel/preset-typescript` - TypeScript support
- `@babel/preset-react` - JSX transformation

### PostCSS
**Purpose**: CSS processing tool

- CSS transformations and optimizations
- Plugin ecosystem for various features

### Autoprefixer
**Purpose**: Automatic vendor prefixing

- Adds CSS vendor prefixes automatically
- Browser compatibility without manual prefixes

### vite-tsconfig-paths
**Purpose**: TypeScript path alias resolution in Vite

- Resolves `@common/*`, `@extension/*` aliases
- Consistent imports across build and dev

---

## Backend & Authentication

### Firebase 10
**Purpose**: Backend-as-a-Service platform

**Services used**:
- **Firebase Authentication**: User login/signup with email
- **Firestore**: NoSQL database for encrypted vault storage
- **Security Rules**: Server-side data access control

**Why Firebase**:
- Real-time data synchronization
- Offline support with local caching
- Secure, scalable infrastructure
- Easy integration with web applications

### AWS Amplify / Cognito
**Purpose**: User authentication and MFA

- Multi-Factor Authentication (MFA) via TOTP
- Secure salt storage for key derivation
- User session management
- Integration with `amazon-cognito-identity-js`

**Why Cognito**:
- Enterprise-grade security
- MFA support out of the box
- Separate from main data storage (defense in depth)

---

## Security & Cryptography

### @stablelib/chacha20poly1305
**Purpose**: Authenticated encryption

- ChaCha20-Poly1305 AEAD cipher
- Used for encrypting vault items
- Provides both confidentiality and integrity
- Fast, secure, and constant-time implementation

### @stablelib/random
**Purpose**: Cryptographically secure random generation

- Generates random bytes for:
  - Encryption nonces
  - Key generation
  - Password generation
- Uses browser's crypto.getRandomValues()

### zxcvbn
**Purpose**: Password strength estimation

- Realistic password strength scoring
- Pattern detection (dates, names, common passwords)
- Provides feedback for password improvement
- Used in password generator and credential forms

---

## State Management

### Zustand 5
**Purpose**: Lightweight state management

- Simple, unopinionated store API
- No boilerplate or providers required
- TypeScript-first with excellent type inference
- Used for:
  - Authentication state
  - Vault data (decrypted, in-memory only)
  - UI state (navigation, forms)

**Why Zustand over Redux**:
- Minimal bundle size
- No action creators or reducers needed
- Perfect for Chrome extensions

---

## Routing

### React Router DOM 7
**Purpose**: Client-side routing

- Declarative route definitions
- Nested routes support
- Navigation guards for authentication
- Used for popup page navigation

---

## Testing

### Jest 29
**Purpose**: JavaScript testing framework

- Unit and integration tests
- Snapshot testing
- Code coverage reporting
- Mock functions and modules

**Configuration**: `configs/test/jest.config.js`

### React Testing Library
**Purpose**: React component testing

- Tests components as users interact with them
- DOM-based queries (getByRole, getByTestId)
- User event simulation
- Accessibility-focused testing

**Packages**:
- `@testing-library/react` - Core library
- `@testing-library/jest-dom` - Custom matchers
- `@testing-library/user-event` - User interaction simulation

### Navigateur MCP Cursor
**Purpose**: Tests web de la popup

- Tests via navigateur MCP de Cursor
- Mode web avec HMR pour itération rapide
- Vérification des logs console en temps réel

**Configuration**: Utiliser `npm run dev:web` + navigateur MCP Cursor

**Processus**:
- Démarrer serveur web : `npm run dev:web`
- Naviguer vers : `http://localhost:3000/packages/extension/popup/index.html`
- Utiliser `browser_navigate`, `browser_snapshot`, `browser_console_messages`

### jest-environment-jsdom
**Purpose**: DOM simulation for Jest

- Provides browser-like environment in Node.js
- Required for React component testing

### fake-indexeddb
**Purpose**: IndexedDB mock for testing

- Simulates IndexedDB in test environment
- Used for testing storage operations

---

## Code Quality

### ESLint 8
**Purpose**: JavaScript/TypeScript linter

- Code quality enforcement
- Bug prevention
- Consistent code style

**Plugins**:
- `@typescript-eslint/*` - TypeScript-specific rules
- `eslint-plugin-react` - React best practices
- `eslint-plugin-react-hooks` - Hooks rules
- `eslint-plugin-import` - Import/export validation
- `eslint-plugin-jsx-a11y` - Accessibility rules
- `eslint-plugin-prettier` - Prettier integration

### Prettier 3
**Purpose**: Code formatter

- Consistent code formatting
- Integrates with ESLint
- Auto-formats on save (IDE integration)

### Husky 8
**Purpose**: Git hooks manager

- Pre-commit hooks for linting
- Pre-push hooks for tests
- Ensures code quality before commits

---

## UI Components & Utilities

### react-icons
**Purpose**: Icon library

- Thousands of icons from popular sets
- Tree-shakeable imports
- Consistent icon styling

### react-window
**Purpose**: Virtualized list rendering

- Efficiently renders large lists
- Only renders visible items
- Used for credential lists with many items

### axios
**Purpose**: HTTP client (dev dependency)

- Promise-based HTTP requests
- Request/response interceptors
- Used in development and testing

### dotenv
**Purpose**: Environment variable loading

- Loads `.env` files in development
- Keeps secrets out of source code

---

## Development Tools

### TypeScript Type Definitions

- `@types/react` - React types
- `@types/react-dom` - React DOM types
- `@types/chrome` - Chrome extension API types
- `@types/jest` - Jest types
- `@types/node` - Node.js types
- `@types/zxcvbn` - Password strength types
- `@types/react-window` - Virtualized list types

### Firebase Tools
**Purpose**: Firebase CLI and emulators

- Local Firestore emulator for testing
- Deployment tools
- Security rules testing

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│                    Chrome Extension                      │
├─────────────────────────────────────────────────────────┤
│  UI Layer (React + Zustand + React Router)              │
├─────────────────────────────────────────────────────────┤
│  Business Logic (TypeScript Services)                   │
├─────────────────────────────────────────────────────────┤
│  Adapters (Firebase, Cognito, Chrome APIs)              │
├─────────────────────────────────────────────────────────┤
│  Cryptography (@stablelib/chacha20poly1305)             │
└─────────────────────────────────────────────────────────┘
```

---

## Version Summary

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2 | UI Framework |
| TypeScript | 5.2 | Type Safety |
| Vite | 7.0 | Build Tool |
| Firebase | 10.8 | Backend/Auth |
| AWS Amplify | 6.15 | MFA/Cognito |
| Zustand | 5.0 | State Management |
| Jest | 29.7 | Unit Testing |
| Navigateur MCP Cursor | - | Tests Web Popup |
| ESLint | 8.57 | Linting |
| Prettier | 3.6 | Formatting |

---

*Last updated: December 2024*
