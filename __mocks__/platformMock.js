// Mock platform configuration for tests
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
  
  // Platform detection
  getPlatform: () => 'extension',
  isExtension: () => true,
  isMobile: () => false,
  
  // Configuration functions
  getPlatformConfig: (platform) => ({
    storageKey: 'userSecretKey',
    vaultKey: platform === 'extension' ? 'encryptedVault' : null,
    deviceFingerprintKey: platform === 'extension' ? 'deviceFingerprint' : null,
    sessionTimeout: platform === 'extension' ? 30 * 60 * 1000 : 15 * 60 * 1000,
    maxRetryAttempts: 3,
    encryptionAlgorithm: 'AES-256-GCM',
    firebaseConfig: mockFirebaseConfig,
    cognitoConfig: mockCognitoConfig,
    validateFirebaseConfig: () => true,
    validateCognitoConfig: () => true
  }),
  
  // Async configuration functions
  getFirebaseConfig: async (platform) => mockFirebaseConfig,
  getCognitoConfig: async (platform) => mockCognitoConfig,
  validateFirebaseConfig: async (platform) => true,
  validateCognitoConfig: async (platform) => true
}; 