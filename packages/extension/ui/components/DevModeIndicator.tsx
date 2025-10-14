/**
 * Dev Mode Indicator
 * 
 * Visual indicator showing whether the app is running in:
 * - Web Mode (development with HMR)
 * - Extension Mode (Chrome Extension context)
 * 
 * Only visible in development builds.
 */

import React from 'react';
import { browser } from '@extension/shims/browserAPI';

export const DevModeIndicator: React.FC = () => {
  const isWebMode = browser.isWebMode();
  const isDev = process.env.NODE_ENV === 'development';

  // Don't show in production
  if (!isDev) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        padding: '4px 8px',
        fontSize: '10px',
        fontWeight: 'bold',
        backgroundColor: isWebMode ? '#10b981' : '#3b82f6',
        color: 'white',
        borderBottomLeftRadius: '4px',
        zIndex: 9999,
        opacity: 0.8,
        pointerEvents: 'none',
        fontFamily: 'monospace',
      }}
    >
      {isWebMode ? '🌐 WEB MODE' : '🔌 EXTENSION MODE'}
    </div>
  );
};
