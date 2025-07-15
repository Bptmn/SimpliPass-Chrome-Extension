// ===== Core Package Exports =====

// Adapters Layer (Provider-agnostic interfaces)
export { auth, db } from './adapters';
export type { AuthAdapter, AuthResult, DatabaseAdapter } from './adapters';

// Hooks Layer (Layer 1)
export { useLoginFlow } from '../hooks/useLoginFlow';
export { useRefreshData } from '../hooks/useRefreshData';
export { useCredentials } from '../hooks/useCredentials';

// Services Layer (Layer 2)
export {
  loginUser,
  isUserAuthenticated,
  signOutUser,
} from './services/auth';

export {
  getUserSecretKey,
  storeUserSecretKey,
  deleteUserSecretKey,
  getDeviceFingerprint,
  hasUserSecretKey,
} from './services/secret';

export {
  decryptItem,
  decryptAllItems,
} from './services/cryptography';

export {
  setLocalVault,
  getLocalVault,
  clearLocalVault,
} from './services/vault';

export {
  setDataInStates,
  clearAllStates,
  updateItemInStates,
  setAuthState,
} from './services/states';

export {
  addCredentialToDatabase,
  addBankCardToDatabase,
  addSecureNoteToDatabase,
  updateItemInDatabase,
  deleteItemFromDatabase,
  getAllItemsFromDatabase,
} from './services/items';

// Libraries Layer (Layer 3)
export * from './libraries/auth';
// Crypto functionality moved to services/cryptography
export * from './libraries/database';

// Platform adapters
export { platform } from './platform';
export type { PlatformAdapter } from './types/platform.types';

// States (specific exports to avoid conflicts)
export { useAuthStore } from './states/auth.state';
export { useCredentialsStore } from './states/credentials.state';
export { useBankCardsStore } from './states/bankCards';
export { useSecureNotesStore } from './states/secureNotes';
export { useUserStore } from './states/user';

// Types (specific exports to avoid conflicts)
export type { User, UserSession } from './types/auth.types';
export type { Platform, NetworkStatus } from './types/shared.types';
export * from './types/errors.types'; 