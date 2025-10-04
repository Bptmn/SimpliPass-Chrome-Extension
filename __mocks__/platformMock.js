// Mock platform configuration for tests - Extension only
const mockFirebaseConfig = {
  apiKey: 'test-api-key',
  authDomain: 'test-project.firebaseapp.com',
  projectId: 'test-project',
  storageBucket: 'test-project.appspot.com',
  messagingSenderId: '123456789',
  appId: 'test-app-id',
  measurementId: 'test-measurement-id',
};

const mockCognitoConfig = {
  userPoolId: 'test-user-pool-id',
  userPoolWebClientId: 'test-client-id',
  region: 'us-east-1',
};

// Mock the entire platform module
module.exports = {
  // Test environment flag
  isTestEnvironment: true,
  
  // Extension configuration
  getExtensionConfig: () => ({
    storageKey: 'userSecretKey',
    vaultKey: 'encryptedVault',
    deviceFingerprintKey: 'deviceFingerprint',
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    maxRetryAttempts: 3,
    encryptionAlgorithm: 'AES-256-GCM',
    firebaseConfig: mockFirebaseConfig,
    cognitoConfig: mockCognitoConfig,
    validateFirebaseConfig: () => true,
    validateCognitoConfig: () => true
  }),
  
  // Async configuration functions
  getFirebaseConfig: async () => mockFirebaseConfig,
  getCognitoConfig: async () => mockCognitoConfig,
  validateFirebaseConfig: async () => true,
  validateCognitoConfig: async () => true
}; 