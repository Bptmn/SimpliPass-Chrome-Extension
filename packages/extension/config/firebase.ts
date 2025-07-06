// Safe access to Vite env variables, fallback for Storybook/Node
function getEnv(key: string, fallback: string = ''): string {
  try {
    // Vite: import.meta.env
    if (typeof import.meta !== 'undefined' && import.meta.env && key in import.meta.env) {
      return (import.meta.env as any)[key] || fallback;
    }
    // Webpack/Node: process.env
    if (typeof process !== 'undefined' && process.env && key in process.env) {
      return process.env[key] || fallback;
    }
  } catch {
    // Ignore
  }
  return fallback;
}

const isStorybook =
  typeof window !== 'undefined' &&
  window.location.hostname === 'localhost' &&
  window.location.port === '6006';

const isTestEnvironment = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test';

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY', isStorybook || isTestEnvironment ? 'mock-api-key' : ''),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN', isStorybook || isTestEnvironment ? 'mock-project.firebaseapp.com' : ''),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID', isStorybook || isTestEnvironment ? 'mock-project' : ''),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET', isStorybook || isTestEnvironment ? 'mock-project.appspot.com' : ''),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', isStorybook || isTestEnvironment ? '123456789' : ''),
  appId: getEnv('VITE_FIREBASE_APP_ID', isStorybook || isTestEnvironment ? 'mock-app-id' : ''),
  measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID', isStorybook || isTestEnvironment ? 'mock-measurement-id' : ''),
};

// Log the actual values to check if they're loaded
console.log('Firebase Config Values:', {
  apiKey: firebaseConfig.apiKey ? 'set' : 'not set',
  authDomain: firebaseConfig.authDomain ? 'set' : 'not set',
  projectId: firebaseConfig.projectId ? 'set' : 'not set',
  storageBucket: firebaseConfig.storageBucket ? 'set' : 'not set',
  messagingSenderId: firebaseConfig.messagingSenderId ? 'set' : 'not set',
  appId: firebaseConfig.appId ? 'set' : 'not set',
  measurementId: firebaseConfig.measurementId ? 'set' : 'not set',
  environment: isStorybook ? 'Storybook' : isTestEnvironment ? 'Test' : 'Production',
});

export { firebaseConfig };
