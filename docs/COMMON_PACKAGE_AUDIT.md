## SimpliPass – Common Package Audit (Architecture, Code Quality, Tests, Docs)

### Executive Summary

Overall structure follows the intended three-layer architecture (Hooks → Services → Adapters → Libraries) with good modularity and separation of responsibilities in many areas. However, there are several critical inconsistencies that should be addressed to improve correctness, security, and maintainability:

- Critical: Layer violations where Services/Adapters import `useAppStateStore` from Hooks (Layer 1)
- Critical: Sensitive crypto logging in production paths (keys, nonces, decrypted content)
- Critical: Security constants mismatch versus actual crypto implementation
- Moderate: Stateful logic present in the Libraries layer (should be stateless)
- Moderate: Error-reporting strategy hides failures (decryption returning empty silently)
- Moderate: Test coverage uneven (key services lack tests); CI gates not enforced
- Minor: Documentation drift and a few unused/empty files

The plan below is sequenced to fix security-critical issues first, then architecture, then test/docs/DX improvements.

---

### Strengths

- Clear three-layer intent with good file layout under `packages/common/core/*` and `packages/common/hooks/*`.
- Adapters proxy to provider-specific libraries cleanly (auth and database).
- Crypto alignment with Flutter: ChaCha20-Poly1305, PBKDF2(300k, SHA-256), `nonce|cipher|tag` layout implemented.
- Real-time listeners centralized in `listenerService.ts` (service layer) and clean orchestration in `itemsService.ts`.
- Strong UI layer: hooks and UI components follow stable state contracts and composition.

---

### Findings and Recommendations

1) Layer Violations (Hooks referenced from Services/Adapters)
- Files:
  - `packages/common/core/services/initializationService.ts` (imports `useAppStateStore`)
  - `packages/common/core/services/secretsService.ts` (imports `useAppStateStore` dynamically)
  - `packages/common/core/adapters/platform.adapter.ts` (imports `useAppStateStore`)
  - `packages/common/core/adapters/platform.storage.adapter.ts` (imports `useAppStateStore`)
- Problem: Layer 2/3 should not depend on Layer 1 (Hooks). Per rules, global state must not live in the Hooks layer.
- Fix:
  - Create `packages/common/core/state/appState.store.ts` (Zustand store under Core).
  - Move the store definitions out of `hooks/useAppState` into `core/state`.
  - Replace imports in Services/Adapters to consume `core/state/appState.store` instead of hooks.
  - Keep a thin hook wrapper in `hooks/` to read/manipulate the same store for UI.

2) Sensitive Cryptography Logging in Libraries and Services
- Files:
  - `packages/common/core/libraries/crypto.ts` (logs key lengths, nonce, mac, partial key material; prints decrypted text snippets)
  - `packages/common/core/services/cryptoService.ts` (logs decrypted content and parsed JSON)
- Problem: Keys/nonces/MACs/plaintexts must never be logged in production builds. Current logs risk secreting sensitive data into console logs.
- Fix:
  - Introduce a minimal logger utility with levels and a compile-time flag, e.g. `LOG_LEVEL` or `__DEV__` guard.
  - Redact or remove any logs that print secrets. Keep only high-level messages.
  - Default to no-logging for crypto in production; allow targeted opt-in in test/dev.

3) Security Constants Mismatch (Configuration vs Implementation)
- File: `packages/common/config/app.constants.ts`
  - Declares AES-256-GCM and PBKDF2 iterations = 100000
- Actual implementation:
  - ChaCha20-Poly1305, PBKDF2(SHA-256, 300000 iterations), 32-byte output
- Fix:
  - Update constants to match the real crypto:
    - `ENCRYPTION_ALGORITHM: 'ChaCha20-Poly1305'`
    - `KEY_DERIVATION_ITERATIONS: 300000`
  - Add brief docstring explaining alignment with Flutter and `nonce|cipher|tag` layout.

4) Stateful Logic in Libraries Layer
- File: `packages/common/core/libraries/database/firestore.ts`
  - Maintains `listenersState` and retains unsubscribe refs; exposes `startListenersWrapper`/`stopListenersWrapper` that manage state.
