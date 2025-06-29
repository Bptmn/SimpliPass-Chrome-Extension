// popup.tsx
// This is the entry point for the Chrome extension popup window.
// It finds the root DOM element in popup.html and mounts the main React PopupApp.
// Handles top-level error boundaries and initialization logic.

// Immediate logging
console.log('popup.tsx script starting execution');

import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import './popup.css';

import { PopupApp } from './PopupApp';
import { ErrorBoundary } from './components/ErrorBoundary';
import { UserProvider } from 'hooks/useUser';

console.log('Imports completed');

const initializeApp = () => {
  console.log('Initializing app...');
  // Find the root element in popup.html
  const rootElement = document.getElementById('root');
  console.log('Root element:', rootElement);

  if (!rootElement) {
    console.error('Failed to find root element');
    throw new Error('Failed to find the root element');
  }

  try {
    console.log('Creating React root...');
    // Mount the main React app with error boundary and router
    const root = createRoot(rootElement);

    console.log('Rendering app...');
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <MemoryRouter>
            <UserProvider>
              <PopupApp />
            </UserProvider>
          </MemoryRouter>
        </ErrorBoundary>
      </React.StrictMode>,
    );
    console.log('App rendered successfully');
  } catch (error) {
    // Show error in the popup if initialization fails
    console.error('Error during React initialization:', error);
    rootElement.innerHTML = `
      <div style="color: red; padding: 20px;">
        <h2>Error Initializing App</h2>
        <pre>${error instanceof Error ? error.message : String(error)}</pre>
      </div>
    `;
  }
};

// Immediate execution logging
console.log('Script execution continuing...');

// Wait for DOM to be ready before mounting
if (document.readyState === 'loading') {
  console.log('Document still loading, waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  console.log('Document already loaded, initializing immediately...');
  initializeApp();
}

// Final logging
console.log('popup.tsx script execution completed');
