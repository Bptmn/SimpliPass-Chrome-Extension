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

export const getFirebaseConfig = () => mockFirebaseConfig;
export const getCognitoConfig = () => mockCognitoConfig;
export const getPlatform = () => 'extension';
export const isExtension = () => true;
export const isMobile = () => false; 