/**
 * Route Configuration - Data-driven route definitions
 * 
 * This file defines all routes in a structured, maintainable way.
 * Following React Router best practices for scalable routing.
 */

import React from 'react';
import LoginPage from '@common/ui/pages/LoginPage';
import { HomePage } from '@common/ui/pages/HomePage';
import { SettingsPage } from '@common/ui/pages/SettingsPage';
import { GeneratorPage } from '@common/ui/pages/GeneratorPage';
import AddCard1 from '@common/ui/pages/AddCard1';
import { AddCard2 } from '@common/ui/pages/AddCard2';
import AddSecureNote from '@common/ui/pages/AddSecureNote';
import AddCredential1 from '@common/ui/pages/AddCredential1';
import { AddCredential2 } from '@common/ui/pages/AddCredential2';
import { CredentialDetailsPage } from '@common/ui/pages/CredentialDetailsPage';
import { BankCardDetailsPage } from '@common/ui/pages/BankCardDetailsPage';
import { SecureNoteDetailsPage } from '@common/ui/pages/SecureNoteDetailsPage';
import { ModifyBankCardPage } from '@common/ui/pages/ModifyBankCardPage';
import { ModifyCredentialPage } from '@common/ui/pages/ModifyCredentialPage';
import { ModifySecureNotePage } from '@common/ui/pages/ModifySecureNotePage';
import { LockPage } from '@common/ui/pages/LockPage';
import { EmailConfirmationPage } from '@common/ui/pages/EmailConfirmationPage';
import { ROUTES } from './ROUTES';
import { CATEGORIES } from '@common/core/types/categories.types';
import type { User } from '@common/core/types/auth.types';
import type { PageState } from '@common/core/types/types';

// Route configuration interface
export interface RouteConfig {
  path: string;
  title: string;
  isPublic: boolean;
  requiresAuth: boolean;
  hasLayout: boolean;
  category: string;
  component: React.ComponentType<any>;
  getProps?: (router: any, user: User | null, pageState?: PageState | null, onInjectCredential?: (credentialId: string) => void) => any;
}

