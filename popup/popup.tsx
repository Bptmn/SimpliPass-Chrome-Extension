// Immediate logging
console.log('popup.tsx script starting execution');

import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { PopupApp } from './PopupApp';
import { injectDesignSystem } from '../src/utils/injectDesignSystem';
import './popup.css';
import { ErrorBoundary } from './components/common/ErrorBoundary';

console.log('Imports completed');

// Inject design system variables
injectDesignSystem();

const initializeApp = () => {
  console.log('Initializing app...');
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
      <React.StrictMode>
        <ErrorBoundary>
          <MemoryRouter>
            <PopupApp />
          </MemoryRouter>
        </ErrorBoundary>
      </React.StrictMode>
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

// Immediate execution logging
console.log('Script execution continuing...');

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  console.log('Document still loading, waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  console.log('Document already loaded, initializing immediately...');
  initializeApp();
}

// Final logging
console.log('popup.tsx script execution completed'); 