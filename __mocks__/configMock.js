// Mock config for tests to avoid import.meta issues
export const firebaseConfig = {
  apiKey: 'test-api-key',
  authDomain: 'test-project.firebaseapp.com',
  projectId: 'test-project',
  storageBucket: 'test-project.appspot.com',
  messagingSenderId: '123456789',
  appId: 'test-app-id',
  measurementId: 'test-measurement-id',
};

export const cognitoConfig = {
  userPoolId: 'test-user-pool-id',
  userPoolClientId: 'test-client-id',
  region: 'us-east-1',
};

export function validateFirebaseConfig() {
  // Mock validation
  return true;
}

export function validateCognitoConfig() {
  // Mock validation
  return true;
}

export async function getFirebaseConfig() {
  return firebaseConfig;
}

export async function getCognitoConfig() {
  return cognitoConfig;
}

export function getPlatformConfig() {
  return {
    storageKey: 'userSecretKey',
    vaultKey: 'encryptedVault',
    deviceFingerprintKey: 'deviceFingerprint',
    sessionTimeout: 30 * 60 * 1000,
    maxRetryAttempts: 3,
    encryptionAlgorithm: 'AES-256-GCM',
    firebaseConfig,
    cognitoConfig,
    validateFirebaseConfig,
    validateCognitoConfig
  };
} 