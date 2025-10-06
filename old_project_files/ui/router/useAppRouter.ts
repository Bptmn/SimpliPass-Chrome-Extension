/**
 * useAppRouter.ts - System-level router hook for navigation management
 * 
 * Clean separation between system routing (automatic) and business navigation (manual).
 * Uses Zustand store directly for automatic re-rendering.
 * 
 * System Routing (Automatic):
 * - LOADING: App is initializing
 * - LOGIN: No user authenticated  
 * - LOCK: User exists but no secret key
 * - HOME: User fully authenticated with secret key
 * 
 * Business Navigation (Manual):
 * - Form steps, item details, settings, etc.
 * - Uses navigateTo() explicitly
 * 
 * Flow:
 * 1. Subscribe to Zustand store for automatic updates
 * 2. Determine system route based on core states
 * 3. Provide business navigation methods
 */

import { useState, useCallback, useEffect } from 'react';
import { useAppStateStore } from '@common/hooks/useAppState';
import { ROUTES, type AppRoute } from './ROUTES';
import type { User } from '@common/core/types/auth.types';

// Lock screen reasons for user re-authentication
export type LockReason = 'expired' | 'fingerprint_mismatch' | 'decryption_failed' | 'not_found' | 'corrupted';

// Props for router initialization
export interface UseAppRouterProps {
  platform: 'extension' | 'mobile';
}

// Router return type
export interface UseAppRouterReturn {
  // System state
  currentRoute: AppRoute;
  isLoading: boolean;
  error: string | null;
  user: User | null;
  
  // Business navigation
  routeParams: Record<string, any>;
  lockReason?: LockReason;
  navigateTo: (route: AppRoute, params?: Record<string, any>) => void;
  navigateToLock: (reason: LockReason) => void;
  goBack: () => void;
  resetToHome: () => void;
  setParams: (params: Record<string, any>) => void;
  
  // Platform helpers
  isExtension: boolean;
  isMobile: boolean;
}

/**
 * Main router hook - clean separation of system and business routing
 */
