/**
 * Platform detection utility
 * Determines which config to use based on the current environment
 */

export type Platform = 'mobile' | 'extension' | 'web' | 'test';

/**
 * Detect the current platform
 */
export function detectPlatform(): Platform {
  // Check if we're in a test environment
  if (process.env.NODE_ENV === 'test' || typeof jest !== 'undefined') {
    return 'test';
  }
  
  // Check if we're in a React Native environment
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return 'mobile';
  }
  
  // Check if we're in a Chrome extension environment
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
    return 'extension';
  }
  
  // Default to web
  return 'web';
}

/**
 * Get the appropriate config based on the current platform
 */
export async function getPlatformConfig() {
  const platform = detectPlatform();
  
  switch (platform) {
    case 'test':
      // Return mock config for tests
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
    case 'mobile':
      return await import('@mobile/config');
    case 'extension':
      return await import('@extension/config/config');
    case 'web':
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