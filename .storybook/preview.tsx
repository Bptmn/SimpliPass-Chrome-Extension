import React from 'react';
import { ToastProvider } from '../packages/app/components/Toast';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  backgrounds: {
    default: 'light',
    values: [
      {
        name: 'light',
        value: '#ffffff',
      },
      {
        name: 'dark',
        value: '#333333',
      },
    ],
  },
};

// Global decorator to wrap stories in ToastProvider only
export const decorators = [
  (Story) => (
    <ToastProvider>
      <div style={{ padding: 20, backgroundColor: '#ffffff' }}>
        <Story />
      </div>
    </ToastProvider>
  ),
]; 