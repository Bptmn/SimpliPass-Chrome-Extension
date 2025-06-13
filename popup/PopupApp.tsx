import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { auth } from '../src/firebase';
import Navbar from './components/common/navBar';
import { HelperBar } from './components/common/HelperBar';
import { HomePage } from './components/pages/homePage';
import { GeneratorPage } from './components/pages/generatorPage';
import { SettingsPage } from './components/pages/settingsPage';
import LoginPage from './components/pages/loginPage';

export const PopupApp: React.FC = () => {
  console.log('PopupApp component rendering...');
  
  const [user, setUser] = useState<typeof auth.currentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('PopupApp useEffect running...');
    console.log('Current auth state:', auth.currentUser);
    
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
              <Route path="/home" element={<HomePage user={user} />} />
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