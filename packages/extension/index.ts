// Chrome Extension entry point
import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import './popup/popup.css';

import { PopupApp } from './popup/PopupApp';
import { ErrorBoundary } from '../app/components/ErrorBoundary';
import { UserProvider } from '../app/hooks/useUser';
import { initStorage } from '../app/core/database/localDB';

const initializeApp = () => {
  console.log('Initializing Chrome extension app...');
  const rootElement = document.getElementById('root');
  console.log('Root element:', rootElement);

  if (!rootElement) {
    console.error('Failed to find root element');
    throw new Error('Failed to find the root element');
  }

  try {
    console.log('Creating React root...');
    const root = createRoot(rootElement);

    console.log('Rendering app...');
    root.render(
      React.createElement(React.StrictMode, null,
        React.createElement(ErrorBoundary, null,
          React.createElement(MemoryRouter, null,
            React.createElement(UserProvider, null,
              React.createElement(PopupApp, null)
            )
          )
        )
      )
    );
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Error during React initialization:', error);
    rootElement.innerHTML = `
      <div style="color: red; padding: 20px;">
        <h2>Error Initializing App</h2>
        <pre>${error instanceof Error ? error.message : String(error)}</pre>
      </div>
    `;
  }
};

const startApp = async () => {
  try {
    await initStorage();
    initializeApp();
  } catch (e) {
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `<div style='color: red; padding: 20px;'><h2>Fatal Error Initializing Storage</h2><pre>${e instanceof Error ? e.message : String(e)}</pre></div>`;
    }
    console.error('Failed to initialize storage:', e);
  }
};

if (document.readyState === 'loading') {
  console.log('Document still loading, waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  console.log('Document already loaded, initializing immediately...');
  startApp();
} 