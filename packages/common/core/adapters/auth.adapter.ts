import * as authLib from '../libraries/auth/auth';
import { fetchUserSaltCognito } from '../libraries/auth/cognito';

export interface AuthAdapter {
  login(email: string, password: string): Promise<string>;
  isAuthenticated(): Promise<boolean>;
  signOut(): Promise<void>;
  storeUserSecretKey(userSecretKey: string): Promise<void>;
  checkAuthenticationStatus(): Promise<any>;
  fetchUserSalt(): Promise<string>;
}

export const auth: AuthAdapter = {
  login: authLib.loginUser,
  isAuthenticated: authLib.isUserAuthenticated,
  signOut: authLib.signOutUser,
  storeUserSecretKey: authLib.storeUserSecretKey,
  checkAuthenticationStatus: authLib.checkAuthenticationStatus,
  fetchUserSalt: fetchUserSaltCognito,
}; 