/**
 * ROUTES.ts (Extension / DOM)
 *
 * Purpose: Route constants only - no component imports to avoid circular dependencies
 */

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
} as const;

export type AppRoute = keyof typeof ROUTES;

export const PUBLIC_ROUTES: AppRoute[] = [
  'LOGIN', 'LOADING', 'ERROR', 'LOCK', 'EMAIL_CONFIRMATION',
];

export const SYSTEM_ROUTES: AppRoute[] = [
  'LOADING', 'ERROR', 'LOGIN', 'LOCK', 'EMAIL_CONFIRMATION',
];

export const requiresAuth = (route: AppRoute): boolean => !PUBLIC_ROUTES.includes(route);
export const hasLayout = (route: AppRoute): boolean => !SYSTEM_ROUTES.includes(route);
