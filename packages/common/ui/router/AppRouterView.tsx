/**
 * AppRouterView.tsx - Main Router View Component with Authentication Guards
 * 
 * This component handles the rendering of different pages based on the current route.
 * It implements authentication guards to protect private routes and automatically
 * redirects unauthenticated users to the login page. It also manages the overall
 * app layout including navigation, loading states, and error handling.
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
import LoginPage from '@common/ui/pages/LoginPage';
import { HomePage } from '@common/ui/pages/HomePage';
import { SettingsPage } from '@common/ui/pages/SettingsPage';
import { GeneratorPage } from '@common/ui/pages/GeneratorPage';
import { ToastProvider } from '@common/ui/components/Toast';
import NavBar from '@common/ui/components/NavBar';
import { HelperBar } from '@common/ui/components/HelperBar';
import { getColors } from '@common/ui/design/colors';
import { layout } from '@common/ui/design/layout';
import AddCard1 from '@common/ui/pages/AddCard1';
import { AddCard2 } from '@common/ui/pages/AddCard2';
import AddSecureNote from '@common/ui/pages/AddSecureNote';
import AddCredential1 from '@common/ui/pages/AddCredential1';
import { AddCredential2 } from '@common/ui/pages/AddCredential2';
import { CredentialDetailsPage } from '@common/ui/pages/CredentialDetailsPage';
import { BankCardDetailsPage } from '@common/ui/pages/BankCardDetailsPage';
import { SecureNoteDetailsPage } from '@common/ui/pages/SecureNoteDetailsPage';
import { ModifyBankCardPage } from '@common/ui/pages/ModifyBankCardPage';
import { ModifyCredentialPage } from '@common/ui/pages/ModifyCredentialPage';
import { ModifySecureNotePage } from '@common/ui/pages/ModifySecureNotePage';
import { LockPage } from '@common/ui/pages/LockPage';
import { EmailConfirmationPage } from '@common/ui/pages/EmailConfirmationPage';
import type { User } from '@common/core/types/auth.types';
import type { PageState } from '@common/core/types/types';
import { ROUTES, isPublicRoute } from './ROUTES';
import { useAppRouterContext } from './AppRouterProvider';
import { CATEGORIES } from '@common/core/types/categories.types';

// Props for the AppRouterView component
interface AppRouterViewProps {
  user: User | null;
  pageState?: PageState | null;
  onInjectCredential?: (credentialId: string) => void;
  theme?: 'light' | 'dark';
  stopListeners?: () => Promise<void>;
}

/**
 * AppRouterView - Main router view with authentication guards and layout management
 * 
 * This component is the core of the application's routing system. It:
 * 1. Checks authentication status and protects private routes
 * 2. Manages the overall app layout (navbar + helperbar)
 * 3. Handles loading and error states
 * 4. Delegates page rendering to individual page components
 * 
 * Authentication Flow:
 * - If user is not authenticated and trying to access a private route → redirect to login
 * - If user is authenticated → render the requested page with proper layout
 * - If user is partially authenticated (lock screen) → render lock page
 * 
 * Layout Structure:
 * - Public routes (login, lock, email confirmation): Full page
 * - Private routes: Navbar + Page Content + HelperBar (fixed at bottom)
 * 
 * @param user - Current user object (null if not authenticated)
 * @param pageState - State information for the current page
 * @param onInjectCredential - Callback for credential injection (extension only)
 * @param theme - Current theme setting
 * @param stopListeners - Function to stop database listeners
 */
