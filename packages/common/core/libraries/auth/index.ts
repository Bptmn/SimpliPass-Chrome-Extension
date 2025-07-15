// Re-export all auth library functions
export * from './cognito';
export * from './firebase';

// Re-export specific functions for convenience
export { signInWithFirebaseToken, auth, firestore, signOutFromFirebase } from './firebase';
export { loginWithCognito, fetchUserSaltCognito, signOutCognito } from './cognito';