// Route configurations
// System-level routes (handled automatically by useAppRouter)
// Business routes (must use navigateTo() explicitly)
export const routeConfigs: RouteConfig[] = [
  // System Routes (handled automatically by useAppRouter)
  {
    path: ROUTES.LOADING,
    title: 'Loading',
    isPublic: true,
    requiresAuth: false,
    hasLayout: false,
    category: CATEGORIES.CREDENTIALS,
    component: () => null, // Handled by AppRouterView loading state
  },
  {
    path: ROUTES.ERROR,
    title: 'Error',
    isPublic: true,
    requiresAuth: false,
    hasLayout: false,
    category: CATEGORIES.CREDENTIALS,
    component: () => null, // Handled by AppRouterView error state
  },
  {
    path: ROUTES.LOGIN,
    title: 'Login',
    isPublic: true,
    requiresAuth: false,
    hasLayout: false,
    category: CATEGORIES.CREDENTIALS,
    component: LoginPage,
    getProps: (router, user) => ({ user }),
  },
  {
    path: ROUTES.LOCK,
    title: 'Lock',
    isPublic: true,
    requiresAuth: false,
    hasLayout: false,
    category: CATEGORIES.CREDENTIALS,
    component: LockPage,
    getProps: (router, user) => ({ 
      reason: router.lockReason, 
      user 
    }),
  },
  {
    path: ROUTES.EMAIL_CONFIRMATION,
    title: 'Email Confirmation',
    isPublic: true,
    requiresAuth: false,
    hasLayout: false,
    category: CATEGORIES.CREDENTIALS,
    component: EmailConfirmationPage,
    getProps: (router) => ({
      email: router.routeParams.email,
      onConfirm: router.routeParams.onConfirm,
      onResend: router.routeParams.onResend,
    }),
  },

  // Business Routes (require explicit navigateTo() calls)
  {
    path: ROUTES.HOME,
    title: 'Home',
    isPublic: false,
    requiresAuth: true,
    hasLayout: true,
    category: CATEGORIES.CREDENTIALS,
    component: HomePage,
    getProps: (router, user, pageState, onInjectCredential) => ({ 
      user, 
      pageState: pageState || null,
      onInjectCredential: onInjectCredential || (() => {}),
    }),
  },
  {
    path: ROUTES.GENERATOR,
    title: 'Password Generator',
    isPublic: false,
    requiresAuth: true,
    hasLayout: true,
    category: CATEGORIES.CREDENTIALS,
    component: GeneratorPage,
  },
  {
    path: ROUTES.SETTINGS,
    title: 'Settings',
    isPublic: false,
    requiresAuth: true,
    hasLayout: true,
    category: CATEGORIES.CREDENTIALS,
    component: SettingsPage,
  },

  // Add Item Routes (business logic - require explicit navigation)
  {
    path: ROUTES.ADD_CREDENTIAL_1,
    title: 'Add Credential',
    isPublic: false,
    requiresAuth: true,
    hasLayout: true,
    category: CATEGORIES.CREDENTIALS,
    component: AddCredential1,
  },
  {
    path: ROUTES.ADD_CREDENTIAL_2,
    title: 'Add Credential Details',
    isPublic: false,
    requiresAuth: true,
    hasLayout: true,
    category: CATEGORIES.CREDENTIALS,
    component: AddCredential2,
    getProps: (router) => ({
      title: router.routeParams.title || '',
      link: router.routeParams.link,
    }),
  },
  {
    path: ROUTES.ADD_CARD_1,
    title: 'Add Bank Card',
    isPublic: false,
    requiresAuth: true,
    hasLayout: true,
    category: CATEGORIES.BANK_CARDS,
    component: AddCard1,
  },
  {
    path: ROUTES.ADD_CARD_2,
    title: 'Add Bank Card Details',
    isPublic: false,
    requiresAuth: true,
    hasLayout: true,
    category: CATEGORIES.BANK_CARDS,
    component: AddCard2,
    getProps: (router) => ({ ...router.routeParams }),
  },
  {
    path: ROUTES.ADD_SECURENOTE,
    title: 'Add Secure Note',
    isPublic: false,
    requiresAuth: true,
    hasLayout: true,
    category: CATEGORIES.SECURE_NOTES,
    component: AddSecureNote,
  },

  // Detail Pages (business logic - require explicit navigation)
  {
    path: ROUTES.CREDENTIAL_DETAILS,
    title: 'Credential Details',
    isPublic: false,
    requiresAuth: true,
    hasLayout: true,
    category: CATEGORIES.CREDENTIALS,
    component: CredentialDetailsPage,
    getProps: (router) => ({
      credential: router.routeParams.credential,
      onBack: router.goBack,
    }),
  },
  {
    path: ROUTES.BANK_CARD_DETAILS,
    title: 'Bank Card Details',
    isPublic: false,
    requiresAuth: true,
    hasLayout: true,
    category: CATEGORIES.BANK_CARDS,
    component: BankCardDetailsPage,
    getProps: (router) => ({
      card: router.routeParams.card,
      onBack: router.goBack,
    }),
  },
  {
    path: ROUTES.SECURE_NOTE_DETAILS,
    title: 'Secure Note Details',
    isPublic: false,
    requiresAuth: true,
    hasLayout: true,
    category: CATEGORIES.SECURE_NOTES,
    component: SecureNoteDetailsPage,
    getProps: (router) => ({
      note: router.routeParams.note,
      onBack: router.goBack,
    }),
  },

  // Modify Pages (business logic - require explicit navigation)
  {
    path: ROUTES.MODIFY_CREDENTIAL,
    title: 'Modify Credential',
    isPublic: false,
    requiresAuth: true,
    hasLayout: true,
    category: CATEGORIES.CREDENTIALS,
    component: ModifyCredentialPage,
    getProps: (router) => ({
      credential: router.routeParams.credential,
      onBack: router.goBack,
    }),
  },
  {
    path: ROUTES.MODIFY_BANK_CARD,
    title: 'Modify Bank Card',
    isPublic: false,
    requiresAuth: true,
    hasLayout: true,
    category: CATEGORIES.BANK_CARDS,
    component: ModifyBankCardPage,
    getProps: (router) => ({
      bankCard: router.routeParams.bankCard,
      onBack: router.goBack,
    }),
  },
  {
    path: ROUTES.MODIFY_SECURENOTE,
    title: 'Modify Secure Note',
    isPublic: false,
    requiresAuth: true,
    hasLayout: true,
    category: CATEGORIES.SECURE_NOTES,
    component: ModifySecureNotePage,
    getProps: (router) => ({
      secureNote: router.routeParams.secureNote,
      onBack: router.goBack,
    }),
  },
];

// Helper functions
export const getRouteConfig = (path: string): RouteConfig | undefined => {
  return routeConfigs.find(config => config.path === path);
};

export const isPublicRoute = (path: string): boolean => {
  const config = getRouteConfig(path);
  return config?.isPublic || false;
};

export const requiresAuth = (path: string): boolean => {
  const config = getRouteConfig(path);
  return config?.requiresAuth || false;
};

export const hasLayout = (path: string): boolean => {
  const config = getRouteConfig(path);
  return config?.hasLayout || false;
}; 