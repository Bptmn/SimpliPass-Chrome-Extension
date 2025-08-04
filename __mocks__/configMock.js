// __mocks__/configMock.js
// Mock for @common/config/platform

// Mock environment variables
const mockEnv = {
  VITE_FIREBASE_API_KEY: 'test-api-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'test-project.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'test-project',
  VITE_FIREBASE_STORAGE_BUCKET: 'test-project.appspot.com',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789',
  VITE_FIREBASE_APP_ID: 'test-app-id',
  VITE_FIREBASE_MEASUREMENT_ID: 'test-measurement-id',
  VITE_COGNITO_USER_POOL_ID: 'test-user-pool-id',
  VITE_COGNITO_USER_POOL_WEB_CLIENT_ID: 'test-client-id',
  VITE_COGNITO_REGION: 'us-east-1',
};

// Mock import.meta.env
if (typeof global !== 'undefined') {
  global.import = {
    meta: {
      env: mockEnv
    }
  };
}

const getFirebaseConfig = jest.fn().mockResolvedValue({
  apiKey: mockEnv.VITE_FIREBASE_API_KEY,
  authDomain: mockEnv.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: mockEnv.VITE_FIREBASE_PROJECT_ID,
  storageBucket: mockEnv.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: mockEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: mockEnv.VITE_FIREBASE_APP_ID,
  measurementId: mockEnv.VITE_FIREBASE_MEASUREMENT_ID,
});

const getCognitoConfig = jest.fn().mockResolvedValue({
  userPoolId: mockEnv.VITE_COGNITO_USER_POOL_ID,
  userPoolWebClientId: mockEnv.VITE_COGNITO_USER_POOL_WEB_CLIENT_ID,
  region: mockEnv.VITE_COGNITO_REGION,
});

const validateFirebaseConfig = jest.fn().mockReturnValue(true);
const validateCognitoConfig = jest.fn().mockReturnValue(true);

const getPlatformConfig = jest.fn().mockReturnValue({
  storageKey: 'userSecretKey',
  vaultKey: 'encryptedVault',
  deviceFingerprintKey: 'deviceFingerprint',
  sessionTimeout: 30 * 60 * 1000,
  maxRetryAttempts: 3,
  encryptionAlgorithm: 'AES-256-GCM',
});

// CommonJS exports
module.exports = {
  getFirebaseConfig,
  getCognitoConfig,
  validateFirebaseConfig,
  validateCognitoConfig,
  getPlatformConfig,
}; 