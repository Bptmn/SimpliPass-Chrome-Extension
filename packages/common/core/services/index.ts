// ===== Service Layer Exports =====

// Secret Management Services
export { getUserSecretKey, storeUserSecretKey, deleteUserSecretKey, hasUserSecretKey } from './secretsService';

// Cryptography Services
export { decryptItem, decryptAllItems } from './cryptoService';

// Vault Services
export { setLocalVault, getLocalVault, clearLocalVault } from './vaultService';

// User Services
export { 
  getCurrentUser,
  checkUserSecretKey,
  getCurrentUserId,
  initializeUserData,
  clearUserData,
  getFirestoreUserDocument,
  refreshUserInfo
} from './userService';

// Items Services - Centralized data hub
export { 
  addItem, 
  updateItem, 
  deleteItem, 
  getAllItems,
  fetchAndStoreItems,
  loadItemsWithFallback,
  itemsStateManager
} from './itemsService';

// Database Listeners Services
export { databaseListeners } from './listenerService'; 