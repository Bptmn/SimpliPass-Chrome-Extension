// PopupApp.tsx
// This file defines the main React application for the Chrome extension popup UI.
// It handles authentication, page state, credential suggestions, and renders the main popup interface.
// Responsibilities:
// - Manage user authentication and listen for auth state changes
// - Query the current tab for page info (domain, url, login form)
// - Route between pages (home, generator, settings, login)
// - Render the main UI (navbar, helper bar, etc.)

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '@app/screens/HomePage';
import LoginPage from '@app/screens/LoginPage';
import { AddCredentialPage } from '@app/screens/AddCredentialPage';
import SettingsPage from '@app/screens/SettingsPage';
import { GeneratorPage } from '@app/screens/GeneratorPage';
import { ToastProvider } from '@app/components/Toast';
import { colors } from '@design/colors';
import { useUserStore } from '@app/core/states/user';
import { PageState } from '@app/core/types/types';
import { onAuthStateChanged } from 'firebase/auth';
import { auth as firebaseAuth } from '@app/core/auth/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { User as AppUser } from '@app/core/types/types';
import NavBar from '@app/components/NavBar';
import { HelperBar } from '@app/components/HelperBar';
import { fetchUserProfile } from '@app/core/logic/user';
import AddCard1 from '@app/screens/AddCard1';
import AddCard2 from '@app/screens/AddCard2';
import AddSecureNote from '@app/screens/AddSecureNote';

export const PopupApp: React.FC = () => {
  console.log('PopupApp component rendering...');

  // State for loading, error, and page info
  const [isLoading, setIsLoading] = useState(true);
  const [pageState, setPageState] = useState<PageState | null>(null);

  // Use global Zustand user store
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    console.log('PopupApp useEffect running...');

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
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser: FirebaseUser | null) => {
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
    return () => unsubscribe();
  }, [setUser]);

  console.log('Current render state:', { isLoading, user });

  // Handler to inject a credential into the current tab
  const handleInjectCredential = (credentialId: string) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.runtime.sendMessage({
          type: 'INJECT_CREDENTIAL',
          credentialId,
          tabId: tabs[0].id,
        });
      }
    });
  };

  // Render loading state
  if (isLoading) {
    console.log('Rendering loading state...');
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  console.log('Rendering main content...');
  return (
    <ToastProvider>
      <View style={styles.container}>
        {!user ? (
          <Routes>
            <Route path="*" element={<LoginPage />} />
          </Routes>
        ) : (
          <>
            <NavBar />
            <ScrollView style={styles.contentArea} contentContainerStyle={{ flexGrow: 1 }}>
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
                <Route path="/add-credential" element={<AddCredentialPage />} />
                <Route path="/add-card-1" element={<AddCard1 />} />
                <Route path="/add-card-2" element={<AddCard2 />} />
                <Route path="/add-securenote" element={<AddSecureNote />} />
              </Routes>
            </ScrollView>
            <HelperBar />
          </>
        )}
      </View>
    </ToastProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  contentArea: {
    flex: 1,
  },
});