export const AppRouterView: React.FC<AppRouterViewProps> = ({
  user,
  pageState,
  onInjectCredential,
  theme = 'light',
  stopListeners = async () => {},
}) => {
  // Get router context from provider
  const router = useAppRouterContext();
  const styles = createStyles(theme);

  // Helper function to determine category based on route
  const getCategoryForRoute = (route: string) => {
    switch (route) {
      case ROUTES.HOME:
        return CATEGORIES.CREDENTIALS; // Default category for home
      case ROUTES.ADD_CREDENTIAL_1:
      case ROUTES.ADD_CREDENTIAL_2:
        return CATEGORIES.CREDENTIALS;
      case ROUTES.ADD_CARD_1:
      case ROUTES.ADD_CARD_2:
        return CATEGORIES.BANK_CARDS;
      case ROUTES.ADD_SECURENOTE:
        return CATEGORIES.SECURE_NOTES;
      case ROUTES.CREDENTIAL_DETAILS:
      case ROUTES.MODIFY_CREDENTIAL:
        return CATEGORIES.CREDENTIALS;
      case ROUTES.BANK_CARD_DETAILS:
      case ROUTES.MODIFY_BANK_CARD:
        return CATEGORIES.BANK_CARDS;
      case ROUTES.SECURE_NOTE_DETAILS:
      case ROUTES.MODIFY_SECURENOTE:
        return CATEGORIES.SECURE_NOTES;
      default:
        return CATEGORIES.CREDENTIALS;
    }
  };

  /**
   * Authentication Guard: Redirect to login if accessing private route without authentication
   * This ensures that unauthenticated users can only access public routes
   */
  if (!isPublicRoute(router.currentRoute) && !user) {
    return (
      <ThemeProvider>
        <ToastProvider>
          <View style={styles.container}>
            <LoginPage user={user} stopListeners={stopListeners} />
          </View>
        </ToastProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <View style={styles.container}>
          {/* Loading State - Shows when app is initializing */}
          {router.isLoading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Initializing SimpliPass...</Text>
              <Text style={styles.loadingSubtext}>Please wait while we check your authentication status</Text>
            </View>
          )}
          
          {/* Error State - Shows when there's a critical error */}
          {router.error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {router.error}</Text>
            </View>
          )}
          
          {/* Public Routes - Accessible without authentication (full page) */}
          {router.currentRoute === ROUTES.LOGIN && <LoginPage user={user} stopListeners={stopListeners} />}
          {router.currentRoute === ROUTES.LOCK && (
            <LockPage reason={router.lockReason} user={user} stopListeners={stopListeners} />
          )}
          {router.currentRoute === ROUTES.EMAIL_CONFIRMATION && (
            <EmailConfirmationPage 
              email={router.routeParams.email}
              onConfirm={router.routeParams.onConfirm}
              onResend={router.routeParams.onResend}
            />
          )}
          
          {/* Private Routes - Require authentication (with layout) */}
          {router.currentRoute === ROUTES.HOME && user && (
            <>
              {/* Navigation Header */}
              <View style={styles.header}>
                <NavBar />
              </View>
              
              {/* Main Content Area */}
              <View style={styles.mainContent}>
                <HomePage
                  user={user}
                  pageState={pageState || null}
                  onInjectCredential={onInjectCredential || (() => {})}
                />
              </View>
              
              {/* Fixed HelperBar at bottom */}
              <View style={styles.helperBar}>
                <HelperBar category={getCategoryForRoute(router.currentRoute)} />
              </View>
            </>
          )}
          
          {/* Feature Pages - Individual functionality pages with navbar and helperbar */}
          {router.currentRoute === ROUTES.GENERATOR && user && (
            <>
              <View style={styles.header}>
                <NavBar />
              </View>
              <View style={styles.mainContent}>
                <GeneratorPage />
              </View>
              <View style={styles.helperBar}>
                <HelperBar category={getCategoryForRoute(router.currentRoute)} />
              </View>
            </>
          )}
          
          {router.currentRoute === ROUTES.SETTINGS && user && (
            <>
              <View style={styles.header}>
                <NavBar />
              </View>
              <View style={styles.mainContent}>
                <SettingsPage />
              </View>
              <View style={styles.helperBar}>
                <HelperBar category={getCategoryForRoute(router.currentRoute)} />
              </View>
            </>
          )}
          
          {/* Add Item Pages - Multi-step forms with navbar and helperbar */}
          {router.currentRoute === ROUTES.ADD_CREDENTIAL_1 && user && (
            <>
              <View style={styles.header}>
                <NavBar />
              </View>
              <View style={styles.mainContent}>
                <AddCredential1 />
              </View>
              <View style={styles.helperBar}>
                <HelperBar category={getCategoryForRoute(router.currentRoute)} />
              </View>
            </>
          )}
          
          {router.currentRoute === ROUTES.ADD_CREDENTIAL_2 && user && (
            <>
              <View style={styles.header}>
                <NavBar />
              </View>
              <View style={styles.mainContent}>
                <AddCredential2 
                  title={router.routeParams.title || ''} 
                  link={router.routeParams.link} 
                />
              </View>
              <View style={styles.helperBar}>
                <HelperBar category={getCategoryForRoute(router.currentRoute)} />
              </View>
            </>
          )}
          
          {router.currentRoute === ROUTES.ADD_CARD_1 && user && (
            <>
              <View style={styles.header}>
                <NavBar />
              </View>
              <View style={styles.mainContent}>
                <AddCard1 />
              </View>
              <View style={styles.helperBar}>
                <HelperBar category={getCategoryForRoute(router.currentRoute)} />
              </View>
            </>
          )}
          
          {router.currentRoute === ROUTES.ADD_CARD_2 && user && (
            <>
              <View style={styles.header}>
                <NavBar />
              </View>
              <View style={styles.mainContent}>
                <AddCard2 {...router.routeParams} />
              </View>
              <View style={styles.helperBar}>
                <HelperBar category={getCategoryForRoute(router.currentRoute)} />
              </View>
            </>
          )}
          
          {router.currentRoute === ROUTES.ADD_SECURENOTE && user && (
            <>
              <View style={styles.header}>
                <NavBar />
              </View>
              <View style={styles.mainContent}>
                <AddSecureNote />
              </View>
              <View style={styles.helperBar}>
                <HelperBar category={getCategoryForRoute(router.currentRoute)} />
              </View>
            </>
          )}
          
          {/* Detail Pages - View and edit individual items */}
          {router.currentRoute === ROUTES.CREDENTIAL_DETAILS && user && (
            <>
              <View style={styles.header}>
                <NavBar />
              </View>
              <View style={styles.mainContent}>
                <CredentialDetailsPage 
                  credential={router.routeParams.credential}
                  onBack={router.goBack}
                />
              </View>
              <View style={styles.helperBar}>
                <HelperBar category={getCategoryForRoute(router.currentRoute)} />
              </View>
            </>
          )}
          
          {router.currentRoute === ROUTES.BANK_CARD_DETAILS && user && (
            <>
              <View style={styles.header}>
                <NavBar />
              </View>
              <View style={styles.mainContent}>
                <BankCardDetailsPage 
                  card={router.routeParams.card}
                  onBack={router.goBack}
                />
              </View>
              <View style={styles.helperBar}>
                <HelperBar category={getCategoryForRoute(router.currentRoute)} />
              </View>
            </>
          )}
          
          {router.currentRoute === ROUTES.SECURE_NOTE_DETAILS && user && (
            <>
              <View style={styles.header}>
                <NavBar />
              </View>
              <View style={styles.mainContent}>
                <SecureNoteDetailsPage 
                  note={router.routeParams.note}
                  onBack={router.goBack}
                />
              </View>
              <View style={styles.helperBar}>
                <HelperBar category={getCategoryForRoute(router.currentRoute)} />
              </View>
            </>
          )}
          
          {/* Modify Pages - Edit existing items */}
          {router.currentRoute === ROUTES.MODIFY_SECURENOTE && user && (
            <>
              <View style={styles.header}>
                <NavBar />
              </View>
              <View style={styles.mainContent}>
                <ModifySecureNotePage 
                  secureNote={router.routeParams.secureNote}
                  onBack={router.goBack}
                />
              </View>
              <View style={styles.helperBar}>
                <HelperBar category={getCategoryForRoute(router.currentRoute)} />
              </View>
            </>
          )}
          
          {router.currentRoute === ROUTES.MODIFY_CREDENTIAL && user && (
            <>
              <View style={styles.header}>
                <NavBar />
              </View>
              <View style={styles.mainContent}>
                <ModifyCredentialPage 
                  credential={router.routeParams.credential}
                  onBack={router.goBack}
                />
              </View>
              <View style={styles.helperBar}>
                <HelperBar category={getCategoryForRoute(router.currentRoute)} />
              </View>
            </>
          )}
          
          {router.currentRoute === ROUTES.MODIFY_BANK_CARD && user && (
            <>
              <View style={styles.header}>
                <NavBar />
              </View>
              <View style={styles.mainContent}>
                <ModifyBankCardPage 
                  bankCard={router.routeParams.bankCard}
                  onBack={router.goBack}
                />
              </View>
              <View style={styles.helperBar}>
                <HelperBar category={getCategoryForRoute(router.currentRoute)} />
              </View>
            </>
          )}
        </View>
      </ToastProvider>
    </ThemeProvider>
  );
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