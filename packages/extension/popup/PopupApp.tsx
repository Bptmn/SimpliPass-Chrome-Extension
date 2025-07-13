// PopupApp.tsx
// This file defines the main React application for the Chrome extension popup UI.
// It handles authentication, page state, credential suggestions, and renders the main popup interface.
// Responsibilities:
// - Manage user authentication and listen for auth state changes
// - Query the current tab for page info (domain, url, login form)
// - Route between pages (home, generator, settings, login)
// - Render the main UI (navbar, helper bar, etc.)

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastProvider } from '@app/components/Toast';
import NavBar from '@app/components/NavBar';
import { HelperBar } from '@app/components/HelperBar';
import { useUserStore } from '@app/core/states/user';
import { initFirebase } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { fetchUserProfile } from '@app/core/logic/auth';
import { PageState } from '@app/core/types/types';
import { User as FirebaseUser } from 'firebase/auth';
import { User as AppUser } from '@app/core/types/types';
import { HomePage } from '@app/screens/HomePage';
import LoginPage from '@app/screens/LoginPage';
import { GeneratorPage } from '@app/screens/GeneratorPage';
import SettingsPage from '@app/screens/SettingsPage';
import AddCard1 from '@app/screens/AddCard1';
import AddCard2 from '@app/screens/AddCard2';
import AddSecureNote from '@app/screens/AddSecureNote';
import { ModifyCredentialPage } from '@app/screens/ModifyCredentialPage';
import { ModifyBankCardPage } from '@app/screens/ModifyBankCardPage';
import { ModifySecureNotePage } from '@app/screens/ModifySecureNotePage';
import AddCredential1 from '@app/screens/AddCredential1';
import AddCredential2 from '@app/screens/AddCredential2';
import { ReEnterPasswordPage } from '@app/screens/ReEnterPasswordPage';
import { ReUnlockPage } from '@app/screens/ReUnlockPage';
import { loadVaultIfNeeded } from '@extension/utils/vaultLoader';
import { colors } from '@app/design/colors';

const HELPERBAR_HEIGHT = 56;

export const PopupApp: React.FC = () => {
  // State for loading, error, and page info
  const [isLoading, setIsLoading] = useState(true);
  const [pageState, setPageState] = useState<PageState | null>(null);

  // Use global Zustand user store
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    // On mount, query the current tab for page info (domain, url, login form)
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) return;
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: () => ({
            url: window.location.href,
            domain: window.location.hostname,
            hasLoginForm: !!document.querySelector('form input[type="password"]'),
          }),
        },
        (results) => {
          if (chrome.runtime.lastError || !results || !results[0]?.result) return;
          const { url, domain, hasLoginForm } = results[0].result;
          setPageState({ url, domain, hasLoginForm });
        },
      );
    });

    // Listen for Firebase Auth state changes (robust persistence)
    setIsLoading(true);
    let unsubscribe: (() => void) | undefined;
    (async () => {
      const { auth: firebaseAuth } = await initFirebase();
      unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          // Fetch full user profile from Firestore
          const firestoreUser = await fetchUserProfile(firebaseUser.uid);
          if (firestoreUser) {
            setUser(firestoreUser);
          } else {
            // Fallback to Auth user if Firestore user is missing
            const mappedUser: AppUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              created_time: new Date() as any,
              salt: '',
            };
            setUser(mappedUser);
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      });
    })();

    // Load vault on mount
    loadVaultIfNeeded().then(() => {
      console.log('[Popup] Vault load attempt completed');
    }).catch(() => {
      console.log('[Popup] No vault available, user must login');
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [setUser]);

  // Handler to inject a credential into the current tab
  const handleInjectCredential = async (credentialId: string) => {
    try {
      // Check if vault is loaded before attempting injection
      const sessionResponse = await new Promise<{ isValid: boolean }>((resolve) => {
        chrome.runtime.sendMessage({ 
          type: 'GET_SESSION_STATUS'
        }, resolve);
      });

      if (!sessionResponse || !sessionResponse.isValid) {
        console.log('[Popup] No valid vault loaded, cannot inject credential');
        return;
      }

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.runtime.sendMessage({
            type: 'INJECT_CREDENTIAL',
            credentialId,
            tabId: tabs[0].id,
          });
        }
      });
    } catch (error) {
      console.error('[Popup] Error injecting credential:', error);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ToastProvider>
      <View style={styles.container}>
        {!user ? (
          <Routes>
            <Route path="*" element={<LoginPage />} />
          </Routes>
        ) : (
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
                  <Route path="/modify-credential" element={<ModifyCredentialPage />} />
                  <Route path="/modify-bank-card" element={<ModifyBankCardPage />} />
                  <Route path="/modify-secure-note" element={<ModifySecureNotePage />} />
                  <Route path="/re-enter-password" element={<ReEnterPasswordPage />} />
                  <Route path="/re-unlock" element={<ReUnlockPage />} />
                </Routes>
              </ScrollView>
            </View>
            
            {/* Footer - HelperBar */}
            <View style={styles.footer}>
              <HelperBar />
            </View>
          </View>
        )}
      </View>
    </ToastProvider>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: colors.primaryBackground, // fallback for transparency
    bottom: 0,
    height: HELPERBAR_HEIGHT,
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 10,
  },
  header: {
    flexShrink: 0,
  },
  mainContent: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: HELPERBAR_HEIGHT, // ensure content is never hidden
  },
  scrollView: {
    flex: 1,
    minHeight: 0,
  },
});

// AddCredential2Wrapper to extract title from location.state
const AddCredential2Wrapper = () => {
  const location = useLocation();
  const title = location.state?.title || '';
  return <AddCredential2 title={title} />;
};