- Problem: Libraries should be pure and stateless provider functions. State and orchestration belong in Services (Layer 2) or Adapters (Layer 3) at most.
- Fix:
  - Move listener state and orchestration to `core/services/listenerService.ts` (already exists) or to `core/adapters/database.adapter.ts` if you prefer it there.
  - Keep `firestore.ts` to strictly hold pure Firestore calls (get/set/update/delete, onSnapshot wrappers without global state).

5) Error Handling: Decryption All-or-Nothing Behavior
- File: `packages/common/core/services/cryptoService.ts`
  - `decryptAllItems` returns `[]` if all decryptions fail, to avoid UI crashes.
- Problem: While preventing crashes is good, this hides a critical error scenario and erases vault content in memory.
- Fix:
  - Return `{ items: ItemDecrypted[], errors: Error[] }` or throw a typed `CryptographyError` while also setting a recoverable UI state.
  - Update callers (e.g., `itemsService.fetchAndStoreItems`) to surface a user-visible error (ErrorBanner) and avoid overwriting vault with `[]` on total failure.

6) Documentation Drift / Gaps
- Security constants in docs not aligned with implementation.
- Missing a concise CRYPTO.md that documents the cross-platform contract (Flutter + TS): key derivation, AEAD params, blob format, Base64URL tolerance.
- Suggestion:
  - Add `docs/CRYPTO.md` summarizing: PBKDF2 params, ChaCha20-Poly1305, `nonce(12)|cipher|tag(16)` blob, Base64URL tolerance, and examples.
  - Update `README.md` references to reflect actual crypto and routing rules (e.g., index.tsx storage init only for extension).

7) Testing Coverage and Strategy
- Existing tests are good starts (utils, crypto compat), but services coverage is incomplete:
  - Add unit tests for:
    - `secretsService` (derive/store; salt fetch errors)
    - `itemsService` (CRUD flows, vault sync, partial decrypt failures)
    - `listenerService` (auth/db listeners lifecycle)
    - `authService` (login with/without MFA flows; categorized error mapping)
  - Maintain crypto compat test; include fixtures parity tests (if you add a fixtures.json).
- CI suggestion: enforce `npm run lint && npm run test -- --coverage --verbose && npm run build` on PRs.

8) Type Safety and `any`
- Several method signatures use `any` for payloads (e.g., platform adapter methods, listener callbacks).
- Tighten types for:
  - Platform adapter session metadata
  - Listener callbacks: `onItemsUpdate` should take `ItemEncrypted[]`
  - Storage adapter vault structure

9) Build Warnings (react-native-web "use client")
- Vite logs warnings for RN Web modules that include module-level directives.
- These are usually harmless but noisy. Consider configuring Vite/Rollup to silence or alias as needed.

10) Unused/Empty Files and Cleanup
- A few hook files appear empty or unused (verify actual repo state). Remove or implement.
- Remove dead code paths and stale comments that refer to earlier architectures.

11) Consistency: `core/index.ts` Comments
- Mentions "Crypto functionality moved to services/cryptography" while crypto is under `libraries/crypto.ts`.
- Update comment/docstring to reflect real path, or introduce a crypto adapter if desired later.

---

### Step-by-Step Improvement Plan

Phase 1 – Security Hotfixes (Day 0–1)
1. Introduce a minimal logger utility under `packages/common/core/utils/logger.ts` with levels and redaction.
2. Remove or guard sensitive logs in `libraries/crypto.ts` and `services/cryptoService.ts` (no plaintext, keys, nonces/MACs in production).
3. Update `packages/common/config/app.constants.ts` to match ChaCha20-Poly1305 and PBKDF2(300k, SHA-256).
4. Add a `docs/CRYPTO.md` explaining cross-platform crypto contract.

Phase 2 – Architecture Corrections (Day 1–2)
5. Create `packages/common/core/state/appState.store.ts` (Zustand store in Core).
6. Move global app state from `hooks/useAppState` to `core/state/appState.store.ts`.
7. Update imports in:
   - `core/services/initializationService.ts`
   - `core/services/secretsService.ts`
   - `core/adapters/platform.adapter.ts`
   - `core/adapters/platform.storage.adapter.ts`
   to use the Core store (no Layer 2/3 → Layer 1 imports).
