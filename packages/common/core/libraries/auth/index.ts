export { 
  initFirebase, 
  initialize, 
  login, 
  isAuthenticated, 
  signOutUser, 
  fetchUserSalt, 
  getAuthInstance, 
  getCurrentUser, 
  onAuthStateChanged 
} from './firebase';

export { 
  loginWithCognito, 
  fetchUserSaltCognito, 
  signOutCognito 
} from './cognito';