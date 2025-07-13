/**
 * Platform configuration utility
 * Determines which config to use based on the current environment
 */

import { getCurrentPlatform, isTestEnvironment } from '../adapters/platform.detection';

export type Platform = 'mobile' | 'extension' | 'web' | 'test';

/**
 * Get the appropriate config based on the current platform
 */
export async function getPlatformConfig() {
  const platform = getCurrentPlatform();
  
  // Handle test environment
  if (isTestEnvironment()) {
    return {
      firebaseConfig: {
        apiKey: 'test-api-key',
        authDomain: 'test-auth-domain',
        projectId: 'test-project-id',
        appId: 'test-app-id'
      },
      cognitoConfig: {
        userPoolId: 'test-user-pool-id',
        userPoolClientId: 'test-client-id',
        region: 'test-region'
      },
      validateFirebaseConfig: () => true,
      validateCognitoConfig: () => true
    };
  }
  
  switch (platform) {
    case 'mobile':
      return await import('@mobile/config');
    case 'extension':
      return await import('@extension/config/config');
    default:
      // For web, we'll use the extension config as fallback
      // since web and extension both use Vite
      return await import('@extension/config/config');
  }
}

/**
 * Get Firebase config for the current platform
 */
export async function getFirebaseConfig() {
  const config = await getPlatformConfig();
  return config.firebaseConfig;
}

/**
 * Get Cognito config for the current platform
 */
export async function getCognitoConfig() {
  const config = await getPlatformConfig();
  return config.cognitoConfig;
}

/**
 * Validate Firebase config for the current platform
 */
export async function validateFirebaseConfig() {
  const config = await getPlatformConfig();
  return config.validateFirebaseConfig();
}

/**
 * Validate Cognito config for the current platform
 */
export async function validateCognitoConfig() {
  const config = await getPlatformConfig();
  return config.validateCognitoConfig();
} 