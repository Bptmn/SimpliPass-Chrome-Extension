// ===== Service Layer Exports =====

// Authentication Services
export { loginUser, isUserAuthenticated, signOutUser } from './auth';

// Secret Management Services
export { getUserSecretKey, storeUserSecretKey, deleteUserSecretKey, getDeviceFingerprint, hasUserSecretKey } from './secret';

// Cryptography Services
export { decryptItem, decryptAllItems } from './cryptography';

// Vault Services
export { setLocalVault, getLocalVault, clearLocalVault } from './vault';

// State Management Services
export { setDataInStates, clearAllStates, updateItemInStates, setAuthState } from './states';

// Items Services
export { addCredentialToDatabase, addBankCardToDatabase, addSecureNoteToDatabase, updateItemInDatabase, deleteItemFromDatabase, getAllItemsFromDatabase } from './items';

// Session Services
export { initializeUserSession, clearUserSession, isSessionValid, refreshUserSession } from './session'; 