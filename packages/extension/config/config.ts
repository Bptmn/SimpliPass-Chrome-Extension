// Extension-specific configuration
// This file loads environment variables at build time for the Chrome extension
// Uses Vite environment variables (VITE_*)

export const config = {
  firebase: {
    apiKey: process.env.VITE_FIREBASE_API_KEY || '',
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.VITE_FIREBASE_APP_ID || '',
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || '',
  },
  Cognito: {
    userPoolId: process.env.VITE_COGNITO_USER_POOL_ID || '',
    userPoolClientId: process.env.VITE_COGNITO_CLIENT_ID || '',
    region: process.env.VITE_COGNITO_REGION || '',
  },
};

// Export individual configs for compatibility
export const firebaseConfig = config.firebase;
export const cognitoConfig = config.Cognito;

// Validation functions
export function validateFirebaseConfig() {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);
  
  if (missingFields.length > 0) {
    throw new Error(`Firebase configuration is incomplete. Missing: ${missingFields.join(', ')}`);
  }
}

export function validateCognitoConfig() {
  const requiredFields = ['userPoolId', 'userPoolClientId', 'region'];
  const missingFields = requiredFields.filter(field => !cognitoConfig[field as keyof typeof cognitoConfig]);
  
  if (missingFields.length > 0) {
    throw new Error(`Cognito configuration is incomplete. Missing: ${missingFields.join(', ')}`);
  }
}
