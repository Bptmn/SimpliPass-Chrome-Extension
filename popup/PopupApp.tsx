import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { auth } from '../src/firebase';
import Navbar from './components/common/navBar';
import { HelperBar } from './components/common/HelperBar';
import { HomePage } from './components/pages/homePage';
import { GeneratorPage } from './components/pages/generatorPage';
import SettingsPage from './components/pages/settingsPage';
import LoginPage from './components/pages/loginPage';
import { PageState, CredentialMeta } from '../src/types';
import { Amplify } from 'aws-amplify';
import { config } from '../config/config';

Amplify.configure({ Auth: { Cognito: config.Cognito } });

export const PopupApp: React.FC = () => {
  console.log('PopupApp component rendering...');
  
  const [user, setUser] = useState<typeof auth.currentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageState, setPageState] = useState<PageState | null>(null);
  const [suggestions, setSuggestions] = useState<CredentialMeta[]>([]);

  useEffect(() => {
    console.log('PopupApp useEffect running...');
    
    // Always get the current tab's domain/url live
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
        }
      );
    });

    // Set up auth listener
    try {
      console.log('Setting up auth state listener...');
      const unsubscribe = auth.onAuthStateChanged((u) => {
        console.log('Auth state changed:', u);
        setUser(u);
        setIsLoading(false);
      }, (error) => {
        console.error('Auth state change error:', error);
        setError(error.message);
        setIsLoading(false);
      });

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

  const handleInjectCredential = (credentialId: string) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.runtime.sendMessage({
          type: 'INJECT_CREDENTIAL',
          credentialId,
          tabId: tabs[0].id
        });
      }
    });
  };

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
            </>
          )}
        </Routes>
      </div>
      {user && <HelperBar />}
    </div>
  );
}; 