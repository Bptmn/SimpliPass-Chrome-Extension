// Node/Jest-only Firebase config
function getEnv(key: string, fallback: string = ''): string {
  if (typeof process !== 'undefined' && process.env && key in process.env) {
    return process.env[key] || fallback;
  }
  return fallback;
}

const isTestEnvironment = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test';

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY', isTestEnvironment ? 'mock-api-key' : ''),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN', isTestEnvironment ? 'mock-project.firebaseapp.com' : ''),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID', isTestEnvironment ? 'mock-project' : ''),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET', isTestEnvironment ? 'mock-project.appspot.com' : ''),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', isTestEnvironment ? '123456789' : ''),
  appId: getEnv('VITE_FIREBASE_APP_ID', isTestEnvironment ? 'mock-app-id' : ''),
  measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID', isTestEnvironment ? 'mock-measurement-id' : ''),
};

export { firebaseConfig }; 