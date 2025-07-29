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

// Props for the AppRouterView component
interface AppRouterViewProps {
  user: User | null;
  pageState?: PageState | null;
  onInjectCredential?: (credentialId: string) => void;
  theme?: 'light' | 'dark';
}

/**
 * AppRouterView - Simplified router view using data-driven configuration
 * 
 * This component uses a configuration-based approach to render routes.
 * Following React Router best practices for scalable, maintainable routing.
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
  // Get router context from provider
  const router = useAppRouterContext();
  const styles = createStyles(theme);

  // Get current route configuration
  const routeConfig = getRouteConfig(router.currentRoute);

  /**
   * Authentication Guard: Redirect to login if accessing private route without authentication
   */
  if (requiresAuth(router.currentRoute) && !user) {
    return (
      <ThemeProvider>
        <ToastProvider>
          <View style={styles.container}>
            {/* Redirect to login for unauthenticated users */}
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Redirecting to login...</Text>
            </View>
          </View>
        </ToastProvider>
      </ThemeProvider>
    );
  }

  // Render the app
  return (
    <ThemeProvider>
      <ToastProvider>
        <View style={styles.container}>
          {/* Loading State */}
          {router.isLoading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Initializing SimpliPass...</Text>
              <Text style={styles.loadingSubtext}>Please wait while we check your authentication status</Text>
            </View>
          )}
          
          {/* Error State */}
          {router.error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {router.error}</Text>
            </View>
          )}
          
          {/* Route Rendering */}
          {routeConfig && (
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