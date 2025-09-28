## SimpliPass – Test Plan (Chrome Extension + Shared Core)

This plan defines how to validate SimpliPass across layers and extension contexts, with fast unit tests, a few focused integrations, and minimal-but-valuable E2E. It follows the project’s three-layer architecture and testing preferences.

### Goals & Principles
- **Layer separation**: UI (hooks) → services → adapters/libraries. Test each where it lives.
- **Don’t test Chrome itself**: mock `chrome.*` in unit/integration; real browser only in E2E.
- **Business logic first**: maximize service coverage (>80% lines/functions).
- **Deterministic and fast**: avoid real timeouts; use fake timers and event emitters.
- **Single behavior per test**, colocated under `__tests__`, with clear names.
- **Always run**: `npm run lint`, `npm run test -- --verbose`, `npm run build` before merge.

### Current Setup (as of now)
- Test runner: **Jest** via `configs/test/jest.config.js` (ts-jest + babel-jest), JSDOM.
- Global setup: `configs/test/jest.setup.js` provides:
  - `global.chrome` mock, webcrypto polyfill, `import.meta.env` test values.
  - Platform config mocked for tests.
  - Firestore emulator start script (used by Firestore integration tests).
- Scripts:
  - `npm test` (Jest), `test:watch`, `test:coverage`.
  - `test:firestore` spins emulator and runs Firestore-specific integration test.
- Coverage thresholds are already set higher for `packages/common/core/services`.

### Directory & Naming Conventions
- Tests colocated near code in `__tests__/`.
- One behavior per test file; use descriptive names.
- Absolute imports in tests (`@common`, `@core`, `@ui`, `@extension`, `@mobile`, `@shared`).

### Step 1 — Test Utilities & Helpers
Create shared helpers to keep tests clean and deterministic.

1. Add factories/builders (pure, no side effects):
   - `packages/common/__tests__/helpers/factories/credentialFactory.ts`
   - `packages/common/__tests__/helpers/factories/userFactory.ts`
   - Keep simple: functions returning valid objects with optional overrides.

2. Chrome utilities:
   - `packages/extension/__tests__/helpers/chrome.mock.ts`
   - Helpers to reset `global.chrome` spies, emit `runtime.onMessage`, simulate `contextMenus.onClicked`, stub `storage.session` get/set/remove, etc.
   - Use existing `jest.setup.js` mock shape; do not introduce new mocking libs unless needed.

3. Router/util helpers:
   - `packages/common/ui/__tests__/helpers/router.tsx` to provide `useAppRouterContext()` with a test provider.
   - `packages/common/__tests__/helpers/time.ts` for fake timers and advancing timers.

### Step 2 — Unit Tests by Layer

1. Services (Layer 2) – highest priority coverage
   - Location: `packages/common/core/services/`
   - Mock: adapters/libraries only. No real `chrome.*`, no real Firestore.
   - Verify: orchestrations, transformations, validation, error wrapping/propagation.
   - Target first: `authService`, `itemsService`, `listenerService`, `secretsService`, `cryptoService`.

2. Adapters/Libraries (Layer 3)
   - Location: `packages/common/core/adapters/`, `packages/common/core/libraries/`, `packages/extension/adapters/`, `packages/mobile/adapters/`.
   - Verify: correct parameter mapping to providers; throw/propagate low-level errors; no business logic.
   - Use `global.chrome` mock from setup for extension adapters.

3. Hooks/UI (Layer 1)
   - Location: `packages/common/hooks/`, `packages/common/ui/`
   - Mock: services via Jest; assert UI state, loading, and error exposure; navigation via router context.
   - Use React Testing Library for components/pages; avoid implementation details.

### Step 3 — Integration Tests per Extension Context

Keep these focused and cheap; connect 2–3 real pieces while keeping `chrome.*` mocked.

1. Background
   - Files under `packages/extension/__tests__/` (e.g., `background.messaging.int.test.ts`).
   - Simulate `chrome.runtime.onMessage` dispatch and assert the correct service calls and response payloads.
   - If using context menus: simulate `contextMenus.onClicked` and validate side effects.

2. Content Script
   - Tests for `packages/extension/content.ts` behavior in JSDOM.
   - Provide a fake login page DOM; verify detection/injection; assert `chrome.runtime.sendMessage` calls.

3. Popup
   - Render the popup app with services mocked; verify onboarding/auth flows, state, and navigation.
   - Keep it at the React level; no real `chrome.*` interactions beyond mocks.

