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
} from './core';

// Hooks
export { useDebouncedValue } from './utils/debouncedValue';
export { usePasswordGenerator } from './hooks/usePasswordGenerator';
export { useHelperBar } from './hooks/useHelperBar';

export { useInputLogic } from './hooks/useInputLogic';
export { useItems } from './hooks/useItems';
export { useLazyCredentialIcon } from './hooks/useLazyCredentialIcon';
export { useAuth } from './hooks/useAuth';
export { useManualRefresh } from './hooks/useManualRefresh';
export { useRefreshData } from './hooks/useRefreshData';
export { useReEnterPassword } from './hooks/useReEnterPassword';
export { useToast } from './hooks/useToast';
export { useUser } from './hooks/useUser';



// Types
export type {
  User,
  UserSession,
  Platform,
  NetworkStatus,
} from './core';

// Config
export * from './config'; 