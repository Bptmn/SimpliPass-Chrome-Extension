# SimpliPass Chrome Extension

A secure password manager Chrome extension built with React DOM and TypeScript.

## 📚 Summary

- **Quick Start**: install, build, load the extension → [Jump](#-quick-start)
- **AI Assistant**: context and rules for autonomous development → [Jump](#-ai-assistant-documentation)
- **Scripts**: web dev mode, build, tests → [Jump](#-scripts)
- **Architecture**: layers, encryption, data flow → [Jump](#-architecture-simplified)
- **Testing**: what/how to test, commands → [Jump](#-testing-simplified)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Build the extension
npm run build:extension

# Load the extension in Chrome from the dist/ folder
```

## 🤖 AI Assistant Documentation

If you are an AI assistant (Cursor), please refer to the `documentation/ai-assistant/` directory for all context, rules, and workflows.

- **[Cursor Usage Guide](documentation/ai-assistant/cursor-usage-guide.md)**: **START HERE** - How to use Cursor optimally (Agent mode, models, commands).
- **[Architecture & Rules](documentation/ai-assistant/architecture.md)**: Strict 3-layer architecture and data flow.
- **[Development Workflow](documentation/ai-assistant/workflow.md)**: Autonomous development loop (Web Mode -> Integration -> Browser Tests).
- **[Feature Plan](documentation/ai-assistant/features.md)**: Complete A-to-Z feature plan with checkboxes.
- **[Testing Strategy](documentation/ai-assistant/testing.md)**: Testing pyramid and debugging guide.
- **[Manual Testing Guide](documentation/ai-assistant/manual-testing-guide.md)**: How AI can automate manual popup/popover testing using Cursor's browser MCP and MCP Playwright.

## 🧰 Scripts

- `./scripts/launch_web.sh`: Launch web dev mode with HMR for fast UI (see `documentation/ai-assistant/workflow.md`).
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

- **Environment**: Copy `documentation/setup/env.exemple` to `.env` and fill in your keys. Validate with `npm run validate:env`.
- **Extension Development**: `npm run dev:extension`
- **Web Mode (UI)**: `npm run dev:web`
- **Testing**: `npm run test:extension`
- **Linting**: `npm run lint:extension`
- **Type Checking**: `npm run type-check:extension`

## 🏗️ Architecture (Simplified)

The extension follows a strict 3-layer architecture with a zero-knowledge security model.

- **Layer 1: UI (Extension)** — DOM components and hooks. No business logic, no platform APIs. Reads state from Zustand only.
- **Layer 2: Services (Common Core)** — Business logic orchestration, validation, encryption workflows, storage flow.
- **Layer 3: Adapters/Libraries** — Platform-specific integrations (Chrome APIs, Firebase, Cognito, crypto primitives). Stateless, logic-free.

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

For the detailed architecture document, see `documentation/ai-assistant/architecture.md`.

## ✅ Testing (Simplified)

Focus only on high-value tests:
- **Unit (Jest)**: pure functions, services, utils.
- **Integration (Jest + RTL)**: essential UI interactions and hooks.
- **Browser Tests (Cursor MCP)**: popup web testing via Cursor's browser MCP (web mode first).
- **Popover Tests (MCP Playwright)**: content scripts/popovers requiring real extension.

Common commands:
```bash
# Unit + integration
npm run test:extension

# All tests (unit tests only)
npm run test:all

# Build extension (required for popover tests)
npm run build:extension
```

For the detailed testing strategy, see `documentation/ai-assistant/testing.md`.

## 🔐 Security

- Local encryption before storage
- Chrome secure storage APIs
- No plaintext password storage
- Secure autofill implementation

## 📄 License

MIT
