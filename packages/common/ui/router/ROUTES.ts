/**
 * ROUTES.ts - Centralized route definitions and type safety
 * 
 * This file defines all application routes as constants to ensure type safety
 * and prevent magic strings throughout the codebase. It also provides utilities
 * for route validation and public/private route classification.
 */

export const ROUTES = {
  LOGIN: 'login',
  LOCK: 'lock',
  HOME: 'home',
  GENERATOR: 'generator',
  SETTINGS: 'settings',
  ADD_CREDENTIAL_1: 'add-credential-1',
  ADD_CREDENTIAL_2: 'add-credential-2',
  ADD_CARD_1: 'add-card-1',
  ADD_CARD_2: 'add-card-2',
  ADD_SECURENOTE: 'add-securenote',
  MODIFY_BANK_CARD: 'modify-bank-card',
  MODIFY_CREDENTIAL: 'modify-credential',
  MODIFY_SECURENOTE: 'modify-securenote',
  LOADING: 'loading',
  ERROR: 'error',
  CREDENTIAL_DETAILS: 'credential-details',
  BANK_CARD_DETAILS: 'bank-card-details',
  SECURE_NOTE_DETAILS: 'secure-note-details',
  EMAIL_CONFIRMATION: 'email-confirmation',
} as const;

// Type-safe route type derived from the constants
export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

// Routes that don't require authentication - accessible to all users
export const PUBLIC_ROUTES: AppRoute[] = [
  ROUTES.LOGIN,
  ROUTES.LOADING,
  ROUTES.ERROR,
  ROUTES.LOCK,
];

/**
 * Checks if a route is public (doesn't require authentication)
 * @param route - The route to check
 * @returns true if the route is public, false otherwise
 */
export const isPublicRoute = (route: AppRoute): boolean => {
  return PUBLIC_ROUTES.includes(route);
}; 