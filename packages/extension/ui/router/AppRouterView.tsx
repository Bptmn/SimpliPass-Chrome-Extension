/**
 * AppRouterView.tsx (Extension / DOM)
 *
 * Purpose: Render system/business routes for the extension using DOM components.
 * - System guards (auth/loading/error) only; business routing remains explicit.
 */

import React from 'react';
import type { User } from '@common/types/auth.types';
import type { PageState } from '@common/types/auth.types';
import { ROUTES, requiresAuth, hasLayout, routeComponents } from './ROUTES';
import { NavBar } from '../components/NavBar';

export type UseAppRouterReturn = {
  currentRoute: keyof typeof ROUTES;
  error: string | null;
  routeParams?: Record<string, any>;
};

export type AppRouterViewProps = {
  user: User | null;
  pageState?: PageState | null;
  onInjectCredential?: (credentialId: string) => void;
  theme?: 'light' | 'dark';
  // For now, we pass router state in from popup to avoid RN context coupling
  router?: UseAppRouterReturn;
};

export const AppRouterView: React.FC<AppRouterViewProps> = ({ user, pageState, onInjectCredential, theme = 'light', router }) => {
  const currentRoute = router?.currentRoute ?? 'LOADING';
  const routeParams = router?.routeParams ?? {};

  if (requiresAuth(currentRoute) && !user) {
    return (
      <div style={styles.container}>
        <div style={styles.centerContent}>Redirecting to login...</div>
      </div>
    );
  }

  const RouteComponent = routeComponents[currentRoute];

  if (!hasLayout(currentRoute)) {
    return (
      <div style={styles.fullPage}>
        <RouteComponent {...routeParams} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Fixed NavBar at the top */}
      <NavBar />
      <div style={styles.page}>
        <RouteComponent {...routeParams} />
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', height: '100%', background: '#FFFFFF' },
  fullPage: { display: 'flex', height: '100%', background: '#FFFFFF' },
  page: { flex: 1, overflow: 'auto' },
  centerContent: { margin: 'auto', color: '#4B5563' },
};

export default AppRouterView;


