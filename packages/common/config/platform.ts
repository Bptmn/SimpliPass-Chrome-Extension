// Add this at the top of the file for Vite env typing
/// <reference types="vite/client" />
/**
 * Platform configuration utility
 * Determines which config to use based on the current environment
 */

// Removed circular dependency - platform detection should be done at app initialization

export const isTestEnvironment = process.env.NODE_ENV === 'test';

export const getPlatformConfig = (platform: 'extension' | 'mobile') => {
  if (isTestEnvironment) {
    // Test environment config - no import.meta
    if (platform === 'extension') {
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
    
    // Mobile platform for tests
    return {
      storageKey: 'userSecretKey',
      vaultKey: null, // Mobile doesn't use local vault
      deviceFingerprintKey: null, // Mobile doesn't use device fingerprint
      sessionTimeout: 15 * 60 * 1000, // 15 minutes (shorter for mobile)
      maxRetryAttempts: 3,
      encryptionAlgorithm: 'AES-256-GCM',
      firebaseConfig: {
        apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
        authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
        projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
        appId: process.env.REACT_APP_FIREBASE_APP_ID || ''
      },
      cognitoConfig: {
        userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID || '',
        userPoolClientId: process.env.REACT_APP_COGNITO_USER_POOL_CLIENT_ID || '',
        region: process.env.REACT_APP_COGNITO_REGION || ''
      },
      validateFirebaseConfig: () => true,
      validateCognitoConfig: () => true
    };
  }
  
  // Production environment config - can use import.meta
  if (platform === 'extension') {
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
  }
  
  // Mobile platform
  return {
    storageKey: 'userSecretKey',
    vaultKey: null, // Mobile doesn't use local vault
    deviceFingerprintKey: null, // Mobile doesn't use device fingerprint
    sessionTimeout: 15 * 60 * 1000, // 15 minutes (shorter for mobile)
    maxRetryAttempts: 3,
    encryptionAlgorithm: 'AES-256-GCM',
    firebaseConfig: {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
      appId: process.env.REACT_APP_FIREBASE_APP_ID || ''
    },
    cognitoConfig: {
      userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID || '',
      userPoolClientId: process.env.REACT_APP_COGNITO_USER_POOL_CLIENT_ID || '',
      region: process.env.REACT_APP_COGNITO_REGION || ''
    },
    validateFirebaseConfig: () => true,
    validateCognitoConfig: () => true
  };
};

/**
 * Get Firebase config for the current platform
 */
export async function getFirebaseConfig(platform: 'extension' | 'mobile') {
  const config = await getPlatformConfig(platform);
  return config.firebaseConfig;
}

/**
 * Get Cognito config for the current platform
 */
export async function getCognitoConfig(platform: 'extension' | 'mobile') {
  const config = await getPlatformConfig(platform);
  return config.cognitoConfig;
}

/**
 * Validate Firebase config for the current platform
 */
export async function validateFirebaseConfig(platform: 'extension' | 'mobile') {
  const config = await getPlatformConfig(platform);
  return config.validateFirebaseConfig();
}

/**
 * Validate Cognito config for the current platform
 */
export async function validateCognitoConfig(platform: 'extension' | 'mobile') {
  const config = await getPlatformConfig(platform);
  return config.validateCognitoConfig();
} 