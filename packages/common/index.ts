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

// Types (specific exports to avoid conflicts)
export type { User, UserSession, PageState } from './core/types/auth.types';
export * from './core/types/errors.types'; 