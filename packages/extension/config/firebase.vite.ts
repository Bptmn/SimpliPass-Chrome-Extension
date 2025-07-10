// Vite/browser-only Firebase config
function getEnv(key: string, fallback: string = ''): string {
  if (typeof import.meta !== 'undefined' && import.meta.env && key in import.meta.env) {
    return (import.meta.env as any)[key] || fallback;
  }
  return fallback;
}

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY', ''),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN', ''),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID', ''),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET', ''),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', ''),
  appId: getEnv('VITE_FIREBASE_APP_ID', ''),
  measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID', ''),
};

export { firebaseConfig }; 