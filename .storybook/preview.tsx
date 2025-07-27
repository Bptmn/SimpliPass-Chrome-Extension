import React from 'react';
import { ToastProvider } from '@common/ui/components/Toast';
import { ThemeProvider } from '@common/ui/design/theme';
import type { Preview } from "@storybook/react";
import { INITIAL_VIEWPORTS } from "@storybook/addon-viewport";
import './storybook.css';

const customViewports = {
  chromeExtensionPopup: {
    name: 'Chrome Extension Popup',
    styles: {
      width: '350px',
      height: '550px',
    },
    type: 'mobile',
  },
  // Add more custom viewports if needed
  mobile: {
    name: 'Mobile',
    styles: {
      width: '375px',
      height: '667px',
    },
    type: 'mobile',
  },
  tablet: {
    name: 'Tablet',
    styles: {
      width: '768px',
      height: '1024px',
    },
    type: 'tablet',
  },
};



const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#333333' },
      ],
    },
    viewport: {
      viewports: {
        ...INITIAL_VIEWPORTS,
        ...customViewports,
      },
      defaultViewport: 'chromeExtensionPopup',
      // Ensure the custom viewport is always the default
      disable: false,
    },
    // Enable CSS inspection tools
    measure: {
      enabled: true,
    },
    // Enable outline mode for better element inspection
    outline: {
      enabled: true,
    },
    // Enable grid overlay for layout inspection
    grid: {
      enabled: true,
    },
  },
  // Global decorators to ensure consistent viewport behavior
  decorators: [
    (Story) => (
      <ThemeProvider>
        <ToastProvider>
          <div style={{ 
            width: '350px', 
            height: '550px', 
            margin: '0 auto',
            border: '1px solid #ccc',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <Story />
          </div>
        </ToastProvider>
      </ThemeProvider>
    ),
  ],
};

export default preview; 