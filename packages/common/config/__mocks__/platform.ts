// packages/common/config/__mocks__/platform.ts
// Mock for platform.ts to avoid import.meta.env issues in Jest

export const isTestEnvironment = true;

export const getPlatformConfig = jest.fn().mockReturnValue({
  storageKey: 'userSecretKey',
  vaultKey: 'encryptedVault',
  deviceFingerprintKey: 'deviceFingerprint',
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  maxRetryAttempts: 3,
  encryptionAlgorithm: 'AES-256-GCM',
  firebaseConfig: {
    apiKey: 'test-api-key',
    authDomain: 'test-project.firebaseapp.com',
    projectId: 'test-project',
    appId: 'test-app-id'
  },
  cognitoConfig: {
    userPoolId: 'test-user-pool-id',
    userPoolClientId: 'test-client-id',
    region: 'us-east-1'
  },
  validateFirebaseConfig: () => true,
  validateCognitoConfig: () => true
});

export async function getFirebaseConfig() {
  const config = await getPlatformConfig();
  return config.firebaseConfig;
}

export async function getCognitoConfig() {
  const config = await getPlatformConfig();
  return config.cognitoConfig;
}

export async function validateFirebaseConfig() {
  const config = await getPlatformConfig();
  return config.validateFirebaseConfig();
}

export async function validateCognitoConfig() {
  const config = await getPlatformConfig();
  return config.validateCognitoConfig();
} 