import React, { useEffect } from 'react';
import { AppRouterProvider, AppRouterView, useAppRouter } from '@common/ui/router';
import { useAppInitialization } from '@common/hooks/useAppInitialization';

export default function App() {
  // Step 1: Initialize app state using shared hook
  const { state, initializeApp } = useAppInitialization();

  // Step 2: Initialize app on mount
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // Step 3: Create router using the initialization state
  const router = useAppRouter({
    user: state.user,
    isUserFullyInitialized: state.isListening, // If listeners are active, user is fully initialized
    listenersError: state.listenersError,
    platform: 'mobile',
  });

  return (
    <AppRouterProvider router={router}>
      <AppRouterView
        user={state.user}
        theme="light"
      />
    </AppRouterProvider>
  );
} 