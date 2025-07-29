import React, { useEffect } from 'react';
import { AppRouterProvider, AppRouterView, useAppRouter } from '@common/ui/router';
import { useAppInitialization } from '@common/hooks/useAppInitialization';
import { useListeners } from '@common/hooks/useListeners';

export default function App() {
  // Step 1: Initialize app state using shared hook
  const { state, initializeApp } = useAppInitialization();

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
    platform: 'mobile',
  });

  return (
    <AppRouterProvider router={router}>
      <AppRouterView
        user={state.user}
        theme="light"
        stopListeners={stopListeners}
      />
    </AppRouterProvider>
  );
} 