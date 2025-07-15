// ===== Common Package Exports =====

// Core functionality
export {
  loginUser,
  isUserAuthenticated,
  signOutUser,
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
  addCredentialToDatabase,
  addBankCardToDatabase,
  addSecureNoteToDatabase,
  updateItemInDatabase,
  deleteItemFromDatabase,
  getAllItemsFromDatabase,
} from './core';

// Hooks
export {
  useLoginFlow,
  useRefreshData,
  useCredentials,
} from './hooks';

// States
export {
  useAuthStore,
  useCredentialsStore,
  useBankCardsStore,
  useSecureNotesStore,
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