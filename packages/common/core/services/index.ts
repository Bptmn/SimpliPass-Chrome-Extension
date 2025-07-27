// ===== Service Layer Exports =====

// Secret Management Services
export { getUserSecretKey, storeUserSecretKey, deleteUserSecretKey, hasUserSecretKey } from './secret';

// Cryptography Services
export { decryptItem, decryptAllItems } from './cryptography';

// Vault Services
export { setLocalVault, getLocalVault, clearLocalVault } from './vault';

// User Services
export { 
  fetchAndStoreUserProfile,
  getCurrentUser,
  checkUserSecretKey,
  getCurrentUserId,
  initializeUserData,
  clearUserData,
  getFirestoreUserDocument,
  refreshUserInfo,
  loadUserProfile
} from './user';

// App Initialization Services
export {
  initializeAppData,
  loadDataAndStartListeners,
  handleAuthStateChange,
  checkUserNeedsPasswordReEntry,
  handleSecretKeyReEntry
} from './appInitialization';

// Items Services - Centralized data hub
export { 
  addItemToDatabase, 
  updateItemInDatabase, 
  deleteItemFromDatabase, 
  getAllItemsFromDatabase,
  fetchAndStoreItems,
  loadItemsWithFallback,
  itemsStateManager
} from './items';

// Session Services - Removed as session management is now handled by platform adapters 