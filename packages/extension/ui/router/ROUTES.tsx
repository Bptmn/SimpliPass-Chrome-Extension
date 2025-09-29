/**
 * ROUTES.tsx (Extension / DOM)
 *
 * Purpose: Route constants and minimal DOM route components for the extension.
 * - Keeps route names aligned with domain expectations
 * - Provides lightweight placeholders to decouple from React Native pages
 */

import React from 'react';
import { HomePage } from '@extension/ui/pages/HomePage';
import { LoginPage } from '@extension/ui/pages/LoginPage';
import { GeneratorPage } from '@extension/ui/pages/GeneratorPage';
import { SettingsPage } from '@extension/ui/pages/SettingsPage';

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

const Placeholder: React.FC<{ title: string; description?: string }> = ({ title, description }) => (
  <div style={{ padding: 16 }}>
    <h3 style={{ margin: 0, fontSize: 16 }}>{title}</h3>
    {description ? (
      <p style={{ color: '#4B5563', fontSize: 14, marginTop: 8 }}>{description}</p>
    ) : null}
  </div>
);

export const routeComponents: Record<AppRoute, React.ComponentType<any>> = {
  LOGIN: () => <LoginPage />, 
  LOCK: () => <Placeholder title="Locked" description="Session locked. Unlock to proceed." />, 
  HOME: () => <HomePage />, 
  GENERATOR: () => <GeneratorPage />, 
  SETTINGS: () => <SettingsPage />, 
  ADD_CREDENTIAL_1: () => <Placeholder title="Add Credential (1)" />, 
  ADD_CREDENTIAL_2: () => <Placeholder title="Add Credential (2)" />, 
  ADD_CARD_1: () => <Placeholder title="Add Card (1)" />, 
  ADD_CARD_2: () => <Placeholder title="Add Card (2)" />, 
  ADD_SECURENOTE: () => <Placeholder title="Add Secure Note" />, 
  MODIFY_BANK_CARD: () => <Placeholder title="Modify Bank Card" />, 
  MODIFY_CREDENTIAL: () => <Placeholder title="Modify Credential" />, 
  MODIFY_SECURENOTE: () => <Placeholder title="Modify Secure Note" />, 
  LOADING: () => null,
  ERROR: () => null,
  CREDENTIAL_DETAILS: () => <Placeholder title="Credential Details" />, 
  BANK_CARD_DETAILS: () => <Placeholder title="Bank Card Details" />, 
  SECURE_NOTE_DETAILS: () => <Placeholder title="Secure Note Details" />, 
  EMAIL_CONFIRMATION: () => <Placeholder title="Email Confirmation" />, 
};

export const PUBLIC_ROUTES: AppRoute[] = [
  'LOGIN', 'LOADING', 'ERROR', 'LOCK', 'EMAIL_CONFIRMATION',
];

export const SYSTEM_ROUTES: AppRoute[] = [
  'LOADING', 'ERROR', 'LOGIN', 'LOCK', 'EMAIL_CONFIRMATION',
];

export const requiresAuth = (route: AppRoute): boolean => !PUBLIC_ROUTES.includes(route);
export const hasLayout = (route: AppRoute): boolean => !SYSTEM_ROUTES.includes(route);


