/**
 * useAppRouter.ts (Extension / DOM)
 *
 * Purpose: System-level router hook for the extension without RN dependencies.
 * - Determines system route from Zustand store
 * - Provides business navigation helpers
 */

import { useState, useCallback, useEffect } from 'react';
import { useAppStateStore } from '@common/hooks/useAppState';
import { ROUTES, type AppRoute } from './ROUTES';
import type { User } from '@common/core/types/auth.types';

export type LockReason = 'expired' | 'fingerprint_mismatch' | 'decryption_failed' | 'not_found' | 'corrupted';

export interface UseAppRouterProps {
  platform: 'extension';
}

export interface UseAppRouterReturn {
  currentRoute: AppRoute;
  isLoading: boolean;
  error: string | null;
  user: User | null;

  routeParams: Record<string, any>;
  lockReason?: LockReason;
  navigateTo: (route: AppRoute, params?: Record<string, any>) => void;
  navigateToLock: (reason: LockReason) => void;
  goBack: () => void;
  resetToHome: () => void;
  setParams: (params: Record<string, any>) => void;

  isExtension: true;
  isMobile: false;
}

export const useAppRouter = ({ platform }: UseAppRouterProps): UseAppRouterReturn => {
  const isInitializing = useAppStateStore(state => state.isInitializing);
  const initializationError = useAppStateStore(state => state.initializationError);
  const user = useAppStateStore(state => state.user);
  const userSecretKeyExist = useAppStateStore(state => state.userSecretKeyExist);
  const authIsAvailable = useAppStateStore(state => state.authIsAvailable);

  const [currentRoute, setCurrentRoute] = useState<AppRoute>(ROUTES.LOADING);
  const [routeHistory, setRouteHistory] = useState<{ route: AppRoute; params?: Record<string, any> }[]>([{ route: ROUTES.LOADING }]);
  const [routeParams, setRouteParams] = useState<Record<string, any>>({});
  const [lockReason, setLockReason] = useState<LockReason | undefined>();
  const [isBusinessNavigation, setIsBusinessNavigation] = useState(false);

  const determineSystemRoute = useCallback((): AppRoute => {
    const s = useAppStateStore.getState();
    if (s.isInitializing || !s.authIsAvailable) return ROUTES.LOADING;
    if (!s.user) return ROUTES.LOGIN;
    if (!s.userSecretKeyExist) return ROUTES.LOCK;
    return ROUTES.HOME;
  }, []);

  useEffect(() => {
    const newSystemRoute = determineSystemRoute();
    if (isBusinessNavigation) {
      const s = useAppStateStore.getState();
      if (!s.user || !s.userSecretKeyExist || !s.authIsAvailable) {
        setIsBusinessNavigation(false);
      } else {
        return;
      }
    }
    if (newSystemRoute !== currentRoute) {
      setCurrentRoute(newSystemRoute);
      setRouteHistory(prev => [...prev, { route: newSystemRoute }]);
      setRouteParams({});
      if (newSystemRoute !== ROUTES.LOCK) setLockReason(undefined);
    }
  }, [isInitializing, authIsAvailable, user, userSecretKeyExist, currentRoute, determineSystemRoute, isBusinessNavigation]);

  const navigateTo = useCallback((route: AppRoute, params?: Record<string, any>) => {
    setIsBusinessNavigation(true);
    setCurrentRoute(route);
    setRouteHistory(prev => [...prev, { route, params }]);
    setRouteParams(params || {});
    if (route !== ROUTES.LOCK) setLockReason(undefined);
  }, []);

  const navigateToLock = useCallback((reason: LockReason) => {
    setIsBusinessNavigation(true);
    setCurrentRoute(ROUTES.LOCK);
    setRouteHistory(prev => [...prev, { route: ROUTES.LOCK }]);
    setRouteParams({});
    setLockReason(reason);
  }, []);

  const goBack = useCallback(() => {
    if (routeHistory.length > 1) {
      const newHistory = routeHistory.slice(0, -1);
      const previous = newHistory[newHistory.length - 1];
      setIsBusinessNavigation(true);
      setRouteHistory(newHistory);
      setCurrentRoute(previous.route);
      setRouteParams(previous.params || {});
      if (previous.route !== ROUTES.LOCK) setLockReason(undefined);
    }
  }, [routeHistory]);

  const resetToHome = useCallback(() => {
    setIsBusinessNavigation(true);
    setCurrentRoute(ROUTES.HOME);
    setRouteHistory([{ route: ROUTES.HOME }]);
    setRouteParams({});
    setLockReason(undefined);
  }, []);

  const setParams = useCallback((params: Record<string, any>) => {
    setRouteParams(prev => ({ ...prev, ...params }));
    setRouteHistory(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      return [...prev.slice(0, -1), { ...last, params: { ...last.params, ...params } }];
    });
  }, []);

  return {
    currentRoute,
    isLoading: currentRoute === ROUTES.LOADING,
    error: initializationError,
    user,
    routeParams,
    lockReason,
    navigateTo,
    navigateToLock,
    goBack,
    resetToHome,
    setParams,
    isExtension: true,
    isMobile: false,
  };
};


