// PopupApp.tsx
// This file defines the main React application for the Chrome extension popup UI.
// It handles authentication, page state, credential suggestions, and renders the main popup interface.
// Responsibilities:
// - Manage user authentication and listen for auth state changes
// - Query the current tab for page info (domain, url, login form)
// - Route between pages (home, generator, settings, login)
// - Render the main UI (navbar, helper bar, etc.)

import React, { useState } from 'react';
import { AppRouterProvider, AppRouterView, useAppRouter } from '@common/ui/router';
import { PageState } from '@common/core/types/types';
import { useListeners } from '@common/hooks/useListeners';
import { injectCredentialIntoCurrentTab } from '../services/credentialInjection';

// Separate component to handle router creation
// This ensures the useAppRouter hook is called at the component level
const RouterWrapper: React.FC<{
  user: any;
  isUserFullyInitialized: boolean;
  listenersError: string | null;
  children: React.ReactNode;
}> = ({ user, isUserFullyInitialized, listenersError, children }) => {
  const router = useAppRouter({
    user,
    isUserFullyInitialized,
    listenersError,
    platform: 'extension',
  });

  return (
    <AppRouterProvider router={router}>
      {children}
    </AppRouterProvider>
  );
};

export const PopupApp: React.FC = () => {
  const [pageState] = useState<PageState | null>(null);
  const [theme] = useState<'light' | 'dark'>('light');

  const {
    user,
    isUserFullyInitialized,
    listenersError,
  } = useListeners();

  // Handler to inject a credential into the current tab
  const handleInjectCredential = (credentialId: string) => {
    injectCredentialIntoCurrentTab(credentialId);
  };

  return (
    <RouterWrapper
      user={user}
      isUserFullyInitialized={isUserFullyInitialized}
      listenersError={listenersError}
    >
      <AppRouterView
        user={user}
        pageState={pageState}
        onInjectCredential={handleInjectCredential}
        theme={theme}
      />
    </RouterWrapper>
  );
};

