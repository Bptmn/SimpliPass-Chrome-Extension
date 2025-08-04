// packages/common/core/services/authService.ts
import { User as FirebaseUser } from 'firebase/auth';
import { IAuthAdapter } from '../adapters/auth.adapter';
import { IUserService } from './userService';
import { useAppStateStore } from '../../hooks/useAppState';

export interface IAuthService {
  initialize(): Promise<void>;
  login(email: string, password: string): Promise<string>;
  isAuthenticated(): Promise<boolean>;
  signOut(): Promise<void>;
  fetchUserSalt(): Promise<string>;
  getCurrentUser(): Promise<FirebaseUser | null>;
  startAuthListeners(): Promise<void>;
  stopAuthListeners(): void;
}

export class AuthService implements IAuthService {
  constructor(
    private authAdapter: IAuthAdapter,
    private userService: IUserService,
    private appStateStore: typeof useAppStateStore,
  ) {}

  public async initialize(): Promise<void> {
    await this.authAdapter.initialize();
  }

  public async login(email: string, password: string): Promise<string> {
    // Business logic: authenticate user and return user ID
    const user = await this.authAdapter.login(email, password);
    
    // Business logic: handle user authentication state
    await this.userService.handleUserAuthenticationState(user);
    
    return user;
  }

  public async isAuthenticated(): Promise<boolean> {
    return await this.authAdapter.isAuthenticated();
  }

  public async signOut(): Promise<void> {
    // Business logic: clear user data and sign out
    await this.userService.clearUserData();
    await this.authAdapter.signOut();
  }

  public async fetchUserSalt(): Promise<string> {
    return await this.authAdapter.fetchUserSalt();
  }

  public async getCurrentUser(): Promise<FirebaseUser | null> {
    return await this.authAdapter.getCurrentUser();
  }

  public async startAuthListeners(): Promise<void> {
    const authStateCallback = {
      onAuthStateChanged: async (firebaseUser: FirebaseUser | null) => {
        try {
          if (firebaseUser) {
            await this.handleUserAuthenticated(firebaseUser.uid);
          } else {
            await this.handleUserSignedOut();
          }
          this.appStateStore.getState().setAuthIsAvailable(true);
        } catch (error) {
          console.error('[AuthService] Error in auth state change:', error);
        }
      }
    };
    
    await this.authAdapter.startAuthListeners(authStateCallback);
  }

  public stopAuthListeners(): void {
    this.authAdapter.stopAuthListeners();
  }

  private async handleUserAuthenticated(userId: string): Promise<void> {
    const { success } = await this.userService.handleUserAuthenticationState(userId);
    if (success) {
      // Business logic: user successfully authenticated
      console.log('[AuthService] User authenticated successfully:', userId);
    }
  }

  private async handleUserSignedOut(): Promise<void> {
    // Business logic: handle user sign out
    this.appStateStore.getState().setUserAndSecretKey(null, false);
    console.log('[AuthService] User signed out');
  }
}

// Export singleton instance
export const authService = new AuthService(
  {} as IAuthAdapter,
  {} as IUserService,
  {} as typeof useAppStateStore
); 