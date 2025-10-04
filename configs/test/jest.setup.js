// jest.setup.js
const { exec } = require('child_process');
const waitOn = require('wait-on');
const { TextEncoder, TextDecoder } = require('util');

// Add TextEncoder and TextDecoder polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock crypto for Node.js environment
const { webcrypto } = require('crypto');
Object.defineProperty(globalThis, 'crypto', {
  value: webcrypto,
});

// Mock import.meta.env for Vite environment variables
// Using actual environment variables from .env file
const mockEnv = {
  // Vite environment variables (for extension)
  VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY || 'test-api-key',
  VITE_FIREBASE_AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'test-project.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID || 'test-project',
  VITE_FIREBASE_STORAGE_BUCKET: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'test-project.appspot.com',
  VITE_FIREBASE_MESSAGING_SENDER_ID: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  VITE_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID || 'test-app-id',
  VITE_FIREBASE_MEASUREMENT_ID: process.env.VITE_FIREBASE_MEASUREMENT_ID || 'test-measurement-id',
  VITE_COGNITO_USER_POOL_ID: process.env.VITE_COGNITO_USER_POOL_ID || 'test-user-pool-id',
  VITE_COGNITO_CLIENT_ID: process.env.VITE_COGNITO_CLIENT_ID || 'test-client-id',
  VITE_COGNITO_REGION: process.env.VITE_COGNITO_REGION || 'us-east-1',
};

// Mock import.meta.env globally
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: mockEnv
    }
  },
  writable: true
});

// Also mock it on globalThis for better compatibility
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: mockEnv
    }
  },
  writable: true
});

// Mock Chrome API for extension tests
const mockChrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    sendMessage: jest.fn(),
    onStartup: {
      addListener: jest.fn()
    },
    onInstalled: {
      addListener: jest.fn()
    }
  },
  tabs: {
    onUpdated: {
      addListener: jest.fn()
    },
    query: jest.fn(),
    sendMessage: jest.fn()
  },
  contextMenus: {
    create: jest.fn(),
    update: jest.fn(),
    removeAll: jest.fn(),
    onClicked: {
      addListener: jest.fn()
    }
  },
  storage: {
    session: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn()
    }
  }
};

// Mock Chrome API globally
Object.defineProperty(global, 'chrome', {
  value: mockChrome,
  writable: true
});

// Ensure setTimeout and clearTimeout are properly available
// Jest should provide these, but we ensure they're correctly bound
if (typeof global.setTimeout === 'undefined') {
  global.setTimeout = setTimeout;
}
if (typeof global.clearTimeout === 'undefined') {
  global.clearTimeout = clearTimeout;
}

module.exports = async () => {
  console.log('Starting Firestore emulator in global setup...');
  global.emulator = exec('npm run emulator');
  try {
    await waitOn({ resources: ['tcp:localhost:8080'], timeout: 30000 });
    console.log('Firestore emulator started.');
  } catch (err) {
    console.error('Firestore emulator failed to start:', err);
    process.exit(1);
  }
};


