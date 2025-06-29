import '../src/styles/tokens.css';
import React from 'react';
import { ToastProvider } from '../src/popup/components/Toast';
import '../src/styles/common.css';

export const decorators = [
  (Story: React.FC) => (
    <div
      style={{
        width: 350,
        height: 550,
        minWidth: 350,
        minHeight: 550,
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        background: 'var(--primary-background)',
        boxSizing: 'border-box',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
      }}
    >
      <ToastProvider>
        <Story />
      </ToastProvider>
    </div>
  ),
]; 