// 🧭 OBJECTIVE:
// Simplify the navigation system by removing unnecessary complexity,
// focusing on state-driven routing only for system-level concerns
// (authentication, user key, errors), and using `navigateTo()` manually for user actions.

// ✅ STEP-BY-STEP PLAN:

// 1. 🔥 REMOVE businessState from useAppRouter.ts
// - Delete the `businessState` object and related state
// - Remove any `setSelectedItem`, `setFormStep`, or `clearBusinessState` functions
// - Delete or ignore any formData logic or selectedItem routing

// 2. ✅ KEEP determineRoute logic for system-level state only
// - Maintain the following logic:
const determineRoute = (): AppRoute => {
  if (user === null && !listenersError) return ROUTES.LOADING;
  if (listenersError) return ROUTES.ERROR;
  if (!user) return ROUTES.LOGIN;
  if (!userSecretKey) return ROUTES.LOCK;
  return ROUTES.HOME;
}

// 3. ✅ Maintain navigateTo, goBack, routeParams logic in useAppRouter
// - Keep simple navigation methods (`navigateTo(route, params?)`, `goBack()`, etc.)

// 4. ✅ Ensure AppRouterView.tsx (or AppContent.tsx) uses router.currentRoute
// - Keep conditional rendering based on `currentRoute` (or a switch)
// - Display only allowed screens based on route

// 5. ✅ Add AppRouterProvider if not already present
// - Create a context around the router returned from useAppRouter
// - Export a hook `useAppRouterContext()` to be used in components
// - Replace all props like `router={router}` with internal `useAppRouterContext()` calls

// 6. ✅ Add ROUTES.ts if not already created
// - Create a centralized route constants file:
//   export const ROUTES = { LOGIN: 'login', LOCK: 'lock', HOME: 'home', ... } as const;
//   export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

// 7. 🧹 Clean up the codebase
// - Remove unused route params (e.g., title, link) from logic now handled via navigateTo
// - Delete navigationService.ts if it was added (or don’t create it)
// - Ensure all navigation actions are done via navigateTo() manually when triggered by user

// ✅ FINAL CHECKS
// - Lint and typecheck must pass
// - Confirm all pages still render correctly
// - Login, logout, lock, and home redirects work as expected
// - Update the README if navigation logic was significantly simplified
