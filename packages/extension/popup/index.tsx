import React from 'react';
import { createRoot } from 'react-dom/client';
import { PopupApp } from './PopupApp';
import { initializeStorage } from '@common/core/adapters';

// Initialize storage before rendering
initializeStorage();

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<PopupApp />);
} 