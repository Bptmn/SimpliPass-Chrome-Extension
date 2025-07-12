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
}

export function validateCognitoConfig() {
  // Mock validation
} 