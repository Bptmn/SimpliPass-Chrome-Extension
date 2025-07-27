// PopupApp.tsx
// This file defines the main React application for the Chrome extension popup UI.
// It handles authentication, page state, credential suggestions, and renders the main popup interface.
// Responsibilities:
// - Manage user authentication and listen for auth state changes
// - Query the current tab for page info (domain, url, login form)
// - Route between pages (home, generator, settings, login)
// - Render the main UI (navbar, helper bar, etc.)

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MemoryRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@common/ui/design/theme';
import LoginPage from '@common/ui/pages/LoginPage';
import { HomePage } from '@common/ui/pages/HomePage';
import { SettingsPage } from '@common/ui/pages/SettingsPage';
import { GeneratorPage } from '@common/ui/pages/GeneratorPage';
import { ToastProvider } from '@common/ui/components/Toast';
import NavBar from '@common/ui/components/NavBar';
import { HelperBar } from '@common/ui/components/HelperBar';
import { getColors } from '@common/ui/design/colors';
import AddCard1 from '@common/ui/pages/AddCard1';
import { AddCard2 } from '@common/ui/pages/AddCard2';
import { AddSecureNote } from '@common/ui/pages/AddSecureNote';
import AddCredential1 from '@common/ui/pages/AddCredential1';
import { AddCredential2 } from '@common/ui/pages/AddCredential2';
import { PageState } from '@common/core/types/types';
import { ReEnterPasswordPage } from '@common/ui/pages/ReEnterPasswordPage';
import { useAppInitialization } from '@common/hooks/useAppInitialization';
import { injectCredentialIntoCurrentTab } from '../services/credentialInjection';

// Helper component to track current page and pass it to HelperBar
const AppContent: React.FC<{
  user: any;
  pageState: PageState | null;
  handleInjectCredential: (credentialId: string) => void;
  theme: 'light' | 'dark';
}> = ({ user, pageState, handleInjectCredential, theme }) => {
  const location = useLocation();
  const styles = createStyles(theme);
  
  // Map current path to page type
  const getCurrentPage = (): 'home' | 'generator' | 'settings' | 'add-credential-1' | 'add-credential-2' | 'add-card-1' | 'add-card-2' | 'add-securenote' => {
    const path = location.pathname;
    if (path === '/home' || path === '/') return 'home';
    if (path === '/generator') return 'generator';
    if (path === '/settings') return 'settings';
    if (path === '/add-credential-1') return 'add-credential-1';
    if (path === '/add-credential-2') return 'add-credential-2';
    if (path === '/add-card-1') return 'add-card-1';
    if (path === '/add-card-2') return 'add-card-2';
    if (path === '/add-securenote') return 'add-securenote';
    return 'home'; // default
  };

  return (
    <View style={styles.appLayout}>
      {/* Header - NavBar */}
      <View style={styles.header}>
        <NavBar />
      </View>
      
      {/* Main Content Area */}
      <View style={styles.mainContent}>
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route
              path="/home"
              element={
                <HomePage
                  user={user}
                  pageState={pageState}
                  onInjectCredential={handleInjectCredential}
                />
              }
            />
            <Route path="/generator" element={<GeneratorPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/add-credential-1" element={<AddCredential1 />} />
            <Route path="/add-credential-2" element={<AddCredential2Wrapper />} />
            <Route path="/add-card-1" element={<AddCard1 />} />
            <Route path="/add-card-2" element={<AddCard2 />} />
            <Route path="/add-securenote" element={<AddSecureNote />} />
          </Routes>
        </ScrollView>
      </View>
      
      {/* Footer - HelperBar */}
      <View style={styles.footer}>
        <HelperBar currentPage={getCurrentPage()} />
      </View>
    </View>
  );
};

export const PopupApp: React.FC = () => {
  const [pageState] = useState<PageState | null>(null);
  const [theme] = useState<'light' | 'dark'>('light');

  // Use the centralized app initialization hook
  const {
    user,
    isLoading,
    isUserFullyInitialized,
    error,
    handleSecretKeyStored,
    clearError
  } = useAppInitialization();

  // Handler to inject a credential into the current tab
  const handleInjectCredential = (credentialId: string) => {
    injectCredentialIntoCurrentTab(credentialId);
  };

  // Render loading state
  if (isLoading) {
    console.log('Rendering loading state...');
    const loadingStyles = createStyles(theme);
    return (
      <MemoryRouter>
        <ThemeProvider>
          <View style={loadingStyles.container}>
            <Text>Loading...</Text>
          </View>
        </ThemeProvider>
      </MemoryRouter>
    );
  }

  // Render error state
  if (error) {
    console.log('Rendering error state...');
    const errorStyles = createStyles(theme);
    return (
      <MemoryRouter>
        <ThemeProvider>
          <View style={errorStyles.container}>
            <Text>Error: {error}</Text>
          </View>
        </ThemeProvider>
      </MemoryRouter>
    );
  }

  console.log('Rendering main content...');
  const styles = createStyles(theme);
  return (
    <MemoryRouter>
      <ThemeProvider>
        <ToastProvider>
          <View style={styles.container}>
            {!user ? (
              <Routes>
                <Route path="*" element={<LoginPage />} />
              </Routes>
            ) : !isUserFullyInitialized ? (
              <Routes>
                <Route path="*" element={<ReEnterPasswordPage onSecretKeyStored={handleSecretKeyStored} />} />
              </Routes>
            ) : (
              <AppContent
                user={user}
                pageState={pageState}
                handleInjectCredential={handleInjectCredential}
                theme={theme}
              />
            )}
          </View>
        </ToastProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
};

// Create dynamic styles that respond to theme
const createStyles = (theme: 'light' | 'dark') => {
  const colors = getColors(theme);
  
  return StyleSheet.create({
    appLayout: {
      flex: 1,
      flexDirection: 'column',
      minHeight: 0,
    },
    container: {
      backgroundColor: colors.primaryBackground,
      flex: 1,
      minHeight: 0,
      position: 'relative',
    },
    footer: {
      backgroundColor: colors.primaryBackground,
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
      zIndex: 10,
    },
    header: {
      backgroundColor: colors.primaryBackground,
      borderBottomColor: colors.borderColor,
      borderBottomWidth: 1,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
      zIndex: 10,
    },
    mainContent: {
      backgroundColor: colors.primaryBackground,
      flex: 1,
      marginBottom: 60, // Space for footer
      marginTop: 60, // Space for header
    },
    scrollContent: {
      flexGrow: 1,
      padding: 16,
    },
    scrollView: {
      flex: 1,
    },
  });
};

// Wrapper component for AddCredential2 to pass pageState
const AddCredential2Wrapper = () => {
  return <AddCredential2 title="" />;
};

