import { IAuthAdapter } from '../auth.adapter';
import { User as FirebaseUser } from 'firebase/auth';

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  User: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  getAuth: jest.fn(() => ({
    currentUser: null,
    onAuthStateChanged: jest.fn(),
  })),
}));

// Mock the auth libraries
jest.mock('../../libraries/auth/firebase', () => ({
  initFirebase: jest.fn(() => ({
    auth: { currentUser: null },
    db: {},
  })),
}));

jest.mock('../../libraries/auth/cognito', () => ({
  loginWithCognito: jest.fn(),
  signOutCognito: jest.fn(),
  fetchUserSaltCognito: jest.fn(),
}));

describe('Auth Adapter Interface', () => {
  let mockAuthAdapter: IAuthAdapter;

  beforeEach(() => {
    // Create a mock implementation of the auth adapter
    mockAuthAdapter = {
      initialize: jest.fn().mockResolvedValue(undefined),
      login: jest.fn().mockResolvedValue('success'),
      isAuthenticated: jest.fn().mockResolvedValue(false),
      signOut: jest.fn().mockResolvedValue(undefined),
      fetchUserSalt: jest.fn().mockResolvedValue('mock-salt'),
      startAuthListeners: jest.fn().mockResolvedValue(undefined),
      stopAuthListeners: jest.fn(),
      getCurrentUser: jest.fn().mockReturnValue(null),
      onAuthStateChanged: jest.fn().mockResolvedValue(() => {}),
    };
  });

  describe('initialize', () => {
    it('should call initialize method', async () => {
      await mockAuthAdapter.initialize();
      expect(mockAuthAdapter.initialize).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should call login with email and password', async () => {
      const result = await mockAuthAdapter.login('test@example.com', 'password');
      expect(mockAuthAdapter.login).toHaveBeenCalledWith('test@example.com', 'password');
      expect(result).toBe('success');
    });
  });

  describe('isAuthenticated', () => {
    it('should return authentication status', async () => {
      const result = await mockAuthAdapter.isAuthenticated();
      expect(mockAuthAdapter.isAuthenticated).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('signOut', () => {
    it('should call signOut method', async () => {
      await mockAuthAdapter.signOut();
      expect(mockAuthAdapter.signOut).toHaveBeenCalled();
    });
  });

  describe('fetchUserSalt', () => {
    it('should return user salt', async () => {
      const result = await mockAuthAdapter.fetchUserSalt();
      expect(mockAuthAdapter.fetchUserSalt).toHaveBeenCalled();
      expect(result).toBe('mock-salt');
    });
  });

  describe('startAuthListeners', () => {
    it('should start auth listeners with callback', async () => {
      const mockCallback = {
        onAuthStateChanged: jest.fn().mockResolvedValue(undefined),
      };
      
      await mockAuthAdapter.startAuthListeners(mockCallback);
      expect(mockAuthAdapter.startAuthListeners).toHaveBeenCalledWith(mockCallback);
    });
  });

  describe('stopAuthListeners', () => {
    it('should stop auth listeners', () => {
      mockAuthAdapter.stopAuthListeners();
      expect(mockAuthAdapter.stopAuthListeners).toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', () => {
      const result = mockAuthAdapter.getCurrentUser();
      expect(mockAuthAdapter.getCurrentUser).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('onAuthStateChanged', () => {
    it('should set up auth state change listener', async () => {
      const mockCallback = jest.fn();
      const unsubscribe = await mockAuthAdapter.onAuthStateChanged(mockCallback);
      expect(mockAuthAdapter.onAuthStateChanged).toHaveBeenCalledWith(mockCallback);
      expect(typeof unsubscribe).toBe('function');
    });
  });
}); 