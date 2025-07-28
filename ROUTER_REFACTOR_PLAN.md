// 🧭 OBJECTIVE:
// Refactor and improve the navigation system by:
// 1. Creating a dedicated `router/` folder inside `ui/`
// 2. Moving all navigation-related files into it
// 3. Adding an AppRouterProvider to allow global access to the router
// 4. Creating a centralized ROUTES.ts file with type-safe route keys
// 5. Implementing authentication guards to restrict access to all routes except 'login', 'loading', and 'error'

// ✅ STEP-BY-STEP PLAN:

// 📁 Step 1 — Create folder structure
// Move all navigation-related files into: packages/common/ui/router/
// - Move `useAppRouter.ts` into `router/`
// - Move `AppContent.tsx` (or `AppRouterView.tsx`) into `router/`
// - Rename or split if needed (e.g. route types, lock reason types)
// - Resulting structure:
//   - packages/common/ui/router/useAppRouter.ts
//   - packages/common/ui/router/AppRouterProvider.tsx
//   - packages/common/ui/router/AppRouterView.tsx
//   - packages/common/ui/router/ROUTES.ts

// 📦 Step 2 — Create ROUTES.ts
// - Export all routes as constants:
//   export const ROUTES = { LOGIN: 'login', HOME: 'home', SETTINGS: 'settings', ... } as const
// - Define AppRoute type as:
//   export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
// - Replace all route string usages in the codebase with ROUTES constants

// 🌐 Step 3 — Create AppRouterProvider
// - Create a context that holds the return value of `useAppRouter()`
// - Create a `<AppRouterProvider>` component that receives `router` and wraps the app
// - Export a `useAppRouterContext()` hook that returns the context value
// - Replace all manual `router` props in deeply nested components with `useAppRouterContext()`

// 🔐 Step 4 — Add route guard logic in AppRouterView.tsx
// - Define a set of "public routes": ['login', 'loading', 'error']
// - In the render switch, check if the current route is private and the user is unauthenticated:
//   if (!publicRoutes.includes(currentRoute) && !user) render a <LoginPage />
// - Alternatively, redirect via `navigateTo('login')` if not allowed

// 🧪 Step 5 — Refactor usage across the app
// - Update all imports of `useAppRouter`, `navigateTo`, etc. to use new router context + ROUTES constants
// - Replace any hardcoded strings like 'home', 'login', etc. with ROUTES.HOME, ROUTES.LOGIN, etc.
// - Remove any leftover React Router logic or unused navigation props
// - Ensure all protected screens are unreachable when not authenticated

// ✅ Final Checks
// - Lint and typecheck must pass
// - Test navigation manually (especially login/logout → route changes)
// - Confirm AppRouterView handles fallback/unauthorized state
// - Update README or internal documentation if necessary
