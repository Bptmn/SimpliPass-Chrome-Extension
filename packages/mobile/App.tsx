import React, { useEffect } from 'react';
import { AppRouterProvider, AppRouterView, useAppRouter } from '@common/ui/router';
import { useAppInitialization } from '@common/hooks/useAppInitialization';
import { useAuthState } from '@common/hooks/useAuthState';

export default function App() {
  // Step 1: Initialize app state using shared hook
  const { state, initializeApp } = useAppInitialization();

  // Get auth state from auth listeners
  const authState = useAuthState();

  // Step 2: Initialize app on mount
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // Step 3: Create router using the auth state
  const router = useAppRouter({
    user: authState.user,
    isUserFullyInitialized: authState.isUserFullyInitialized,
    platform: 'mobile',
  });

  // Show loading state while initializing
  if (state.isInitializing) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        Initializing SimpliPass...
      </div>
    );
  }

  return (
    <AppRouterProvider router={router}>
      <AppRouterView
        user={authState.user}
        theme="light"
      />
    </AppRouterProvider>
  );
} 