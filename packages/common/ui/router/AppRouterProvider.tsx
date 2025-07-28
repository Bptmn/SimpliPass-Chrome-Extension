/**
 * AppRouterProvider.tsx - React Context Provider for Router State
 * 
 * This component provides the router state to the entire application through
 * React Context. It allows any component in the app tree to access the router
 * without prop drilling. The provider wraps the app and makes router state
 * globally available.
 */

import React, { createContext, useContext } from 'react';
import type { UseAppRouterReturn } from './useAppRouter';

// React Context for router state - null when not within provider
const AppRouterContext = createContext<UseAppRouterReturn | null>(null);

// Props for the AppRouterProvider component
interface AppRouterProviderProps {
  router: UseAppRouterReturn;
  children: React.ReactNode;
}

/**
 * AppRouterProvider - Provides router context to the entire application
 * 
 * This component wraps the app and provides the router state to all child
 * components through React Context. It should be placed at the top level
 * of the application, typically wrapping the main app component.
 * 
 * @param router - The router object from useAppRouter hook
 * @param children - React components that will have access to router context
 */
export const AppRouterProvider: React.FC<AppRouterProviderProps> = ({
  router,
  children,
}) => {
  return (
    <AppRouterContext.Provider value={router}>
      {children}
    </AppRouterContext.Provider>
  );
};

/**
 * useAppRouterContext - Hook to access router context from any component
 * 
 * This hook allows any component within the AppRouterProvider to access
 * the router state and navigation methods. It throws an error if used
 * outside of the provider to help with debugging.
 * 
 * @returns The router object with all navigation methods and state
 * @throws Error if used outside of AppRouterProvider
 */
export const useAppRouterContext = (): UseAppRouterReturn => {
  const context = useContext(AppRouterContext);
  if (!context) {
    throw new Error('useAppRouterContext must be used within an AppRouterProvider');
  }
  return context;
}; 