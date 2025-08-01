// PopupApp.tsx
// This file defines the main React application for the Chrome extension popup UI.
// It uses the clean architecture with clear separation of concerns:
// - useAppStateStore: Zustand-based global state management
// - useAppInitialization: Handles initialization logic (uses Zustand directly)
// - useAppRouter: Handles routing logic (subscribes to Zustand store)
// 
// Flow:
// 1. useAppStateStore provides global state management
// 2. useAppInitialization uses Zustand store directly
// 3. useAppRouter subscribes to Zustand store for automatic updates
// 4. AppRouterView renders the appropriate page

import React, { useState } from 'react';
import { AppRouterProvider, AppRouterView, useAppRouter } from '@common/ui/router';
import { PageState } from '@common/core/types/auth.types';
import { useAppInitialization } from '@common/hooks/useAppInitialization';
import { InitializationErrorBoundary } from '@common/ui/components/InitializationErrorBoundary';
import { injectCredentialIntoCurrentTab } from '../services/credentialInjection';

export const PopupApp: React.FC = () => {
  // Initialize page state (to get current page information)
  const [pageState] = useState<PageState | null>(null);
  const [theme] = useState<'light' | 'dark'>('light');

  // Step 1: Use initialization (uses Zustand store directly)
  useAppInitialization();

  // Step 2: Create router (subscribes to Zustand store automatically)
  const router = useAppRouter({
    platform: 'extension',
  });

  // Step 3: Handler for extension-specific functionality
  const handleInjectCredential = (credentialId: string) => {
    injectCredentialIntoCurrentTab(credentialId);
  };

  return (
    <InitializationErrorBoundary
      initializationError={router.error}
      onRetry={async () => {
        // Retry initialization by refreshing the page
        window.location.reload();
      }}
    >
      <AppRouterProvider router={router}>
        <AppRouterView
          user={router.user}
          pageState={pageState}
          onInjectCredential={handleInjectCredential}
          theme={theme}
        />
      </AppRouterProvider>
    </InitializationErrorBoundary>
  );
};