export const useAppRouter = ({
  platform,
}: UseAppRouterProps): UseAppRouterReturn => {
  // Subscribe to Zustand store directly for automatic updates
  const isInitializing = useAppStateStore(state => state.isInitializing);
  const initializationError = useAppStateStore(state => state.initializationError);
  const user = useAppStateStore(state => state.user);
  const userSecretKeyExist = useAppStateStore(state => state.userSecretKeyExist);
  const authIsAvailable = useAppStateStore(state => state.authIsAvailable); // ✅ NEW

  // System route state
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(ROUTES.LOADING);
  
  // Business navigation state
  const [routeHistory, setRouteHistory] = useState<{ route: AppRoute; params?: Record<string, any> }[]>([{ route: ROUTES.LOADING }]);
  const [routeParams, setRouteParams] = useState<Record<string, any>>({});
  const [lockReason, setLockReason] = useState<LockReason | undefined>();
  
  // ✅ NEW: Track if we're in business navigation mode
  const [isBusinessNavigation, setIsBusinessNavigation] = useState(false);

  /**
   * Step 1: Determine system route based on core app states
   * This is automatic routing based on initialization and authentication state
   */
  const determineSystemRoute = useCallback((): AppRoute => {
    // Get the latest state directly from Zustand to avoid stale closures
    const latestState = useAppStateStore.getState();
    
    console.log('[useAppRouter] Determining system route from core states:', {
      isInitializing: latestState.isInitializing,
      authIsAvailable: latestState.authIsAvailable, // ✅ NEW
      hasUser: !!latestState.user,
      hasSecretKey: latestState.userSecretKeyExist,
      userId: latestState.user?.id
    });
    
    // Priority 1: App is initializing OR auth not available yet
    if (latestState.isInitializing) {
      console.log('[useAppRouter] System route: LOADING (app initializing)');
      return ROUTES.LOADING;
    }
    
    if (!latestState.authIsAvailable) {
      console.log('[useAppRouter] System route: LOADING (auth not available yet)');
      return ROUTES.LOADING;
    }
    
    // Priority 2: No user authenticated (after initialization is complete)
    if (!latestState.user) {
      console.log('[useAppRouter] System route: LOGIN (no user)');
      return ROUTES.LOGIN;
    }
    
    // Priority 3: User exists but no secret key
    if (!latestState.userSecretKeyExist) {
      console.log('[useAppRouter] System route: LOCK (user secret key missing)');
      return ROUTES.LOCK;
    }
    
    // Priority 4: User fully authenticated with secret key
    console.log('[useAppRouter] System route: HOME (user fully authenticated)');
    return ROUTES.HOME;
  }, []); // No dependencies needed since we get state directly

  /**
   * Step 2: Update system route when app state changes
   * This is automatic - no manual intervention needed
   * Only runs when NOT in business navigation mode
   */
  useEffect(() => {    
    const newSystemRoute = determineSystemRoute();
    
    // ✅ Exit business navigation mode if system state changes significantly
    if (isBusinessNavigation) {
      const latestState = useAppStateStore.getState();
      const hasUserChanged = !latestState.user; // User logged out
      const hasSecretKeyChanged = !latestState.userSecretKeyExist; // Secret key lost
      const hasAuthChanged = !latestState.authIsAvailable; // Auth became unavailable
      
      if (hasUserChanged || hasSecretKeyChanged || hasAuthChanged) {
        console.log('[useAppRouter] System state changed significantly, exiting business navigation mode');
        setIsBusinessNavigation(false);
      } else {
        console.log('[useAppRouter] Skipping system route update - in business navigation mode');
        return;
      }
    }
    
    // Only change route if system route actually changed
    if (newSystemRoute !== currentRoute) {
      console.log('[useAppRouter] System route change:', currentRoute, '→', newSystemRoute);
      setCurrentRoute(newSystemRoute);
      setRouteHistory(prev => [...prev, { route: newSystemRoute }]);
      
      // Clear business navigation state for system route changes
      setRouteParams({});
      if (newSystemRoute !== ROUTES.LOCK) {
        setLockReason(undefined);
      }
    }
  }, [isInitializing, authIsAvailable, user, userSecretKeyExist, currentRoute, determineSystemRoute, isBusinessNavigation]); // ✅ Added isBusinessNavigation

  /**
   * Step 3: Business navigation methods
   * These are for explicit business logic navigation (forms, details, etc.)
   */
  const navigateTo = useCallback((route: AppRoute, params?: Record<string, any>) => {
    console.log('[useAppRouter] Business navigation to:', route, 'params:', params);
    
    // ✅ Set business navigation mode
    setIsBusinessNavigation(true);
    
    setCurrentRoute(route);
    setRouteHistory(prev => [...prev, { route, params }]);
    setRouteParams(params || {});
    
    // Clear lock reason when navigating away from lock
    if (route !== ROUTES.LOCK) {
      setLockReason(undefined);
    }
  }, []);

  const navigateToLock = useCallback((reason: LockReason) => {
    console.log('[useAppRouter] Business navigation to LOCK with reason:', reason);
    
    // ✅ Set business navigation mode
    setIsBusinessNavigation(true);
    
    setCurrentRoute(ROUTES.LOCK);
    setRouteHistory(prev => [...prev, { route: ROUTES.LOCK }]);
    setRouteParams({});
    setLockReason(reason);
  }, []);

  const goBack = useCallback(() => {
    console.log('[useAppRouter] Business navigation: goBack');
    if (routeHistory.length > 1) {
      const newHistory = routeHistory.slice(0, -1);
      const previous = newHistory[newHistory.length - 1];
      console.log('[useAppRouter] Going back to:', previous.route);
      
      // ✅ Set business navigation mode
      setIsBusinessNavigation(true);
      
      setRouteHistory(newHistory);
      setCurrentRoute(previous.route);
      setRouteParams(previous.params || {});
      
      if (previous.route !== ROUTES.LOCK) {
        setLockReason(undefined);
      }
    } else {
      console.log('[useAppRouter] No history to go back to');
    }
  }, [routeHistory]);

  const resetToHome = useCallback(() => {
    console.log('[useAppRouter] Business navigation: resetToHome');
    
    // ✅ Set business navigation mode
    setIsBusinessNavigation(true);
    
    setCurrentRoute(ROUTES.HOME);
    setRouteHistory([{ route: ROUTES.HOME }]);
    setRouteParams({});
    setLockReason(undefined);
  }, []);

  const setParams = useCallback((params: Record<string, any>) => {
    console.log('[useAppRouter] Business navigation: updating params');
    setRouteParams(params);
    setRouteHistory(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      return [...prev.slice(0, -1), { ...last, params }];
    });
  }, []);

  // Platform helpers
  const isExtension = platform === 'extension';
  const isMobile = platform === 'mobile';

  return {
    // System state
    currentRoute,
    isLoading: currentRoute === ROUTES.LOADING,
    error: initializationError,
    user,
    
    // Business navigation
    routeParams,
    lockReason,
    navigateTo,
    navigateToLock,
    goBack,
    resetToHome,
    setParams,
    
    // Platform helpers
    isExtension,
    isMobile,
  };
}; 