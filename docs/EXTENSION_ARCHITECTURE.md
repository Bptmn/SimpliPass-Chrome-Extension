### SimpliPass Extension Architecture (UI split from React Native Web)

Purpose: Reduce complexity by using React DOM for the extension UI while keeping business logic shared under `packages/common`.

Key principles:
- UI (hooks + components) are platform-specific.
- Services/adapters/types remain shared and framework-agnostic.
- Navigation triggered from hooks using `useAppRouterContext()`; pages stay dumb.
- Errors are created in the proper layer and propagated upward.

Target directories:
- `packages/common/`
  - `core/` (services, adapters, libraries, types) — shared
  - `hooks/` (only platform-agnostic hooks)
  - `ui/` (deprecated for extension; RN components stay for future mobile only)
- `packages/extension/`
  - `ui/` (React DOM components, small kit: Button, Input, Modal, ErrorBoundary)
  - `popup/` (React app shell; uses DOM components, router provider)
  - `popovers/` (DOM-only isolated popovers)
  - `services/` (extension orchestration; calls common adapters)
  - `adapters/` (extension-specific platform adapters)

Migration phases:
1) Introduce DOM ErrorBoundary and switch popup to use it.
2) Create minimal DOM UI kit under `packages/extension/ui` (Button, Input, Modal).
3) Replace RNW imports in popovers with DOM components.
4) Extract router view to extension DOM variant if needed; keep route constants/types in common.
5) Simplify test config for extension UI (pure DOM; `@testing-library/react`).
6) Remove RNW-specific code paths from extension and unused aliases.

Testing focus:
- Unit tests for services/adapters and critical utils (success + failure).
- DOM UI tests for popup and popovers via `@testing-library/react`.

Error handling:
- Libraries/adapters: throw low-level errors.
- Services (common): wrap/transform to domain errors, rethrow.
- Hooks/UI: do not transform; expose to UI and error boundaries.