8. Keep thin hooks in `hooks/` that consume the Core store for UI.

Phase 3 – Libraries Refactor (Day 2–3)
9. In `libraries/database/firestore.ts`, remove global listener state and keep functions stateless.
10. Move listener state to `core/services/listenerService.ts` exclusively (or optionally to `core/adapters/database.adapter.ts`).

Phase 4 – Error Handling UX (Day 3)
11. Change `decryptAllItems` to return `{ items, errors }` or throw on total failure.
12. In `itemsService.fetchAndStoreItems`, avoid overwriting vault with `[]` on total failure; surface ErrorBanner and keep last-known-good local vault in memory.

Phase 5 – Tests and CI (Day 3–4)
13. Add unit tests for `authService`, `secretsService`, `itemsService`, `listenerService` (mock adapters/libraries).
14. Ensure `npm run test -- --verbose --coverage` ≥ 80% for business logic.
15. Add CI workflow to run lint/test/build on PRs.

Phase 6 – Documentation (Day 4)
16. Add `docs/CRYPTO.md` and link from the root `README.md` and `packages/common/core/README.md`.
17. Update `packages/common/config/app.constants.ts` docstrings and root `README.md` to reflect current crypto and routing rules.

Phase 7 – DX and Build Polish (Optional)
18. Silence RN Web module-level directive warnings via Vite config tweaks or aliases if desired.
19. Add ESLint rule to disallow `console.*` in production builds (allow `logger` only).

Phase 8 – Cleanup (Ongoing)
20. Remove unused/empty files; align comments in `core/index.ts` about crypto location.

---

### Concrete Task Breakdown (Files to Touch)

- Security & Logging
  - Add `core/utils/logger.ts`
  - Edit `core/libraries/crypto.ts` – remove/redact sensitive logs
  - Edit `core/services/cryptoService.ts` – remove/redact decrypted content logs
  - Edit `config/app.constants.ts` – crypto constants

- Architecture – Store Relocation
  - Add `core/state/appState.store.ts` (move Zustand store here)
  - Update imports in:
    - `core/services/initializationService.ts`
    - `core/services/secretsService.ts`
    - `core/adapters/platform.adapter.ts`
    - `core/adapters/platform.storage.adapter.ts`
  - Keep UI hooks under `hooks/` delegating to the Core store

- Libraries – Statelessness
  - Edit `core/libraries/database/firestore.ts` – remove `listenersState`; pure provider funcs only
  - Ensure `core/services/listenerService.ts` owns runtime listener state

- Error Handling
  - Edit `core/services/cryptoService.ts` – return `{ items, errors }` or throw on total failure
  - Edit `core/services/itemsService.ts` – avoid replacing vault with `[]` on total failure; surface error

- Tests
  - Add `core/services/__tests__/authService.test.ts`
  - Add `core/services/__tests__/secretsService.test.ts`
  - Add `core/services/__tests__/itemsService.test.ts`
  - Add `core/services/__tests__/listenerService.test.ts`
  - Keep `core/libraries/__tests__/crypto.compat.test.ts` and add fixtures as available

- Docs
  - Add `docs/CRYPTO.md`
  - Update root `README.md` + `packages/common/core/README.md`

---

### Acceptance Criteria

- No Layer 2/3 → Layer 1 imports remain; state lives in `core/state`.
- No sensitive crypto data logged in production builds.
- Config constants reflect actual crypto implementation.
- Libraries are stateless; listener state handled in services.
- Decryption failures are visible to UI without destructive state changes.
- Service tests exist and pass with ≥ 80% coverage for business logic.
- Updated docs clearly explain crypto and architecture rules.

---

### Notes

- The removal of the data migration feature has been completed; ensure remaining references are cleaned in docs as well.
- The current decision to keep `item_type` only for statistics is sound. Maintain decryption based on `content_encrypted.itemType`.


