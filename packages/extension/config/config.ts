// Extension-specific configuration
// This file loads environment variables at build time for the Chrome extension
// Uses Vite environment variables (VITE_*)

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const cognitoConfig = {
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
  userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '',
  region: import.meta.env.VITE_COGNITO_REGION || '',
};

export const validateFirebaseConfig = () => {
  return !!firebaseConfig.apiKey && !!firebaseConfig.authDomain && !!firebaseConfig.projectId && !!firebaseConfig.appId;
};

export const validateCognitoConfig = () => {
  return !!cognitoConfig.userPoolId && !!cognitoConfig.userPoolClientId && !!cognitoConfig.region;
};

export default {
  firebaseConfig,
  cognitoConfig,
  validateFirebaseConfig,
  validateCognitoConfig,
};
