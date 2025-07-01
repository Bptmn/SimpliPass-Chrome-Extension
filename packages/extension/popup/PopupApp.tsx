// PopupApp.tsx
// This file defines the main React application for the Chrome extension popup UI.
// It handles authentication, page state, credential suggestions, and renders the main popup interface.
// Responsibilities:
// - Manage user authentication and listen for auth state changes
// - Query the current tab for page info (domain, url, login form)
// - Route between pages (home, generator, settings, login)
// - Render the main UI (navbar, helper bar, etc.)

import { Amplify } from 'aws-amplify';
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Text } from 'react-native';

// Import components and screens from the shared app package
import { HelperBar } from '@components/HelperBar';
import Navbar from '@components/NavBar';
import { GeneratorPage } from '@screens/GeneratorPage';
import { HomePage } from '@screens/HomePage';
import LoginPage from '@screens/LoginPage';
import SettingsPage from '@screens/SettingsPage';
import { AddCredentialPage } from '@screens/AddCredentialPage';
import PopupLayout from '@components/PopupLayout';

// Import config and services
import { config } from '@extension/config/config';
import { auth } from '@app/core/auth/auth.adapter';
import { PageState } from '@app/core/types/types';
import { ToastProvider } from '@components/Toast';

Amplify.configure({ Auth: { Cognito: config.Cognito } });

export const PopupApp: React.FC = () => {
  console.log('PopupApp component rendering...');

  // State for user, loading, error, and page info
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageState, setPageState] = useState<PageState | null>(null);

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
          // Optionally: fetch credentials here if needed
        },
      );
    });

    // Check authentication state
    const checkAuthState = async () => {
      try {
        console.log('Checking auth state...');
        const currentUser = await auth.getCurrentUser();
        console.log('Auth state checked:', currentUser);
        setUser(currentUser);
        setIsLoading(false);
      } catch (err) {
        console.error('Auth check error:', err);
        setError(err instanceof Error ? err.message : 'Failed to check authentication');
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, []);

  console.log('Current render state:', { isLoading, error, user });

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

  // Render error state if any
  if (error) {
    console.log('Rendering error state...');
    return (
      <div className="container">
        <div className="error-message">
          <h2><Text>Error</Text></h2>
          <p><Text>{error}</Text></p>
        </div>
      </div>
    );
  }

  // Render loading state
  if (isLoading) {
    console.log('Rendering loading state...');
    return (
      <div className="container">
        <div className="loading">
          <Text>Loading...</Text>
        </div>
      </div>
    );
  }

  console.log('Rendering main content...');
  return (
    <ToastProvider>
      <div className="container">
        {!user ? (
          <Routes>
            <Route path="*" element={<LoginPage />} />
          </Routes>
        ) : (
          <PopupLayout>
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
            </Routes>
          </PopupLayout>
        )}
      </div>
    </ToastProvider>
  );
};
