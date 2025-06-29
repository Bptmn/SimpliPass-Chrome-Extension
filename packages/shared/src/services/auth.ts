import type { User, LoginCredentials, MfaChallenge } from '../types';

export interface AuthService {
  login: (credentials: LoginCredentials) => Promise<{ mfaRequired?: boolean; mfaUser?: any }>;
  confirmMfa: (challenge: MfaChallenge) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
  onAuthStateChanged: (callback: (user: User | null) => void) => () => void;
}

export abstract class BaseAuthService implements AuthService {
  abstract login(credentials: LoginCredentials): Promise<{ mfaRequired?: boolean; mfaUser?: any }>;
  abstract confirmMfa(challenge: MfaChallenge): Promise<void>;
  abstract logout(): Promise<void>;
  abstract getCurrentUser(): Promise<User | null>;
  abstract onAuthStateChanged(callback: (user: User | null) => void): () => void;
}