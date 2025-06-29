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

import { HelperBar } from './components/HelperBar';
import Navbar from './components/NavBar';
import { GeneratorPage } from './pages/GeneratorPage';
import { HomePage } from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import { AddCredentialPage } from './pages/AddCredentialPage';
import { config } from 'config/config';
import { auth } from 'services/firebase';
import { PageState, CredentialMeta } from 'types/types';
import { ToastProvider } from './components/Toast';

Amplify.configure({ Auth: { Cognito: config.Cognito } });

export const PopupApp: React.FC = () => {
  console.log('PopupApp component rendering...');

  // State for user, loading, error, page info, and credential suggestions
  const [user, setUser] = useState<typeof auth.currentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageState, setPageState] = useState<PageState | null>(null);
  const [suggestions, setSuggestions] = useState<CredentialMeta[]>([]);

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

    // Listen for authentication state changes
    try {
      console.log('Setting up auth state listener...');
      const unsubscribe = auth.onAuthStateChanged(
        (u) => {
          console.log('Auth state changed:', u);
          setUser(u);
          setIsLoading(false);
        },
        (error) => {
          console.error('Auth state change error:', error);
          setError(error.message);
          setIsLoading(false);
        },
      );

      return () => {
        console.log('Cleaning up auth state listener...');
        unsubscribe();
      };
    } catch (err) {
      console.error('Firebase initialization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize Firebase');
      setIsLoading(false);
    }
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
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Render loading state
  if (isLoading) {
    console.log('Rendering loading state...');
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  console.log('Rendering main content...');
  return (
    <ToastProvider>
      <div className="container">
        {user && <Navbar />}
        <div id="content">
          <Routes>
            {!user ? (
              <Route path="*" element={<LoginPage />} />
            ) : (
              <>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route
                  path="/home"
                  element={
                    <HomePage
                      user={user}
                      pageState={pageState}
                      suggestions={suggestions}
                      onInjectCredential={handleInjectCredential}
                    />
                  }
                />
                <Route path="/generator" element={<GeneratorPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/add-credential" element={<AddCredentialPage />} />
              </>
            )}
          </Routes>
        </div>
        {user && <HelperBar />}
      </div>
    </ToastProvider>
  );
};
