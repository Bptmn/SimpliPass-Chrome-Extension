export { 
  initFirebase, 
  initialize, 
  isAuthenticated, 
  signOutFromFirebase,
  signInWithFirebaseToken,
  getAuthInstance, 
  getFirestoreInstance,
  getCurrentUser, 
  getCurrentUserId,
  startAuthListeners,
  stopAuthListeners
} from './firebase';

export { 
  loginWithCognito, 
  loginWithCognitoAndGetUserId,
  fetchUserSaltCognito, 
  signOutCognito,
  signOutFromAllProviders,
  getCognitoTokensAndFirebaseToken
} from './cognito';