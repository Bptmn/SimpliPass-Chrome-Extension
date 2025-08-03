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

// Validation Services
export {
  cardValidationService,
  credentialValidationService,
  secureNoteValidationService,
  commonValidationService
} from './validationService';

// Formatting Services
export {
  cardFormattingService,
  dateFormattingService,
  textFormattingService,
  displayFormattingService,
  validationFormattingService
} from './formattingService';

// Form Transformation Services
export {
  cardFormTransformationService,
  credentialFormTransformationService,
  secureNoteFormTransformationService,
  genericFormTransformationService
} from './formTransformationService'; 