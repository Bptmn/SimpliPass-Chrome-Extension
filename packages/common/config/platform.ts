// Add this at the top of the file for Vite env typing
/// <reference types="vite/client" />
/**
 * Platform configuration utility
 * Determines which config to use based on the current environment
 */

import { detectPlatform, isTestEnvironment } from '../core/platform/platform.detection';

export type Platform = 'mobile' | 'extension' | 'web' | 'test';

/**
 * Get the appropriate config based on the current platform
 */
export async function getPlatformConfig() {
  const platform = await detectPlatform();
  console.log('[PlatformConfig] Platform:', platform);

  // Handle test environment
  if (isTestEnvironment()) {
    console.log('[PlatformConfig] Using test environment config');
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
      // For mobile, use a fallback config for now
      // The actual mobile config will be loaded at runtime
      console.log('[PlatformConfig] Mobile config:', {
        apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
        authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
        appId: process.env.REACT_APP_FIREBASE_APP_ID
      });
      return {
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
    case 'extension':
      try {
        const config = await import('@extension/config/config');
        console.log('[PlatformConfig] Loaded extension config:', config);
        return config;
      } catch (error) {
        console.warn('[PlatformConfig] Failed to load extension config, using fallback:', error);
        const fallback = {
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
        console.log('[PlatformConfig] Extension fallback config:', fallback);
        return fallback;
      }
    default:
      // For web, we'll use the extension config as fallback
      // since web and extension both use Vite
      try {
        const config = await import('@extension/config/config');
        console.log('[PlatformConfig] Loaded web/extension config:', config);
        return config;
      } catch (error) {
        console.warn('[PlatformConfig] Failed to load extension config, using fallback:', error);
        const fallback = {
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
        console.log('[PlatformConfig] Web fallback config:', fallback);
        return fallback;
      }
  }
}

/**
 * Get Firebase config for the current platform
 */
export async function getFirebaseConfig() {
  const config = await getPlatformConfig();
  console.log('[FirebaseConfig] Using config:', config.firebaseConfig);
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