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
import { LockPage } from '@extension/ui/pages/LockPage';
import { AddCredential1 } from '@extension/ui/pages/AddCredential1';
import { AddCredential2 } from '@extension/ui/pages/AddCredential2';
import { AddCard1 } from '@extension/ui/pages/AddCard1';
import { AddCard2 } from '@extension/ui/pages/AddCard2';
import { AddSecureNote } from '@extension/ui/pages/AddSecureNote';
import { BankCardDetailsPage } from '@extension/ui/pages/BankCardDetailsPage';
import { CodeConfirmationPage } from '@extension/ui/pages/CodeConfirmationPage';
import { CredentialDetailsPage } from '@extension/ui/pages/CredentialDetailsPage';
import { EmailConfirmationPage } from '@extension/ui/pages/EmailConfirmationPage';
import { ModifyBankCardPage } from '@extension/ui/pages/ModifyBankCardPage';
import { ModifyCredentialPage } from '@extension/ui/pages/ModifyCredentialPage';
import { ModifySecureNotePage } from '@extension/ui/pages/ModifySecureNotePage';
import type { BankCardDecrypted, CredentialDecrypted, SecureNoteDecrypted } from '@common/types/items.types';
import { SecureNoteDetailsPage } from '@extension/ui/pages/SecureNoteDetailsPage';
import { BackButton } from '@extension/ui/components';
import { useAppRouterContext } from './AppRouterProvider';
import { colors, spacing, typography } from '@extension/ui/design/tokens';

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

const Placeholder: React.FC<{ title: string; description?: string }> = ({ title, description }) => {
  const router = useAppRouterContext();

  const handleBack = () => {
    router.goBack();
  };

  return (
    <div style={placeholderStyles.container}>
      <div style={placeholderStyles.header}>
        <BackButton onClick={handleBack} label="Retour" />
        <h2 style={placeholderStyles.title}>{title}</h2>
      </div>
      {description && (
        <p style={placeholderStyles.description}>{description}</p>
      )}
    </div>
  );
};

const placeholderStyles: Record<string, React.CSSProperties> = {
  container: {
    padding: spacing.lg,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    margin: 0,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.base,
    color: colors.primary,
  },
  description: {
    color: colors.tertiary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.base,
    marginTop: spacing.sm,
  },
};

// Wrapper components to inject router context
const ModifyBankCardWrapper: React.FC<any> = () => {
  const router = useAppRouterContext();
  const bankCard = router.routeParams?.bankCard;
  if (!bankCard) {
    console.error('[ModifyBankCardWrapper] No bankCard in routeParams:', router.routeParams);
    return <div>Error: No bank card data</div>;
  }
  return <ModifyBankCardPage bankCard={bankCard} onBack={() => router.goBack()} />;
};

const ModifyCredentialWrapper: React.FC<any> = () => {
  const router = useAppRouterContext();
  const credential = router.routeParams?.credential;
  if (!credential) {
    console.error('[ModifyCredentialWrapper] No credential in routeParams:', router.routeParams);
    return <div>Error: No credential data</div>;
  }
  return <ModifyCredentialPage credential={credential} onBack={() => router.goBack()} />;
};

const ModifySecureNoteWrapper: React.FC<any> = () => {
  const router = useAppRouterContext();
  const secureNote = router.routeParams?.secureNote;
  if (!secureNote) {
    console.error('[ModifySecureNoteWrapper] No secureNote in routeParams:', router.routeParams);
    return <div>Error: No secure note data</div>;
  }
  return <ModifySecureNotePage secureNote={secureNote} onBack={() => router.goBack()} />;
};

const CredentialDetailsWrapper: React.FC<any> = () => {
  const router = useAppRouterContext();
  const credential = router.routeParams?.credential;
  if (!credential) {
    console.error('[CredentialDetailsWrapper] No credential in routeParams:', router.routeParams);
    return <div>Error: No credential data</div>;
  }
  return <CredentialDetailsPage credential={credential} onBack={() => router.goBack()} />;
};

const BankCardDetailsWrapper: React.FC<any> = () => {
  const router = useAppRouterContext();
  const card = router.routeParams?.card;
  if (!card) {
    console.error('[BankCardDetailsWrapper] No card in routeParams:', router.routeParams);
    return <div>Error: No card data</div>;
  }
  return <BankCardDetailsPage card={card} onBack={() => router.goBack()} />;
};

const SecureNoteDetailsWrapper: React.FC<any> = () => {
  const router = useAppRouterContext();
  const note = router.routeParams?.note;
  if (!note) {
    console.error('[SecureNoteDetailsWrapper] No note in routeParams:', router.routeParams);
    return <div>Error: No note data</div>;
  }
  return <SecureNoteDetailsPage note={note} onBack={() => router.goBack()} />;
};

export const routeComponents: Record<AppRoute, React.ComponentType<any>> = {
  LOGIN: () => <LoginPage />, 
  LOCK: () => <LockPage reason="expired" user={null} />, 
  HOME: () => <HomePage />, 
  GENERATOR: () => <GeneratorPage />, 
  SETTINGS: () => <SettingsPage />, 
  ADD_CREDENTIAL_1: () => <AddCredential1 />, 
  ADD_CREDENTIAL_2: () => <AddCredential2 title="" />, 
  ADD_CARD_1: () => <AddCard1 />, 
  ADD_CARD_2: () => <AddCard2 title="" bankName="" />, 
  ADD_SECURENOTE: () => <AddSecureNote />, 
  MODIFY_BANK_CARD: ModifyBankCardWrapper, 
  MODIFY_CREDENTIAL: ModifyCredentialWrapper, 
  MODIFY_SECURENOTE: ModifySecureNoteWrapper, 
  LOADING: () => null,
  ERROR: () => null,
  CREDENTIAL_DETAILS: CredentialDetailsWrapper, 
  BANK_CARD_DETAILS: BankCardDetailsWrapper, 
  SECURE_NOTE_DETAILS: SecureNoteDetailsWrapper, 
  EMAIL_CONFIRMATION: () => <Placeholder title="Email Confirmation" description="Pass email prop" />, 
};

export const PUBLIC_ROUTES: AppRoute[] = [
  'LOGIN', 'LOADING', 'ERROR', 'LOCK', 'EMAIL_CONFIRMATION',
];

export const SYSTEM_ROUTES: AppRoute[] = [
  'LOADING', 'ERROR', 'LOGIN', 'LOCK', 'EMAIL_CONFIRMATION',
];

export const requiresAuth = (route: AppRoute): boolean => !PUBLIC_ROUTES.includes(route);
export const hasLayout = (route: AppRoute): boolean => !SYSTEM_ROUTES.includes(route);


