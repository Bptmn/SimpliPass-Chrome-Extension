import React from 'react';
import { createRoot } from 'react-dom/client';
import { PopupApp } from './PopupApp';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@common/core/logic/theme';
import { initializePlatform } from '@common/core/platform';

const rootElement = document.getElementById('root');

async function startApp() {
  await initializePlatform();
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
      <MemoryRouter>
        <ThemeProvider>
          <PopupApp />
        </ThemeProvider>
      </MemoryRouter>
    );
  }
}

startApp(); 