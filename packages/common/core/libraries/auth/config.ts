/**
 * Platform-agnostic configuration loading for auth services
 * Dynamically loads config based on the current platform
 */

import { getFirebaseConfig, getCognitoConfig, validateFirebaseConfig, validateCognitoConfig } from '../../../config/platform';

// Export platform-specific configs
export { getFirebaseConfig as firebaseConfig, getCognitoConfig as cognitoConfig, validateFirebaseConfig, validateCognitoConfig };