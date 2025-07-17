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
} from './core';

// Hooks
export {
  useLoginFlow,
  useRefreshData,
  useItems,
} from './hooks';

// States
export {
  useItemStates,
  useAuthStore,
  useUserStore,
} from './core';

// Types
export type {
  User,
  UserSession,
  Platform,
  NetworkStatus,
} from './core';

// Config
export * from './config'; 