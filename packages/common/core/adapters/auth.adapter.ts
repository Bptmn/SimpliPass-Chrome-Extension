// packages/common/core/adapters/auth.adapter.ts
import { User as FirebaseUser } from 'firebase/auth';
import { AuthService } from '../libraries/auth/firebase';

export interface AuthStateChangeCallback {
  onAuthStateChanged: (user: FirebaseUser | null) => Promise<void>;
}

export interface IAuthAdapter {
  initialize(): Promise<void>;
  login(email: string, password: string): Promise<string>;
  isAuthenticated(): Promise<boolean>;
  signOut(): Promise<void>;
  fetchUserSalt(): Promise<string>;
  
  // Listeners functionality - consistent with database adapter
  startAuthListeners(callback: AuthStateChangeCallback): Promise<void>;
  stopAuthListeners(): void;
  
  // Simple current user access - no business logic
  getCurrentUser(): Promise<FirebaseUser | null>;
  
  // Simple auth state listener - no business logic
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): Promise<() => void>;
}

// Create a concrete auth adapter implementation
class AuthAdapter implements IAuthAdapter {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public async initialize(): Promise<void> {
    // Auth service is initialized in constructor
  }

  public async login(email: string, password: string): Promise<string> {
    // Simple wrapper - delegate to auth service
    const user = await this.authService.signInWithFirebaseToken();
    return user.uid;
  }

  public async isAuthenticated(): Promise<boolean> {
    const currentUser = this.authService.getCurrentUserId();
    return currentUser !== null;
  }

  public async signOut(): Promise<void> {
    await this.authService.signOutFromFirebase();
  }

  public async fetchUserSalt(): Promise<string> {
    // This would typically fetch from Cognito
    // For now, return a mock salt
    return 'mock-salt-for-testing';
  }

  public async startAuthListeners(callback: AuthStateChangeCallback): Promise<void> {
    const auth = await this.authService.getAuth();
    if (!auth) {
      throw new Error('Auth not initialized');
    }
    
    // Simple wrapper - just set up the listener
    auth.onAuthStateChanged((user) => {
      callback.onAuthStateChanged(user);
    });
  }

  public stopAuthListeners(): void {
    // Firebase auth listeners are automatically cleaned up
    // No explicit cleanup needed for Firebase auth state listeners
  }

  public async getCurrentUser(): Promise<FirebaseUser | null> {
    const auth = await this.authService.getAuth();
    return auth?.currentUser || null;
  }

  public async onAuthStateChanged(callback: (user: FirebaseUser | null) => void): Promise<() => void> {
    const auth = await this.authService.getAuth();
    if (!auth) {
      throw new Error('Auth not initialized');
    }
    
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        callback(user);
        resolve(unsubscribe);
      });
    });
  }
}

// Export a singleton instance
export const auth: IAuthAdapter = new AuthAdapter();
