// PopupApp.tsx
// This file defines the main React application for the Chrome extension popup UI.
// It handles authentication, page state, credential suggestions, and renders the main popup interface.
// Responsibilities:
// - Manage user authentication and listen for auth state changes
// - Query the current tab for page info (domain, url, login form)
// - Route between pages (home, generator, settings, login)
// - Render the main UI (navbar, helper bar, etc.)

import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastProvider } from '@common/ui/components/Toast';
import NavBar from '@common/ui/components/NavBar';
import { HelperBar } from '@common/ui/components/HelperBar';
import { HomePage } from '@common/ui/pages/HomePage';
import LoginPage from '@common/ui/pages/LoginPage';
import { GeneratorPage } from '@common/ui/pages/GeneratorPage';
import { SettingsPage } from '@common/ui/pages/SettingsPage';
import AddCard1 from '@common/ui/pages/AddCard1';
import { AddCard2 } from '@common/ui/pages/AddCard2';
import { AddSecureNote } from '@common/ui/pages/AddSecureNote';
import { ModifyCredentialPage } from '@common/ui/pages/ModifyCredentialPage';
import { ModifyBankCardPage } from '@common/ui/pages/ModifyBankCardPage';
import { ModifySecureNotePage } from '@common/ui/pages/ModifySecureNotePage';
import AddCredential1 from '@common/ui/pages/AddCredential1';
import { AddCredential2 } from '@common/ui/pages/AddCredential2';
import { ReEnterPasswordPage } from '@common/ui/pages/ReEnterPasswordPage';
import { ReUnlockPage } from '@common/ui/pages/ReUnlockPage';
import { useAuthStore } from '@common/core/states/auth.state';
import { useUserStore } from '@common/core/states/user';
import { CredentialDecrypted, BankCardDecrypted, SecureNoteDecrypted } from '@common/core/types/items.types';
import { CredentialDetailsPage } from '@common/ui/pages/CredentialDetailsPage';
import { BankCardDetailsPage } from '@common/ui/pages/BankCardDetailsPage';
import { SecureNoteDetailsPage } from '@common/ui/pages/SecureNoteDetailsPage';

