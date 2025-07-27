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
  setDataInStates,
  clearAllStates,
  updateItemInStates,
  setAuthState,
  addItem,
  updateItem,
  deleteItem,
  getAllItems,
} from './services';

// Libraries Layer (Layer 3)
export * from './libraries/auth';
// Crypto functionality moved to services/cryptography
export * from './libraries/database';

// Platform adapters
export { platform } from './adapters';
export type { PlatformAdapter } from './adapters/platform.adapter';

// States (specific exports to avoid conflicts)
export { useCategoryStore } from './states/category';

// Types (specific exports to avoid conflicts)
export type { User, UserSession } from './types/auth.types';
export type { Platform, NetworkStatus } from './types/shared.types';
export * from './types/errors.types'; 