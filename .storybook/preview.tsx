import React from 'react';
import { ToastProvider } from '../packages/app/components/Toast';
import { ThemeProvider } from '../packages/app/core/logic/theme';
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
};

export const decorators = [
  (Story) => (
    <ThemeProvider>
      <ToastProvider>
        <Story />
      </ToastProvider>
    </ThemeProvider>
  ),
];

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
};

export default preview; 