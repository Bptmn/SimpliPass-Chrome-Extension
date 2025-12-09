// ===== Common Package Exports =====

// Core functionality
export {
  getUserSecretKey,
  storeUserSecretKey,
  deleteUserSecretKey,
  hasUserSecretKey,
  decryptItem,
  decryptAllItems,
  setLocalVault,
  getLocalVault,
  clearLocalVault,
} from './core';

// Libraries Layer (Layer 3)
export * from './core/libraries/auth';
export * from './core/libraries/database';

// Platform adapters
export { platform } from './core/adapters';
export type { PlatformAdapter } from './core/adapters/platform.adapter';

// Constants
export * from './constants';

// Types
export * from './types';

// Utils
export * from './utils';
