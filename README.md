# SimpliPass Chrome Extension

A secure password manager Chrome extension built with React DOM and TypeScript.

## 📚 Summary

- Quick Start: install, build, load the extension → [Jump](#-quick-start)
- Scripts: web dev mode, build, tests → [Jump](#-scripts)
- Architecture (simplified): layers, encryption, data flow → [Jump](#-architecture-simplified)
- Testing (simplified): what/how to test, commands → [Jump](#-testing-simplified)
- Documentation: deep dives and plans → [Jump](#-documentation)
- Security: core guarantees → [Jump](#-security)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Build the extension
npm run build:extension

# Load the extension in Chrome from the dist/ folder
```

## 🧰 Scripts

- `./scripts/launch_web.sh`: Launch web dev mode with HMR for fast UI (see `documentation/DEVELOPPEMENT_WEB_MODE.md`).
- `./scripts/build_extension.sh`: Build the Chrome extension into `dist/`.
- `./scripts/launch_tests.sh`: Run lint, type-check, unit tests, and E2E tests.

## 📁 Project Structure

```
packages/
├── common/           # Shared business logic
│   ├── core/        # Services, adapters, libraries
│   ├── hooks/       # Business logic hooks
│   └── utils/       # Utility functions
├── extension/        # Chrome extension
│   ├── ui/          # React DOM components
│   ├── popup/       # Extension popup
│   ├── popovers/    # DOM popovers
│   └── services/    # Extension services
└── shared/          # Shared types and constants
```

## 🛠️ Development

- **Extension Development**: `npm run dev:extension`
- **Testing**: `npm run test:extension`
- **Linting**: `npm run lint:extension`
- **Type Checking**: `npm run type-check:extension`

## 🏗️ Architecture (Simplified)

The extension follows a strict 3-layer architecture with a zero-knowledge security model.

- Layer 1: UI (Extension) — DOM components and hooks. No business logic, no platform APIs. Reads state from Zustand only.
- Layer 2: Services (Common Core) — Business logic orchestration, validation, encryption workflows, storage flow.
- Layer 3: Adapters/Libraries — Platform-specific integrations (Chrome APIs, Firebase, Cognito, crypto primitives). Stateless, logic-free.

### Encryption Model
- Master key derived client-side from user password + salt (PBKDF2).
- Each item has its own item key. Item key is encrypted with master key; content is encrypted with item key.
- No decrypted secrets are persisted.

### Data Flow (Single Direction)
```
Firestore (encrypted) → Chrome Session Storage (decrypted, ephemeral) → Zustand (in-memory)
```
- On logout: listeners stop, session storage cleared, state reset, sign out from Firebase and Cognito.

### Why Dual-Provider Auth?
- Cognito: authentication, MFA, secure salt storage.
- Firebase: real-time auth state and Firestore access/security rules.

For the detailed architecture document, see `documentation/ARCHITECTURE_APPROACH.md`.

## ✅ Testing (Simplified)

Focus only on high-value tests:
- Unit (Jest): pure functions, services, utils.
- Integration (Jest + RTL): essential UI interactions and hooks.
- E2E (Playwright): critical flows with real services (build extension first).

Common commands:
```bash
# Unit + integration
npm run test:extension

# E2E (requires build)
npm run build:extension && npm run test:e2e

# All tests
npm run test:all
```

For the detailed testing overview, see `documentation/TESTING_OVERVIEW.md`.

## 📚 Documentation

- [Architecture Approach](documentation/ARCHITECTURE_APPROACH.md)
- [Testing Overview](documentation/TESTING_OVERVIEW.md)
- [Web Dev Mode](documentation/DEVELOPPEMENT_WEB_MODE.md)
- [Popover Features Plan](documentation/POPOVER_FEATURES_DEVELOPMENT_PLAN.md)

## 🔐 Security

- Local encryption before storage
- Chrome secure storage APIs
- No plaintext password storage
- Secure autofill implementation

## 📄 License

MIT