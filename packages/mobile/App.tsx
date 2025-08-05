import React from 'react';
import { AppRouterProvider, AppRouterView, useAppRouter } from '@common/ui/router';
import { useAppInitialization } from '@common/hooks/useAppInitialization';
import { useAppStateStore } from '@common/hooks/useAppState';

export default function App() {
  // Step 1: Initialize app
  useAppInitialization({ platform: 'mobile' });

  // Step 2: Get app state from Zustand store
  const appState = useAppStateStore();

  // Step 3: Create router
  const router = useAppRouter({
    platform: 'mobile',
  });

  // Step 4: Render app with router
  return (
    <AppRouterProvider router={router}>
      <AppRouterView user={appState.user} />
    </AppRouterProvider>
  );
} 