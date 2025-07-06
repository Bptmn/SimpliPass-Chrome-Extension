import type { Preview } from '@storybook/react';

// Mock Firebase modules for Storybook
if (typeof window !== 'undefined') {
  // Mock Firebase auth
  const mockAuth = {
    currentUser: null,
    onAuthStateChanged: (callback: any) => {
      callback(null);
      return () => {};
    },
    signInWithCustomToken: async () => Promise.resolve(),
    signOut: async () => Promise.resolve(),
  };

  // Mock Firebase firestore
  const mockDb = {
    collection: () => ({
      doc: () => ({
        get: async () => ({ exists: false, data: () => null }),
        set: async () => Promise.resolve(),
        update: async () => Promise.resolve(),
        delete: async () => Promise.resolve(),
      }),
      add: async () => Promise.resolve({ id: 'mock-id' }),
      where: () => ({
        get: async () => ({ docs: [] }),
      }),
    }),
  };

  // Mock Firebase modules globally
  (window as any).__FIREBASE_MOCKS__ = {
    auth: mockAuth,
    db: mockDb,
  };
}

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview; 