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
  getCurrentUserId,
  initializeUserData,
  clearUserData,
  getFirestoreUserDocument,
  refreshUserInfo
} from './userService';

// Items Services - Centralized data hub
export { 
  itemsService,
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

// Form Transformation Services
export {
  cardFormTransformationService,
  credentialFormTransformationService,
  secureNoteFormTransformationService,
  genericFormTransformationService
} from './formTransformationService';

// Initialization Services
export { initializationService } from './initializationService'; 