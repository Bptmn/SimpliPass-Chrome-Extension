/**
 * index.ts - Router Module Exports
 * 
 * This file serves as the main entry point for the router module, exporting
 * all router-related components, hooks, types, and utilities. It provides
 * a clean API for other parts of the application to import router functionality.
 * 
 * Usage:
 * import { useAppRouter, ROUTES, AppRouterProvider } from '@common/ui/router';
 */

// Export route constants and type safety utilities
export { ROUTES, type AppRoute, isPublicRoute } from './ROUTES';

// Export the main router hook and its types
export { useAppRouter, type UseAppRouterReturn, type UseAppRouterProps, type LockReason } from './useAppRouter';

// Export context provider and hook for global router access
export { AppRouterProvider, useAppRouterContext } from './AppRouterProvider';

// Export the main router view component
export { AppRouterView } from './AppRouterView'; 