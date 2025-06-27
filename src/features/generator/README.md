# Password Generator Feature

## Purpose

Provides secure password generation with customizable options for length, character sets, and complexity requirements.

## Components

- `GeneratorPage` - Interactive password generator interface with customization options

## Services

- Currently leverages shared utilities in `shared/utils/passwordGenerator.ts`
- Future expansion may include generator service logic

## Public API

```typescript
// Components
import { GeneratorPage } from 'features/generator';
```

## Dependencies

- Password strength checker from shared utilities
- Cryptographically secure random number generation
- Clipboard API for password copying
