import React from 'react';
import { createRoot } from 'react-dom/client';
import { PopupApp } from './PopupApp';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@common/core/logic/theme';

const rootElement = document.getElementById('root');
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