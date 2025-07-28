/**
 * AppRouterView.tsx - Main Router View Component with Authentication Guards
 * 
 * This component handles the rendering of different pages based on the current route.
 * It implements authentication guards to protect private routes and automatically
 * redirects unauthenticated users to the login page. It also manages the overall
 * app layout including navigation, loading states, and error handling.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ThemeProvider } from '@common/ui/design/theme';
import LoginPage from '@common/ui/pages/LoginPage';
import { HomePage } from '@common/ui/pages/HomePage';
import { SettingsPage } from '@common/ui/pages/SettingsPage';
import { GeneratorPage } from '@common/ui/pages/GeneratorPage';
import { ToastProvider } from '@common/ui/components/Toast';
import NavBar from '@common/ui/components/NavBar';
import { getColors } from '@common/ui/design/colors';
import { layout } from '@common/ui/design/layout';
import AddCard1 from '@common/ui/pages/AddCard1';
import { AddCard2 } from '@common/ui/pages/AddCard2';
import { AddSecureNote } from '@common/ui/pages/AddSecureNote';
import AddCredential1 from '@common/ui/pages/AddCredential1';
import { AddCredential2 } from '@common/ui/pages/AddCredential2';
import { LockPage } from '@common/ui/pages/LockPage';
import { CredentialDetailsPage } from '@common/ui/pages/CredentialDetailsPage';
import { BankCardDetailsPage } from '@common/ui/pages/BankCardDetailsPage';
import { SecureNoteDetailsPage } from '@common/ui/pages/SecureNoteDetailsPage';
import { ModifyBankCardPage } from '@common/ui/pages/ModifyBankCardPage';
import { ModifyCredentialPage } from '@common/ui/pages/ModifyCredentialPage';
import { ModifySecureNotePage } from '@common/ui/pages/ModifySecureNotePage';
import { EmailConfirmationPage } from '@common/ui/pages/EmailConfirmationPage';
import type { User } from '@common/core/types/auth.types';
import type { PageState } from '@common/core/types/types';
import { ROUTES, isPublicRoute } from './ROUTES';
import { useAppRouterContext } from './AppRouterProvider';

// Props for the AppRouterView component
interface AppRouterViewProps {
  user: User | null;
  pageState?: PageState | null;
  onInjectCredential?: (credentialId: string) => void;
  theme?: 'light' | 'dark';
}

/**
 * AppRouterView - Main router view with authentication guards and page rendering
 * 
 * This component is the core of the application's routing system. It:
 * 1. Checks authentication status and protects private routes
 * 2. Renders the appropriate page based on current route
 * 3. Handles loading and error states
 * 4. Manages the overall app layout and navigation
 * 
 * Authentication Flow:
 * - If user is not authenticated and trying to access a private route → redirect to login
 * - If user is authenticated → render the requested page
 * - If user is partially authenticated (lock screen) → render lock page
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

  /**
   * Authentication Guard: Redirect to login if accessing private route without authentication
   * This ensures that unauthenticated users can only access public routes
   */
  if (!isPublicRoute(router.currentRoute) && !user) {
    return (
      <ThemeProvider>
        <ToastProvider>
          <View style={styles.container}>
            <LoginPage />
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
            <View style={styles.container}>
              <Text>Loading...</Text>
            </View>
          )}
          
          {/* Error State - Shows when there's a critical error */}
          {router.error && (
            <View style={styles.container}>
              <Text>Error: {router.error}</Text>
            </View>
          )}
          
          {/* Public Routes - Accessible without authentication */}
          {router.currentRoute === ROUTES.LOGIN && <LoginPage />}
          {router.currentRoute === ROUTES.LOCK && (
            <LockPage 
              reason={router.lockReason} 
            />
          )}
          
          {/* Private Routes - Require authentication */}
          {router.currentRoute === ROUTES.HOME && user && (
            <>
              {/* Navigation Header */}
              <View style={styles.header}>
                <NavBar router={router} />
              </View>
              
              {/* Main Content Area */}
              <View style={styles.mainContent}>
                <ScrollView 
                  style={styles.scrollView} 
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <HomePage
                    user={user}
                    pageState={pageState || null}
                    onInjectCredential={onInjectCredential || (() => {})}
                    router={router}
                  />
                </ScrollView>
              </View>
            </>
          )}
          
          {/* Feature Pages - Individual functionality pages with navbar */}
          {router.currentRoute === ROUTES.GENERATOR && user && (
            <>
              {/* Navigation Header */}
              <View style={styles.header}>
                <NavBar router={router} />
              </View>
              
              {/* Main Content Area */}
              <View style={styles.mainContent}>
                <ScrollView 
                  style={styles.scrollView} 
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <GeneratorPage />
                </ScrollView>
              </View>
            </>
          )}
          
          {router.currentRoute === ROUTES.SETTINGS && user && (
            <>
              {/* Navigation Header */}
              <View style={styles.header}>
                <NavBar router={router} />
              </View>
              
              {/* Main Content Area */}
              <View style={styles.mainContent}>
                <ScrollView 
                  style={styles.scrollView} 
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <SettingsPage />
                </ScrollView>
              </View>
            </>
          )}
          
          {/* Add Item Pages - Multi-step forms for creating new items */}
          {router.currentRoute === ROUTES.ADD_CREDENTIAL_1 && user && (
            <>
              <View style={styles.header}>
                <NavBar router={router} />
              </View>
              <View style={styles.mainContent}>
                <ScrollView 
                  style={styles.scrollView} 
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <AddCredential1 router={router} />
                </ScrollView>
              </View>
            </>
          )}
          {router.currentRoute === ROUTES.ADD_CREDENTIAL_2 && user && (
            <>
              <View style={styles.header}>
                <NavBar router={router} />
              </View>
              <View style={styles.mainContent}>
                <ScrollView 
                  style={styles.scrollView} 
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <AddCredential2 
                    title={router.routeParams.title || ''} 
                    link={router.routeParams.link} 
                    router={router}
                  />
                </ScrollView>
              </View>
            </>
          )}
          {router.currentRoute === ROUTES.ADD_CARD_1 && user && (
            <>
              <View style={styles.header}>
                <NavBar router={router} />
              </View>
              <View style={styles.mainContent}>
                <ScrollView 
                  style={styles.scrollView} 
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <AddCard1 router={router} />
                </ScrollView>
              </View>
            </>
          )}
          {router.currentRoute === ROUTES.ADD_CARD_2 && user && (
            <>
              <View style={styles.header}>
                <NavBar router={router} />
              </View>
              <View style={styles.mainContent}>
                <ScrollView 
                  style={styles.scrollView} 
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <AddCard2 {...router.routeParams} router={router} />
                </ScrollView>
              </View>
            </>
          )}
          {router.currentRoute === ROUTES.ADD_SECURENOTE && user && (
            <>
              <View style={styles.header}>
                <NavBar router={router} />
              </View>
              <View style={styles.mainContent}>
                <ScrollView 
                  style={styles.scrollView} 
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <AddSecureNote router={router} />
                </ScrollView>
              </View>
            </>
          )}
          
          {/* Detail Pages - Viewing specific items */}
          {router.currentRoute === ROUTES.CREDENTIAL_DETAILS && user && (
            <>
              <View style={styles.header}>
                <NavBar router={router} />
              </View>
              <View style={styles.mainContent}>
                <ScrollView 
                  style={styles.scrollView} 
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <CredentialDetailsPage 
                    credential={router.routeParams.credential}
                    onBack={router.goBack}
                    router={router}
                  />
                </ScrollView>
              </View>
            </>
          )}
          {router.currentRoute === ROUTES.BANK_CARD_DETAILS && user && (
            <>
              <View style={styles.header}>
                <NavBar router={router} />
              </View>
              <View style={styles.mainContent}>
                <ScrollView 
                  style={styles.scrollView} 
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <BankCardDetailsPage 
                    card={router.routeParams.card}
                    onBack={router.goBack}
                    router={router}
                  />
                </ScrollView>
              </View>
            </>
          )}
          {router.currentRoute === ROUTES.SECURE_NOTE_DETAILS && user && (
            <>
              <View style={styles.header}>
                <NavBar router={router} />
              </View>
              <View style={styles.mainContent}>
                <ScrollView 
                  style={styles.scrollView} 
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <SecureNoteDetailsPage 
                    note={router.routeParams.note}
                    onBack={router.goBack}
                    router={router}
                  />
                </ScrollView>
              </View>
            </>
          )}
          
          {/* Modify Pages - Editing existing items */}
          {router.currentRoute === ROUTES.MODIFY_BANK_CARD && user && (
            <>
              <View style={styles.header}>
                <NavBar router={router} />
              </View>
              <View style={styles.mainContent}>
                <ScrollView 
                  style={styles.scrollView} 
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >

                  <ModifyBankCardPage 
                    bankCard={router.routeParams.bankCard}
                    onBack={router.goBack}
                  />
                </ScrollView>
              </View>
            </>
          )}
          {router.currentRoute === ROUTES.MODIFY_CREDENTIAL && user && (
            <>
              <View style={styles.header}>
                <NavBar router={router} />
              </View>
              <View style={styles.mainContent}>
                <ScrollView 
                  style={styles.scrollView} 
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >

                  <ModifyCredentialPage 
                    credential={router.routeParams.credential}
                    onBack={router.goBack}
                  />
                </ScrollView>
              </View>
            </>
          )}
          {router.currentRoute === ROUTES.MODIFY_SECURENOTE && user && (
            <>
              <View style={styles.header}>
                <NavBar router={router} />
              </View>
              <View style={styles.mainContent}>
                <ScrollView 
                  style={styles.scrollView} 
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >

                  <ModifySecureNotePage 
                    secureNote={router.routeParams.secureNote}
                    onBack={router.goBack}
                  />
                </ScrollView>
              </View>
            </>
          )}
          
          {/* Utility Pages - Special purpose pages */}
          {router.currentRoute === ROUTES.EMAIL_CONFIRMATION && (
            <EmailConfirmationPage 
              email={router.routeParams.email}
              onConfirm={router.routeParams.onConfirm}
              onResend={router.routeParams.onResend}
            />
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
    scrollContent: {
      flexGrow: 1,
    },
    scrollView: {
      flex: 1,
    },
  });
}; 