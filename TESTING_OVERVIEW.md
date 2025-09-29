### Extension Testing Strategy (post UI split)

- Unit tests cover services/adapters/utils in `packages/common` and `packages/extension`.
- DOM UI tests use `@testing-library/react` (no RNW).
- Keep mocks minimal: Chrome APIs in jest.setup, crypto via webcrypto.
- Prioritize error paths and boundary cases in services.

## Testing Overview (SimpliPass)

### Purpose
This single document consolidates and de-duplicates the previous testing docs (`TESTING_README.md`, `TESTING_PLAN.md`, `TESTING_IMPLEMENTATION_SUMMARY.md`, `TESTING_STRATEGY_IMPLEMENTATION.md`). It reflects the current, accurate status of the test suite and serves as the canonical guide.

## Overview

SimpliPass follows a layered architecture and a pragmatic test strategy optimized for a Chrome extension with shared common code:

- Unit tests for utilities, hooks, adapters, and services where platform-agnostic
- Integration tests for extension contexts (background, content, popup) with Chrome APIs mocked
- Minimal component tests focused on behavior over visuals

Current status (latest run):
- 35 test suites total
- 523 tests passing, 14 failing
- High coverage on utilities, hooks, adapters, and extension integrations
- Platform-dependent service/library tests removed temporarily due to `import.meta.env` limitations in Jest

## Test Structure

### Directory Organization
```
packages/
├── common/
│   ├── core/
│   │   ├── adapters/__tests__/          # Adapter tests
│   │   ├── libraries/__tests__/         # Library tests (platform-dependent ones removed)
│   │   └── services/__tests__/          # Service tests (platform-dependent ones removed)
│   ├── hooks/__tests__/                 # Hook tests
│   ├── ui/
│   │   ├── components/__tests__/        # Component tests (behavioral)
│   │   └── pages/__tests__/             # Page tests (limited)
│   └── utils/__tests__/                 # Utility tests
├── extension/
│   └── __tests__/                       # Background/content/popup integration tests
└── mobile/
    └── __tests__/                       # (reserved; not implemented yet)
```

### Commands
```bash
npm run test -- --verbose
npm run test:watch
npm run test:coverage
```

## Testing Philosophy

- Single behavior per test; descriptive names
- Test behavior, not implementation details
- Prefer logic-level tests over visual/UI rendering
- Mock only external systems (Chrome APIs, Firebase, storage, crypto platform bindings)
- Keep tests fast, deterministic, and colocated with the code they verify
- Architecture-aligned testing: Hooks (UI logic) → Services (business logic) → Adapters/Libraries (integration)

## What It Covers (Today)

- Utilities (packages/common/utils)
  - Comprehensive coverage (100+ tests): formatting, domains, validation, credential helpers, password generation, etc.

- Hooks (packages/common/hooks)
  - Clipboard, password visibility, debounced value, password generator, content sizing, form state/validation, text formatting

- Adapters (packages/common/core/adapters)
  - Database adapter proxy (CRUD, listeners, id generation)
  - Platform storage adapter proxy (secure key/vault persistence)

- Services (packages/common/core/services)
  - Crypto service (encryption/decryption, error handling) fully covered
  - Items service mostly covered (minor assertion mismatches remain)

- Extension integration (packages/extension/__tests__)
  - Background messaging
  - Content script autofill logic
  - Popup app integration (auth/onboarding state flows with mocks)

- Components (packages/common/ui/components)
  - Behavior-first tests for components like `CopyButton` and `Icon`

## What It Does Not Cover (and Why)

- Platform-dependent services: `userService`, `authService`, `listenerService`
  - Why: These transitively rely on `packages/common/config/platform.ts` which uses `import.meta.env`. Jest (CJS/Node) cannot parse `import.meta.env` at module evaluation time without an ESM-aware transform. To keep the suite reliable, these tests were removed for now.

- Firebase library tests (e.g., Firestore direct library)
  - Why: Same `import.meta.env` platform-config dependency. Running emulator-backed tests across the whole suite adds fragility/latency; we will reintroduce targeted, isolated tests after resolving env strategy.

- Full page flows with complex navigation
  - Why: Pages couple router context, multi-step forms, and service orchestration. Tests are brittle without a slimmed navigation test harness. We currently validate routing logic indirectly via integration tests and hook-level logic.

- Mobile-specific testing (React Native)
  - Why: Not a current priority; mobile surface is not finalized. React Native Web mapping is supported at build-time, but dedicated mobile tests and native adapters are out of scope for now.

- E2E (Playwright) across real Chromium with packed extension
  - Why: Deferred until unit/integration stability is 100% and platform-config strategy is finalized.

## Possible Improvements (Next Steps)

1) Resolve `import.meta.env` in tests (enables platform-dependent suites)
   - Option A: Build-time indirection file per environment (app vs test), and map via Jest `moduleNameMapper`
   - Option B: Convert platform config to read from `process.env` in Node/tests and `import.meta.env` in app builds behind a tiny abstraction
   - Option C: ESM Jest with Vite-compatible transform for `import.meta` (adds toolchain complexity)

2) Finalize remaining failing tests
   - `itemsService`: align expectations (id generation and emitted list assertions)
   - `useDebouncedValue`: use `jest.useFakeTimers()` locally or enable globally; ensure `clearTimeout` is defined in setup
   - `securityService`: adjust logic vs expectations for iframe/origin/sanitization checks
   - `AddCredential1` page: provide a stable router test harness and assert navigation calls

3) Expand component and page coverage
   - Focus on interactions and accessibility
   - Add a thin router/provider harness for page tests

4) Introduce targeted E2E (after env strategy)
   - Use Playwright to load the built extension and cover a few critical happy-path flows (popup load, background messaging, content autofill)

5) Mobile surface (later)
   - Add RN-specific adapter tests when mobile feature set stabilizes

### Current Snapshot (for quick reference)
- Suites: 35 total
- Tests: 523 passing, 14 failing
- Strengths: utils, hooks, adapters, extension integration, crypto service
- Gaps: platform-dependent services/libraries, complex pages, RN/mobile, E2E

---

This document supersedes the earlier four testing docs. Keep this as the single source of truth for testing scope, approach, and status.


