export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberEmail?: boolean;
}

export interface MfaChallenge {
  code: string;
  mfaUser: any;
}