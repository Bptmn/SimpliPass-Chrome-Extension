/**
 * ROUTES.ts - Centralized route definitions, components, and utilities
 * 
 * Defines all application routes with their components and utilities.
 * Single source of truth for routing configuration.
 * 
 * IMPORTANT: All route references throughout the codebase must use ROUTES constants.
 * Never use string literals for routes - always import and use ROUTES.CONSTANT_NAME.
 * 
 * Structure:
 * - ROUTE_CONFIG: Contains path, component, and metadata for each route
 * - ROUTES: Type-safe constants for route names (prevents string literals)
 * - ROUTE_PATHS: Derived URL paths for browser routing
 * - routeComponents: Derived component mapping for rendering
 * - Utility functions: Route validation and classification
 */

import React from 'react';
import * as Pages from '@common/ui/pages';

// Single source of truth - route definitions with their components and metadata
export const ROUTE_CONFIG = {
  LOGIN: { path: 'login', component: Pages.LoginPage },
  LOCK: { path: 'lock', component: Pages.LockPage },
  HOME: { path: 'home', component: Pages.HomePage },
  GENERATOR: { path: 'generator', component: Pages.GeneratorPage },
  SETTINGS: { path: 'settings', component: Pages.SettingsPage },
  ADD_CREDENTIAL_1: { path: 'add-credential-1', component: Pages.AddCredential1 },
  ADD_CREDENTIAL_2: { path: 'add-credential-2', component: Pages.AddCredential2 },
  ADD_CARD_1: { path: 'add-card-1', component: Pages.AddCard1 },
  ADD_CARD_2: { path: 'add-card-2', component: Pages.AddCard2 },
  ADD_SECURENOTE: { path: 'add-securenote', component: Pages.AddSecureNote },
  MODIFY_BANK_CARD: { path: 'modify-bank-card', component: Pages.ModifyBankCardPage },
  MODIFY_CREDENTIAL: { path: 'modify-credential', component: Pages.ModifyCredentialPage },
  MODIFY_SECURENOTE: { path: 'modify-securenote', component: Pages.ModifySecureNotePage },
  LOADING: { path: 'loading', component: () => null },
  ERROR: { path: 'error', component: () => null },
  CREDENTIAL_DETAILS: { path: 'credential-details', component: Pages.CredentialDetailsPage },
  BANK_CARD_DETAILS: { path: 'bank-card-details', component: Pages.BankCardDetailsPage },
  SECURE_NOTE_DETAILS: { path: 'secure-note-details', component: Pages.SecureNoteDetailsPage },
  EMAIL_CONFIRMATION: { path: 'email-confirmation', component: Pages.EmailConfirmationPage },
} as const;

// Type-safe route type derived from the config
export type AppRoute = keyof typeof ROUTE_CONFIG;

// Route constants - centralized route names to prevent string literals
// Usage: router.navigateTo(ROUTES.ADD_CREDENTIAL_1) instead of 'ADD_CREDENTIAL_1'
export const ROUTES = {
  LOGIN: 'LOGIN',
  LOCK: 'LOCK', 
  HOME: 'HOME',
  GENERATOR: 'GENERATOR',
  SETTINGS: 'SETTINGS',
  ADD_CREDENTIAL_1: 'ADD_CREDENTIAL_1',
  ADD_CREDENTIAL_2: 'ADD_CREDENTIAL_2',
  ADD_CARD_1: 'ADD_CARD_1',
  ADD_CARD_2: 'ADD_CARD_2',
  ADD_SECURENOTE: 'ADD_SECURENOTE',
  MODIFY_BANK_CARD: 'MODIFY_BANK_CARD',
  MODIFY_CREDENTIAL: 'MODIFY_CREDENTIAL',
  MODIFY_SECURENOTE: 'MODIFY_SECURENOTE',
  LOADING: 'LOADING',
  ERROR: 'ERROR',
  CREDENTIAL_DETAILS: 'CREDENTIAL_DETAILS',
  BANK_CARD_DETAILS: 'BANK_CARD_DETAILS',
  SECURE_NOTE_DETAILS: 'SECURE_NOTE_DETAILS',
  EMAIL_CONFIRMATION: 'EMAIL_CONFIRMATION',
} as const satisfies Record<AppRoute, AppRoute>;

// Path constants - derived from ROUTE_CONFIG (these are the actual URL paths)
// Used for browser routing and URL generation
export const ROUTE_PATHS = Object.fromEntries(
  Object.entries(ROUTE_CONFIG).map(([key, config]) => [key, config.path])
) as Record<AppRoute, string>;

// Derived component mapping from single source of truth
// Used by AppRouterView to render the correct component for each route
export const routeComponents = Object.fromEntries(
  Object.entries(ROUTE_CONFIG).map(([key, config]) => [key, config.component])
) as Record<AppRoute, React.ComponentType<any>>;

// Routes that don't require authentication - accessible to all users
// These routes are rendered even when user is not authenticated
export const PUBLIC_ROUTES: AppRoute[] = [
  ROUTES.LOGIN,
  ROUTES.LOADING,
  ROUTES.ERROR,
  ROUTES.LOCK,
];

// System routes that don't need layout (navbar + helperbar)
// These routes are rendered as full-page components
export const SYSTEM_ROUTES: AppRoute[] = [
  ROUTES.LOADING,
  ROUTES.ERROR,
  ROUTES.LOGIN,
  ROUTES.LOCK,
  ROUTES.EMAIL_CONFIRMATION,
];

// Utility functions for route validation and classification

/**
 * Check if a route is public (doesn't require authentication)
 * Used by AppRouterView to determine if authentication guard should be applied
 */
export const isPublicRoute = (route: AppRoute): boolean => {
  return PUBLIC_ROUTES.includes(route);
};

/**
 * Check if a route requires authentication
 * Used by AppRouterView to apply authentication guards
 */
export const requiresAuth = (route: AppRoute): boolean => {
  return !isPublicRoute(route);
};

/**
 * Check if a route has layout (navbar + helperbar)
 * Used by AppRouterView to determine layout rendering
 */
export const hasLayout = (route: AppRoute): boolean => {
  return !SYSTEM_ROUTES.includes(route);
};

/**
 * Get route path by route name
 * Used for URL generation and browser routing
 */
export const getRoutePath = (route: AppRoute): string => {
  return ROUTE_PATHS[route];
};

/**
 * Get route component by route name
 * Used by AppRouterView to render the correct component
 */
export const getRouteComponent = (route: AppRoute): React.ComponentType<any> => {
  return routeComponents[route];
};

/**
 * Check if a route is a system route (handled automatically by useAppRouter)
 * System routes are determined by system state, not explicit navigation
 */
export const isSystemRoute = (route: AppRoute): boolean => {
  return SYSTEM_ROUTES.includes(route);
};

/**
 * Check if a route is a business route (requires explicit navigation)
 * Business routes must be navigated to explicitly via navigateTo()
 */
export const isBusinessRoute = (route: AppRoute): boolean => {
  return !isSystemRoute(route);
};

/**
 * Get all route names as an array
 * Used for testing and route enumeration
 */
export const getAllRoutes = (): AppRoute[] => {
  return Object.keys(ROUTE_CONFIG) as AppRoute[];
};

/**
 * Validate if a string is a valid route name
 * Used for runtime route validation and type guards
 */
export const isValidRoute = (route: string): route is AppRoute => {
  return route in ROUTE_CONFIG;
};

 