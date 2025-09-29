/**
 * AppRouterProvider (Extension / DOM)
 * Simple context provider to expose router state to the extension UI.
 */

import React, { createContext, useContext } from 'react';
import type { UseAppRouterReturn } from './useAppRouter';

const AppRouterContext = createContext<UseAppRouterReturn | null>(null);

type AppRouterProviderProps = {
  router: UseAppRouterReturn;
  children: React.ReactNode;
};

export const AppRouterProvider: React.FC<AppRouterProviderProps> = ({ router, children }) => {
  return <AppRouterContext.Provider value={router}>{children}</AppRouterContext.Provider>;
};

export function useAppRouterContext(): UseAppRouterReturn {
  const ctx = useContext(AppRouterContext);
  if (!ctx) {
    throw new Error('useAppRouterContext must be used within AppRouterProvider');
  }
  return ctx;
}


