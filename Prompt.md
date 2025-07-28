// 🧭 OBJECTIVE:
// Refactor all pages and UI components to stop using `router` as a prop,
// and use the existing AppRouterProvider + useAppRouterContext instead.

// ✅ CONTEXT:
// The router system is already centralized under:
// - packages/common/ui/router/useAppRouter.ts
// - packages/common/ui/router/AppRouterProvider.tsx
// - packages/common/ui/router/ROUTES.ts
// - packages/common/ui/router/AppRouterView.tsx

// ✅ STEP-BY-STEP PLAN:

// 1. 🔍 Locate all files where `router` is passed via props:
// - Examples: AddCredential1, AddCard1, AddSecureNote, NavBar, HelperBar, etc.
// - Function signatures like: `({ router }) => {}`
// - Props interfaces like: `interface Props { router: UseAppRouterReturn }`

// 2. 🔁 For each of these components:
// - Remove the `router` prop from the function signature
// - Remove `router` from the props interface if defined
// - Replace internal `router.navigateTo(...)`, `router.goBack()`, etc. with:
//     ```ts
//     import { useAppRouterContext } from '@/common/ui/router/AppRouterProvider'
//     const { navigateTo, goBack, ... } = useAppRouterContext()
//     ```

// 3. ✅ In AppRouterView.tsx:
// - Remove `router={router}` from all page and component render calls
// - Those pages will now call useAppRouterContext() directly

// 4. 🧼 Clean up:
// - Delete unused `router` props from any type/interface definitions
// - Remove `router={router}` from all JSX usage in AppContent or AppRouterView
// - Confirm that no file passes `router` manually anymore

// 5. 🧪 Final validation:
// - All files compile with no TypeScript errors
// - Navigation works correctly from all pages (e.g. AddCredential1, SettingsPage)
// - The router remains fully provided via AppRouterProvider (already implemented)

// ✅ By the end:
// - The `router` is accessed via context only
// - No component receives `router` via props
// - Navigation is fully centralized and consistent