4. Firestore (optional, already scaffolded)
   - Use the existing emulator script only in dedicated suites (don’t slow down all tests).
   - Put emulator-backed tests under a specific pattern, and run via `npm run test:firestore`.

### Step 4 — E2E (Playwright) with Real Chromium + Packed Extension

Add minimal, high-value end-to-end coverage. Do not overdo E2E.

1. Install dev deps:
   ```bash
   npm i -D @playwright/test
   npx playwright install chromium
   ```

2. Create `playwright.config.ts` at repo root:
   ```ts
   import { defineConfig } from '@playwright/test';
   export default defineConfig({
     testDir: 'e2e',
     timeout: 60000,
     use: { headless: true },
   });
   ```

3. Add E2E helpers: `e2e/utils/extension.ts` to launch Chromium with the built extension:
   ```ts
   import path from 'path';
   import { chromium, BrowserContext } from '@playwright/test';

   export async function launchWithExtension(): Promise<BrowserContext> {
     const extPath = path.join(__dirname, '../..', 'packages/extension/dist');
     return chromium.launchPersistentContext('', {
       headless: false,
       args: [
         `--disable-extensions-except=${extPath}`,
         `--load-extension=${extPath}`,
       ],
     });
   }
   ```

4. Minimal E2E specs under `e2e/`:
   - `popup.spec.ts`: open the extension popup UI, smoke-check onboarding/navigation.
   - `autofill.spec.ts`: navigate to a test login page, verify content script detection + autofill + background messaging.

5. Commands to add in `package.json`:
   ```json
   {
     "scripts": {
       "e2e:build:extension": "npm run -w packages/extension build",
       "e2e": "npm run e2e:build:extension && playwright test"
     }
   }
   ```

### Step 5 — NPM Scripts and Test Matrix

Add or ensure the following scripts exist (names can be adjusted):
```json
{
  "scripts": {
    "test": "jest --config configs/test/jest.config.js --verbose",
    "test:watch": "jest --watch --config configs/test/jest.config.js",
    "test:coverage": "jest --coverage --config configs/test/jest.config.js",
    "test:unit": "jest --config configs/test/jest.config.js __tests__ --verbose",
    "test:int": "jest --config configs/test/jest.config.js __tests__ --verbose -t .int.",
    "test:firestore": "start-server-and-test emulator http-get://localhost:8080 test:firestore-jest",
    "test:firestore-jest": "jest packages/common/core/libraries/database/__tests__/firestore.integration.test.ts --verbose",
    "e2e": "npm run e2e:build:extension && playwright test"
  }
}
```

Notes:
- Keep emulator-labeled tests separate; do not start emulator for the whole suite by default.
- Prefer tagging integration tests with `.int.test.ts` and E2E specs live under `e2e/`.

### Step 6 — CI Pipeline (GitHub Actions)

Create `.github/workflows/ci.yml` with jobs:
1. `build_and_unit` (Node 20): install, lint, unit+integration tests (no emulator), typecheck, build.
2. `firestore_int` (optional): start emulator, run Firestore integration suite.
3. `e2e` (Chromium): build extension, run Playwright (can be nightly or on main only).

Each job should run:
- `npm ci`
- `npm run lint`
- `npm run test -- --verbose`
- `npm run build`

### Coverage Policy
- Keep current thresholds. For `packages/common/core/services`: aim ≥90% lines/functions.
- Exclude storybook, dist, coverage, and type declarations from coverage (already configured).

### Best Practices & Anti-Patterns
- **Do**: mock adapters in service tests; verify error mapping and propagation.
- **Do**: test hooks/UI for state and interactions; use router provider for navigation.
- **Do**: keep content/background/popup integration tests small and specific.
- **Do**: use fake timers, not real timeouts.
- **Don’t**: access `chrome.*` outside adapters in app code; never test Chrome APIs themselves.
- **Don’t**: persist decrypted secrets; never introduce platform logic in hooks/services incorrectly.
- **Don’t**: add mock data in production code paths; keep it within tests only.

### Rollout Checklist
1. Add helpers (factories, chrome utilities, router provider, timers).
2. Bring service suites to ≥80–90% coverage (auth/items/listener/secrets/crypto).
3. Add 1–2 integration tests per context (background/content/popup).
4. Introduce Playwright with 2 E2E specs (popup smoke, autofill path).
5. Wire scripts and CI to run lint, tests (verbose), and build on PRs.
6. Keep emulator usage isolated to Firestore-specific suites.

This plan optimizes confidence and feedback speed for a Chrome extension architecture while respecting the project’s layering and testing conventions.


