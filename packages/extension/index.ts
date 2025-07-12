// Chrome Extension entry point
import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import './popup/popup.css';

import { PopupApp } from './popup/PopupApp';
import { ErrorBoundary } from '../app/components/ErrorBoundary';
import { UserProvider } from '../app/core/hooks/useUser';

import { ThemeProvider } from '../app/core/logic/theme';

const initializeApp = () => {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error('Failed to find root element');
    throw new Error('Failed to find the root element');
  }

  try {
    const root = createRoot(rootElement);

    root.render(
      React.createElement(React.StrictMode, null,
        React.createElement(ThemeProvider, null,
          React.createElement(ErrorBoundary, null,
            React.createElement(MemoryRouter, null,
              React.createElement(UserProvider, null,
                React.createElement(PopupApp, null)
              )
            )
          )
        )
      )
    );
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
    initializeApp();
  } catch (e) {
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `<div style='color: red; padding: 20px;'><h2>Fatal Error Initializing App</h2><pre>${e instanceof Error ? e.message : String(e)}</pre></div>`;
    }
    console.error('Failed to initialize app:', e);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
} 