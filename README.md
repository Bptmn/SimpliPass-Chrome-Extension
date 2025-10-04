# SimpliPass Chrome Extension

A secure password manager Chrome extension built with React DOM and TypeScript.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Build the extension
npm run build:extension

# Load the extension in Chrome from the dist/ folder
```

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

## 📚 Documentation

- [Architecture Overview](docs/EXTENSION_ARCHITECTURE.md)
- [Migration Notes](docs/EXTENSION_MIGRATION_NOTES.md)
- [Testing Guide](docs/TESTING_OVERVIEW.md)
- [Development Plans](docs/development/)

## 🔐 Security

- Local encryption before storage
- Chrome secure storage APIs
- No plaintext password storage
- Secure autofill implementation

## 📄 License

MIT