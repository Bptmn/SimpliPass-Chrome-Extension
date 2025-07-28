import React from 'react';
import { AppRouterProvider, AppRouterView, useAppRouter } from '@common/ui/router';
import { useListeners } from '@common/hooks/useListeners';

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
    platform: 'mobile',
  });

  return (
    <AppRouterProvider router={router}>
      {children}
    </AppRouterProvider>
  );
};

export default function App() {
  const {
    user,
    isUserFullyInitialized,
    listenersError,
  } = useListeners();

  return (
    <RouterWrapper
      user={user}
      isUserFullyInitialized={isUserFullyInitialized}
      listenersError={listenersError}
    >
      <AppRouterView
        user={user}
        theme="light"
      />
    </RouterWrapper>
  );
} 