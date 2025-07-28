/**
 * useAppRouter.ts - Core router hook for navigation and route management
 * 
 * This hook manages the application's navigation state, route history, and
 * authentication-based routing logic. It provides a centralized way to handle
 * navigation, route parameters, and authentication state changes.
 */

import { useState, useCallback, useEffect } from 'react';
import type { User } from '@common/core/types/auth.types';
import { ROUTES, type AppRoute } from './ROUTES';

// Different reasons why the app might be locked
export type LockReason = 'expired' | 'fingerprint_mismatch' | 'decryption_failed' | 'not_found' | 'corrupted';

// Props required to initialize the router hook
export interface UseAppRouterProps {
  user: User | null;
  isUserFullyInitialized: boolean;
  listenersError: string | null;
  platform: 'extension' | 'mobile';
}

// Return type of the router hook with all navigation methods and state
export interface UseAppRouterReturn {
  currentRoute: AppRoute;
  isLoading: boolean;
  error: string | null;
  routeParams: Record<string, any>;
  lockReason?: LockReason;
  navigateTo: (route: AppRoute, params?: Record<string, any>) => void;
  navigateToLock: (reason: LockReason) => void;
  goBack: () => void;
  resetToHome: () => void;
  setParams: (params: Record<string, any>) => void;
  isExtension: boolean;
  isMobile: boolean;
}

/**
 * Main router hook that manages navigation state and authentication-based routing
 * 
 * This hook determines the current route based on authentication state and provides
 * methods for navigation, route history management, and parameter handling.
 */
export const useAppRouter = ({
  user,
  isUserFullyInitialized,
  listenersError,
  platform,
}: UseAppRouterProps): UseAppRouterReturn => {
  // Current active route
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(ROUTES.LOADING);
  
  // Navigation history for back functionality
  const [routeHistory, setRouteHistory] = useState<{ route: AppRoute; params?: Record<string, any> }[]>([{ route: ROUTES.LOADING }]);
  
  // Parameters passed to the current route
  const [routeParams, setRouteParams] = useState<Record<string, any>>({});
  
  // Reason for lock screen (if applicable)
  const [lockReason, setLockReason] = useState<LockReason | undefined>();

  /**
   * Determines the appropriate route based on authentication state
   * Priority: loading -> error -> login -> lock -> home
   */
  const determineRoute = useCallback((): AppRoute => {
    if (user === null && !listenersError) return ROUTES.LOADING;
    if (listenersError) return ROUTES.ERROR;
    if (!user) return ROUTES.LOGIN;
    if (!isUserFullyInitialized) return ROUTES.LOCK;
    return ROUTES.HOME;
  }, [user, isUserFullyInitialized, listenersError]);

  const getRouteChangeReason = useCallback((fromRoute: AppRoute, toRoute: AppRoute): string => {
    if (fromRoute === toRoute) return '';
    
    switch (toRoute) {
      case ROUTES.LOADING:
        return 'Initial loading state';
      case ROUTES.ERROR:
        return `Error occurred: ${listenersError}`;
      case ROUTES.LOGIN:
        return 'User not authenticated';
      case ROUTES.LOCK:
        return 'User secret key missing - requires password re-entry';
      case ROUTES.HOME:
        return 'User fully initialized and authenticated';
      default:
        return 'Unknown route change';
    }
  }, [listenersError]);

  /**
   * Updates route when authentication state changes
   * Automatically navigates to appropriate route based on user state
   */
  useEffect(() => {
    const newRoute = determineRoute();
    
    if (newRoute !== currentRoute) {
      const reason = getRouteChangeReason(currentRoute, newRoute);
      console.log('[useAppRouter] Route changed from', currentRoute, 'to', newRoute, '-', reason);
      setCurrentRoute(newRoute);
      setRouteHistory(prev => [...prev, { route: newRoute }]);
      setRouteParams({});
      // Clear lock reason when not on lock page
      if (newRoute !== ROUTES.LOCK) {
        setLockReason(undefined);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isUserFullyInitialized, listenersError]);

  /**
   * Navigates to a specific route with optional parameters
   * Updates route history and clears lock reason if navigating away from lock
   */
  const navigateTo = useCallback((route: AppRoute, params?: Record<string, any>) => {
    console.log('[useAppRouter] navigateTo called with route:', route, 'params:', params);
    setCurrentRoute(route);
    setRouteHistory(prev => [...prev, { route, params }]);
    setRouteParams(params || {});
    // Clear lock reason when navigating away from lock
    if (route !== ROUTES.LOCK) {
      setLockReason(undefined);
    }
  }, []);

  /**
   * Navigates to lock screen with a specific reason
   * Used when authentication fails or user needs to re-authenticate
   */
  const navigateToLock = useCallback((reason: LockReason) => {
    setCurrentRoute(ROUTES.LOCK);
    setRouteHistory(prev => [...prev, { route: ROUTES.LOCK }]);
    setRouteParams({});
    setLockReason(reason);
  }, []);

  /**
   * Goes back to the previous route in history
   * Restores previous route parameters and clears lock reason if appropriate
   */
  const goBack = useCallback(() => {
    console.log('[useAppRouter] goBack called, history length:', routeHistory.length);
    if (routeHistory.length > 1) {
      const newHistory = routeHistory.slice(0, -1);
      const previous = newHistory[newHistory.length - 1];
      console.log('[useAppRouter] Going back from', currentRoute, 'to', previous.route, 'with params:', previous.params);
      setRouteHistory(newHistory);
      setCurrentRoute(previous.route);
      setRouteParams(previous.params || {});
      // Clear lock reason when going back from lock
      if (previous.route !== ROUTES.LOCK) {
        setLockReason(undefined);
      }
    } else {
      console.log('[useAppRouter] No history to go back to');
    }
  }, [routeHistory, currentRoute]);

  /**
   * Resets navigation to home screen
   * Clears all history and starts fresh from home
   */
  const resetToHome = useCallback(() => {
    setCurrentRoute(ROUTES.HOME);
    setRouteHistory([{ route: ROUTES.HOME }]);
    setRouteParams({});
    setLockReason(undefined);
  }, []);

  /**
   * Updates parameters for the current route
   * Updates both current params and history entry
   */
  const setParams = useCallback((params: Record<string, any>) => {
    setRouteParams(params);
    setRouteHistory(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      return [...prev.slice(0, -1), { ...last, params }];
    });
  }, []);

  // Platform detection helpers
  const isExtension = platform === 'extension';
  const isMobile = platform === 'mobile';

  return {
    currentRoute,
    isLoading: currentRoute === ROUTES.LOADING,
    error: listenersError,
    routeParams,
    lockReason,
    navigateTo,
    navigateToLock,
    goBack,
    resetToHome,
    setParams,
    isExtension,
    isMobile,
  };
}; 