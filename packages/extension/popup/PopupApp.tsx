// PopupApp.tsx
// This file defines the main React application for the Chrome extension popup UI.
// It uses the centralized useAppInitialization hook for clean, shared logic.
// Responsibilities:
// - Initialize app state using shared hook
// - Handle credential injection (extension-specific)
// - Render the main UI with proper routing

import React, { useState, useEffect } from 'react';
import { AppRouterProvider, AppRouterView, useAppRouter } from '@common/ui/router';
import { PageState } from '@common/core/types/types';
import { useAppInitialization } from '@common/hooks/useAppInitialization';
import { useListeners } from '@common/hooks/useListeners';
import { InitializationErrorBoundary } from '@common/ui/components/InitializationErrorBoundary';
import { injectCredentialIntoCurrentTab } from '../services/credentialInjection';

export const PopupApp: React.FC = () => {
  const [pageState] = useState<PageState | null>(null);
  const [theme] = useState<'light' | 'dark'>('light');

  // Step 1: Initialize app state using shared hook
  const { 
    state, 
    initializeApp
  } = useAppInitialization();

  // Step 2: Get stopListeners from useListeners
  const { stopListeners } = useListeners();

  // Step 3: Initialize app on mount
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // Step 4: Create router using the initialization state
  const router = useAppRouter({
    user: state.user,
    isUserFullyInitialized: state.isListening, // If listeners are active, user is fully initialized
    listenersError: state.listenersError,
    platform: 'extension',
  });

  // Step 5: Handler for extension-specific functionality
  const handleInjectCredential = (credentialId: string) => {
    injectCredentialIntoCurrentTab(credentialId);
  };

  return (
    <InitializationErrorBoundary
      initializationError={state.initializationError}
      onRetry={initializeApp}
    >
      <AppRouterProvider router={router}>
        <AppRouterView
          user={state.user}
          pageState={pageState}
          onInjectCredential={handleInjectCredential}
          theme={theme}
          stopListeners={stopListeners}
        />
      </AppRouterProvider>
    </InitializationErrorBoundary>
  );
};

