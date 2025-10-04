// Add this at the top of the file for Vite env typing
/// <reference types="vite/client" />
/**
 * Extension platform configuration
 * Simplified for Chrome extension only
 */

export const isTestEnvironment = process.env.NODE_ENV === 'test';

export const getExtensionConfig = () => {
  if (isTestEnvironment) {
    // Test environment config - no import.meta
    return {
      storageKey: 'userSecretKey',
      vaultKey: 'encryptedVault',
      deviceFingerprintKey: 'deviceFingerprint',
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      maxRetryAttempts: 3,
      encryptionAlgorithm: 'AES-256-GCM',
      firebaseConfig: {
        apiKey: process.env.VITE_FIREBASE_API_KEY || '',
        authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
        appId: process.env.VITE_FIREBASE_APP_ID || ''
      },
      cognitoConfig: {
        userPoolId: process.env.VITE_COGNITO_USER_POOL_ID || '',
        userPoolClientId: process.env.VITE_COGNITO_CLIENT_ID || '',
        region: process.env.VITE_COGNITO_REGION || ''
      },
      validateFirebaseConfig: () => true,
      validateCognitoConfig: () => true
    };
  }
  
  // Production environment config - use centralized environment variables
  return {
    storageKey: 'userSecretKey',
    vaultKey: 'encryptedVault',
    deviceFingerprintKey: 'deviceFingerprint',
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    maxRetryAttempts: 3,
    encryptionAlgorithm: 'AES-256-GCM',
    firebaseConfig: {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
    },
    cognitoConfig: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '',
      region: import.meta.env.VITE_COGNITO_REGION || ''
    },
    validateFirebaseConfig: () => true,
    validateCognitoConfig: () => true
  };
};

/**
 * Get Firebase config for the extension
 */
export async function getFirebaseConfig() {
  const config = getExtensionConfig();
  return config.firebaseConfig;
}

/**
 * Get Cognito config for the extension
 */
export async function getCognitoConfig() {
  const config = getExtensionConfig();
  return config.cognitoConfig;
}

/**
 * Validate Firebase config for the extension
 */
export async function validateFirebaseConfig() {
  const config = getExtensionConfig();
  return config.validateFirebaseConfig();
}

/**
 * Validate Cognito config for the extension
 */
export async function validateCognitoConfig() {
  const config = getExtensionConfig();
  return config.validateCognitoConfig();
} 