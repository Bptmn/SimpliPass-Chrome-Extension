/**
 * AppRouterView.tsx (Extension / DOM)
 *
 * Purpose: Render system/business routes for the extension using DOM components.
 * - System guards (auth/loading/error) only; business routing remains explicit.
 */

import React from 'react';
import type { User } from '@common/core/types/auth.types';
import type { PageState } from '@common/core/types/auth.types';
import { ROUTES, routeComponents, requiresAuth, hasLayout } from './ROUTES';

export type UseAppRouterReturn = {
  currentRoute: keyof typeof ROUTES;
  error: string | null;
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
        <RouteComponent />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>SimpliPass</nav>
      <div style={styles.page}>
        <RouteComponent />
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', height: '100%', background: '#FFFFFF' },
  fullPage: { display: 'flex', height: '100%', background: '#FFFFFF' },
  navbar: { height: 44, display: 'flex', alignItems: 'center', padding: '0 12px', borderBottom: '1px solid #E5E7EB', fontWeight: 600 },
  page: { flex: 1, overflow: 'auto' },
  centerContent: { margin: 'auto', color: '#4B5563' },
};

export default AppRouterView;


