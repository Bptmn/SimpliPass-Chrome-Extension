// ===== Common Package Exports =====

// Core functionality
export {
  getUserSecretKey,
  storeUserSecretKey,
  deleteUserSecretKey,
  getDeviceFingerprint,
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
  addItemToDatabase,
  updateItemInDatabase,
  deleteItemFromDatabase,
  getAllItemsFromDatabase,
} from './services';

// Libraries Layer (Layer 3)
export * from './libraries/auth';
// Crypto functionality moved to services/cryptography
export * from './libraries/database';

// Platform adapters
export { platform } from './adapters';
export type { PlatformAdapter } from './types/platform.types';

// States (specific exports to avoid conflicts)
export { useItemStates } from './states/itemStates';
export { useAuthStore } from './states/auth';
export { useUserStore } from './states/user';

// Types (specific exports to avoid conflicts)
export type { User, UserSession } from './types/auth.types';
export type { Platform, NetworkStatus } from './types/shared.types';
export * from './types/errors.types'; 