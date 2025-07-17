export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date;
}

export interface LoginResult {
  user: User;
  session: UserSession;
  userSecretKey: string;
}

export interface AuthState {
  user: User | null;
  session: UserSession | null;
  userSecretKey: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CognitoUser {
  username: string;
  attributes: {
    email: string;
    email_verified: boolean;
    sub: string;
  };
  signInUserSession: {
    accessToken: {
      jwtToken: string;
    };
    idToken: {
      jwtToken: string;
    };
    refreshToken: {
      token: string;
    };
  };
}

export interface FirebaseUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
}

export interface UserData {
  user: User;
  session: UserSession;
  password: string;
  salt: string;
} 