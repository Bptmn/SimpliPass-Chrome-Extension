/**
 * AppRouterView.tsx - System-driven router view component
 * 
 * Renders routes based on system-level state from useAppRouter.
 * System routes (LOADING, ERROR, LOGIN, LOCK) handled automatically.
 * Business routes require explicit navigateTo() calls from business logic.
 * 
 * All route references use ROUTES constants to prevent string literals.
 * Layout is applied based on route requirements (hasLayout function).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeProvider } from '@common/ui/design/theme';
import { ToastProvider } from '@common/ui/components/Toast';
import NavBar from '@common/ui/components/NavBar';
import { getColors } from '@common/ui/design/colors';
import { layout } from '@common/ui/design/layout';
import type { User } from '@common/core/types/auth.types';
import type { PageState } from '@common/core/types/auth.types';
import { useAppRouterContext } from './AppRouterProvider';
import { 
  ROUTES, 
  routeComponents, 
  requiresAuth, 
  hasLayout
} from './ROUTES';

// Props for the AppRouterView component
interface AppRouterViewProps {
  user: User | null;
  pageState?: PageState | null;
  onInjectCredential?: (credentialId: string) => void;
  theme?: 'light' | 'dark';
}

/**
 * Main router view component
 * 
 * Flow:
 * 1. Get router context and route configuration
 * 2. Check authentication guard for private routes
 * 3. Render system states (loading, error) or business routes
 * 4. Apply layout based on route requirements
 * 
 * System routes are rendered automatically based on system state.
 * Business routes require explicit navigateTo() calls from business logic.
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

  // Get current route component from routeComponents mapping
  const RouteComponent = routeComponents[router.currentRoute];

  /**
   * Step 1: System-level authentication guard
   * Only checks system state, business logic must use navigateTo() explicitly
   * Private routes automatically redirect to login if user is not authenticated
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

  /**
   * Step 2: Render based on system-level route state
   * System routes (LOADING, ERROR) are rendered as full-page components
   * Business routes are rendered with layout if required
   */
  return (
    <ThemeProvider>
      <ToastProvider>
        <View style={styles.container}>
          {/* System Loading State - rendered as full page */}
          {router.currentRoute === ROUTES.LOADING && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Initializing SimpliPass...</Text>
              <Text style={styles.loadingSubtext}>Please wait while we check your authentication status</Text>
            </View>
          )}
          
          {/* System Error State - rendered as full page */}
          {router.currentRoute === ROUTES.ERROR && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {router.error}</Text>
            </View>
          )}
          
          {/* Step 3: Business Route Rendering - requires explicit navigateTo() calls */}
          {RouteComponent && router.currentRoute !== ROUTES.LOADING && router.currentRoute !== ROUTES.ERROR && (
            <>
              {/* Layout for routes that need it (navbar + helperbar) */}
              {hasLayout(router.currentRoute) && user && (
                <>
                  <View style={styles.header}>
                    <NavBar />
                  </View>
                  <View style={styles.mainContent}>
                    <RouteComponentWithProps 
                      component={RouteComponent}
                      router={router}
                      user={user}
                      pageState={pageState}
                      onInjectCredential={onInjectCredential}
                    />
                  </View>
                </>
              )}
              
              {/* Full page for routes without layout (system routes) */}
              {!hasLayout(router.currentRoute) && (
                <RouteComponentWithProps 
                  component={RouteComponent}
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
 * RouteComponentWithProps - Renders the appropriate component with inline props
 * 
 * Generates props for each route type based on router state and parameters.
 * Ensures components receive the correct props for their specific route.
 * 
 * Flow:
 * 1. Get component from route mapping
 * 2. Generate props based on route type and router state
 * 3. Render component with props
 */
const RouteComponentWithProps: React.FC<{
  component: React.ComponentType<any>;
  router: any;
  user: User | null;
  pageState?: PageState | null;
  onInjectCredential?: (credentialId: string) => void;
}> = ({ component: Component, router, user, pageState, onInjectCredential }) => {
  // Generate props based on route type and router state
  const props = (() => {
    switch (router.currentRoute) {
      case ROUTES.LOGIN:
        return { user };
      case ROUTES.LOCK:
        return { reason: router.lockReason, user };
      case ROUTES.HOME:
        return { user, pageState, onInjectCredential };
      case ROUTES.ADD_CREDENTIAL_2:
        return { 
          title: router.routeParams.title || '',
          link: router.routeParams.link,
        };
      case ROUTES.ADD_CARD_2:
        return { ...router.routeParams };
      case ROUTES.CREDENTIAL_DETAILS:
        return { credential: router.routeParams.credential, onBack: router.goBack };
      case ROUTES.BANK_CARD_DETAILS:
        return { card: router.routeParams.card, onBack: router.goBack };
      case ROUTES.SECURE_NOTE_DETAILS:
        return { note: router.routeParams.note, onBack: router.goBack };
      case ROUTES.MODIFY_CREDENTIAL:
        return { credential: router.routeParams.credential, onBack: router.goBack };
      case ROUTES.MODIFY_BANK_CARD:
        return { bankCard: router.routeParams.bankCard, onBack: router.goBack };
      case ROUTES.MODIFY_SECURENOTE:
        return { secureNote: router.routeParams.secureNote, onBack: router.goBack };
      case ROUTES.EMAIL_CONFIRMATION:
        return {
          email: router.routeParams.email,
          onConfirm: router.routeParams.onConfirm,
          onResend: router.routeParams.onResend,
        };
      default:
        return {};
    }
  })();
  
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

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.primaryBackground,
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
      backgroundColor: colors.primaryBackground,
      padding: 20, // Placeholder for spacing.medium
    },
    errorText: {
      fontSize: 16,
      color: colors.alternate,
      textAlign: 'center',
    },
  });
}; 