export const PopupApp: React.FC = () => {
  console.log('PopupApp component rendering...');

  // State for user, loading, error, and page info
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use global Zustand auth store
  const user = useUserStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [pageState] = useState(null);
  const [selectedCredential] = useState<CredentialDecrypted | null>(null);
  const [selectedBankCard] = useState<BankCardDecrypted | null>(null);
  const [selectedSecureNote] = useState<SecureNoteDecrypted | null>(null);

  const navigate = useNavigate();

  const handleInjectCredential = (_credentialId: string) => {
    // Implement credential injection logic here
  };

  useEffect(() => {
    console.log('PopupApp useEffect running...');

    // On mount, query the current tab for page info (domain, url, login form)
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) {
        setError('Failed to get current tab');
        setIsLoading(false);
        return;
      }
      
      // Send message to background script to get page state
      chrome.runtime.sendMessage(
        { type: 'GET_PAGE_STATE', tabId: tab.id },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('[PopupApp] Runtime error:', chrome.runtime.lastError);
            setError('Failed to get page state');
            setIsLoading(false);
            return;
          }
          if (!response) {
            console.error('[PopupApp] No response from background script');
            setError('Failed to get page state');
            setIsLoading(false);
            return;
          }
          // Page state received successfully, can be used later if needed
          console.log('[PopupApp] Page state received:', response);
          if (response.error) {
            console.log('[PopupApp] Page state has error:', response.error);
          }
          setIsLoading(false);
        }
      );
    });
  }, []);

  console.log('Current render state:', { isLoading, error, user, isAuthenticated });

  // Mock data for modify pages (not used)
  // const mockCredential: CredentialDecrypted = {
  //   id: 'mock-cred-1',
  //   itemType: 'credential',
  //   createdDateTime: new Date(),
  //   lastUseDateTime: new Date(),
  //   title: 'Mock Credential',
  //   username: 'mock@example.com',
  //   password: 'mockpassword',
  //   url: 'https://example.com',
  //   note: 'Mock credential for testing',
  //   itemKey: 'mock-key',
  // };
  
  // const mockBankCard: BankCardDecrypted = {
  //   id: 'mock-card-1',
  //   itemType: 'bankCard',
  //   createdDateTime: new Date(),
  //   lastUseDateTime: new Date(),
  //   title: 'Mock Bank Card',
  //   owner: 'Mock Owner',
  //   cardNumber: '4111111111111111',
  //   expirationDate: { month: 12, year: 2025 },
  //   verificationNumber: '123',
  //   bankName: 'Mock Bank',
  //   bankDomain: 'mockbank.com',
  //   note: 'Mock bank card for testing',
  //   color: '#007AFF',
  //   itemKey: 'mock-key',
  // };
  
  // const mockSecureNote: SecureNoteDecrypted = {
  //   id: 'mock-note-1',
  //   itemType: 'secureNote',
  //   createdDateTime: new Date(),
  //   lastUseDateTime: new Date(),
  //   title: 'Mock Secure Note',
  //   note: 'Mock secure note content for testing',
  //   color: '#007AFF',
  //   itemKey: 'mock-key',
  // };

  // Render error state if any
  if (error) {
    console.log('Rendering error state...');
    return (
      <div className="container">
        {error && <div className="error-message">{error}</div>}
      </div>
    );
  }

  // Render loading state
  if (isLoading) {
    console.log('Rendering loading state...');
    return (
      <div className="container">
        {isLoading && <div className="loading" />}
      </div>
    );
  }

  console.log('Rendering main content...');
  return (
    <ToastProvider>
      <div className="container">
        {isAuthenticated && <NavBar />}
        <div id="content">
          <Routes>
            {!isAuthenticated ? (
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
                      onInjectCredential={handleInjectCredential}
                    />
                  }
                />
                <Route path="/generator" element={<GeneratorPage onBack={() => navigate(-1)} />} />
                <Route path="/settings" element={<SettingsPage onLogout={() => navigate(-1)} />} />
                <Route path="/add-credential-1" element={<AddCredential1 />} />
                <Route path="/add-credential-2" element={<AddCredential2 title="" onBack={() => navigate(-1)} />} />
                <Route path="/add-card-1" element={<AddCard1 />} />
                <Route path="/add-card-2" element={<AddCard2 onBack={() => navigate(-1)} />} />
                <Route path="/add-securenote" element={<AddSecureNote onCancel={() => navigate(-1)} />} />
                <Route
                  path="/credential/:id"
                  element={selectedCredential && <CredentialDetailsPage credential={selectedCredential} onBack={() => navigate(-1)} />}
                />
                <Route
                  path="/bank-card/:id"
                  element={selectedBankCard && <BankCardDetailsPage card={selectedBankCard} onBack={() => navigate(-1)} />}
                />
                <Route
                  path="/secure-note/:id"
                  element={selectedSecureNote && <SecureNoteDetailsPage note={selectedSecureNote} onBack={() => navigate(-1)} />}
                />
                <Route
                  path="/modify-credential"
                  element={selectedCredential && <ModifyCredentialPage credential={selectedCredential} onBack={() => navigate(-1)} />}
                />
                <Route
                  path="/modify-bank-card"
                  element={selectedBankCard && <ModifyBankCardPage bankCard={selectedBankCard} onBack={() => navigate(-1)} />}
                />
                <Route
                  path="/modify-secure-note"
                  element={selectedSecureNote && <ModifySecureNotePage secureNote={selectedSecureNote} onBack={() => navigate(-1)} />}
                />
                <Route path="/re-enter-password" element={<ReEnterPasswordPage />} />
                <Route path="/re-unlock" element={<ReUnlockPage />} />
              </>
            )}
          </Routes>
        </div>
        {isAuthenticated && <HelperBar />}
      </div>
    </ToastProvider>
  );
};

