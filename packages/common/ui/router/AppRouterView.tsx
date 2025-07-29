/**
 * AppRouterView.tsx - Simplified Router View Component
 * 
 * This component uses a data-driven approach to render routes based on configuration.
 * Following React Router best practices for scalable, maintainable routing.
 * 
 * Responsibilities:
 * - Route-based authentication guards
 * - Layout management (navbar + helperbar)
 * - Loading and error states
 * - Page rendering delegation
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeProvider } from '@common/ui/design/theme';
import { ToastProvider } from '@common/ui/components/Toast';
import NavBar from '@common/ui/components/NavBar';
import { HelperBar } from '@common/ui/components/HelperBar';
import { getColors } from '@common/ui/design/colors';
import { layout } from '@common/ui/design/layout';
import type { User } from '@common/core/types/auth.types';
import type { PageState } from '@common/core/types/types';
import { useAppRouterContext } from './AppRouterProvider';
import { getRouteConfig, requiresAuth, hasLayout } from './routeConfig';
import { ROUTES } from './ROUTES';

// Props for the AppRouterView component
interface AppRouterViewProps {
  user: User | null;
  pageState?: PageState | null;
  onInjectCredential?: (credentialId: string) => void;
  theme?: 'light' | 'dark';
}

/**
 * AppRouterView - System-driven router view with explicit business navigation
 * 
 * This component renders routes based on system-level state from useAppRouter.
 * System routes (LOADING, ERROR, LOGIN, LOCK) are handled automatically.
 * Business routes require explicit navigateTo() calls from business logic.
 * 
 * @param user - Current user object (null if not authenticated)
 * @param pageState - State information for the current page
 * @param onInjectCredential - Callback for credential injection (extension only)
 * @param theme - Current theme setting
 */
export const AppRouterView: React.FC<AppRouterViewProps> = ({
  user,
  pageState,
  onInjectCredential,
  theme = 'light',
}) => {
  // Get router context from provider - ONLY system-level state
  const router = useAppRouterContext();
  const styles = createStyles(theme);

  // Get current route configuration
  const routeConfig = getRouteConfig(router.currentRoute);

  /**
   * System-level authentication guard
   * Only checks system state, business logic must use navigateTo() explicitly
   */
  if (requiresAuth(router.currentRoute) && !user) {
    return (
      <ThemeProvider>
        <ToastProvider>
          <View style={styles.container}>
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Redirecting to login...</Text>
            </View>
          </View>
        </ToastProvider>
      </ThemeProvider>
    );
  }

  // Render based on system-level route state
  return (
    <ThemeProvider>
      <ToastProvider>
        <View style={styles.container}>
          {/* System Loading State */}
          {router.currentRoute === ROUTES.LOADING && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Initializing SimpliPass...</Text>
              <Text style={styles.loadingSubtext}>Please wait while we check your authentication status</Text>
            </View>
          )}
          
          {/* System Error State */}
          {router.currentRoute === ROUTES.ERROR && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {router.error}</Text>
            </View>
          )}
          
          {/* Business Route Rendering - requires explicit navigateTo() calls */}
          {routeConfig && router.currentRoute !== ROUTES.LOADING && router.currentRoute !== ROUTES.ERROR && (
            <>
              {/* Layout for routes that need it */}
              {hasLayout(router.currentRoute) && user && (
                <>
                  <View style={styles.header}>
                    <NavBar />
                  </View>
                  <View style={styles.mainContent}>
                    <RouteComponent 
                      routeConfig={routeConfig}
                      router={router}
                      user={user}
                      pageState={pageState}
                      onInjectCredential={onInjectCredential}
                    />
                  </View>
                  <View style={styles.helperBar}>
                    <HelperBar category={routeConfig.category as any} />
                  </View>
                </>
              )}
              
              {/* Full page for routes without layout */}
              {!hasLayout(router.currentRoute) && (
                <RouteComponent 
                  routeConfig={routeConfig}
                  router={router}
                  user={user}
                  pageState={pageState}
                  onInjectCredential={onInjectCredential}
                />
              )}
            </>
          )}
        </View>
      </ToastProvider>
    </ThemeProvider>
  );
};

/**
 * RouteComponent - Renders the appropriate component based on route configuration
 */
const RouteComponent: React.FC<{
  routeConfig: any;
  router: any;
  user: User | null;
  pageState?: PageState | null;
  onInjectCredential?: (credentialId: string) => void;
}> = ({ routeConfig, router, user, pageState, onInjectCredential }) => {
  const Component = routeConfig.component;
  const props = routeConfig.getProps 
    ? routeConfig.getProps(router, user, pageState, onInjectCredential)
    : {};
  
  return <Component {...props} />;
};

/**
 * Creates dynamic styles that respond to the current theme
 * Ensures consistent theming across the application
 * 
 * @param theme - Current theme ('light' or 'dark')
 * @returns StyleSheet object with theme-aware styles
 */
const createStyles = (theme: 'light' | 'dark') => {
  const colors = getColors(theme);
  
  return StyleSheet.create({
    container: {
      backgroundColor: colors.primaryBackground,
      flex: 1,
      minHeight: 0,
      position: 'relative',
    },
    header: {
      backgroundColor: colors.primaryBackground,
      borderBottomColor: colors.borderColor,
      borderBottomWidth: 1,
      height: layout.navbarHeight,
      zIndex: 10,
    },
    mainContent: {
      backgroundColor: colors.primaryBackground,
      flex: 1,
    },
    helperBar: {
      backgroundColor: colors.primaryBackground,
      borderTopColor: colors.borderColor,
      borderTopWidth: 1,
      height: layout.helperBarHeight,
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 10,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    loadingText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.white,
      textAlign: 'center',
      marginBottom: 8,
    },
    loadingSubtext: {
      fontSize: 14,
      color: colors.tertiary,
      textAlign: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    errorText: {
      fontSize: 16,
      color: colors.error,
      textAlign: 'center',
    },
  });
}; 