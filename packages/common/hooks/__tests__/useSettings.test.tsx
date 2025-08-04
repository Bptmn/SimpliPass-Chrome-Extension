import { renderHook, act } from '@testing-library/react';
import { useSettings } from '../useSettings';
import { getCurrentUser } from '@common/core/services/userService';
import { databaseListeners, authListeners } from '@common/core/services/listenerService';
import { auth } from '@common/core/adapters/auth.adapter';

// Mock dependencies
jest.mock('@common/core/services/userService', () => ({
  getCurrentUser: jest.fn()
}));

jest.mock('@common/core/services/listenerService', () => ({
  databaseListeners: {
    stop: jest.fn()
  },
  authListeners: {
    stop: jest.fn()
  }
}));

jest.mock('@common/core/adapters/auth.adapter', () => ({
  auth: {
    signOut: jest.fn()
  }
}));

// Get the actual mocks from the modules
const { getCurrentUser: mockGetCurrentUser } = require('@common/core/services/userService');
const { databaseListeners: mockDatabaseListeners, authListeners: mockAuthListeners } = require('@common/core/services/listenerService');
const { auth: mockAuth } = require('@common/core/adapters/auth.adapter');

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('useSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockDatabaseListeners.stop.mockImplementation();
    mockAuthListeners.stop.mockImplementation();
    mockAuth.signOut.mockResolvedValue(undefined);
    
    // Reset console mocks
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('loadCurrentUser', () => {
    it('should load current user successfully', async () => {
      const { result } = renderHook(() => useSettings());

      await act(async () => {
        await result.current.loadCurrentUser();
      });

      expect(mockGetCurrentUser).toHaveBeenCalled();
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.userLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle error when loading user fails', async () => {
      const error = new Error('Failed to load user');
      mockGetCurrentUser.mockRejectedValue(error);

      const { result } = renderHook(() => useSettings());

      await act(async () => {
        await result.current.loadCurrentUser();
      });

      expect(mockGetCurrentUser).toHaveBeenCalled();
      expect(result.current.user).toBe(null);
      expect(result.current.userLoading).toBe(false);
      expect(result.current.error).toBe('Failed to load user data');
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      const { result } = renderHook(() => useSettings());

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockAuth.signOut).toHaveBeenCalled();
      expect(mockDatabaseListeners.stop).toHaveBeenCalled();
      expect(mockAuthListeners.stop).toHaveBeenCalled();
      expect(result.current.error).toBe(null);
    });

    it('should handle error when sign out fails', async () => {
      const error = new Error('Sign out failed');
      mockAuth.signOut.mockRejectedValue(error);

      const { result } = renderHook(() => useSettings());

      await act(async () => {
        await expect(result.current.signOut()).rejects.toThrow('Sign out failed');
      });

      expect(mockAuth.signOut).toHaveBeenCalled();
      expect(result.current.error).toBe('Erreur lors de la déconnexion.');
    });
  });

  describe('listener management', () => {
    it('should stop database listeners', () => {
      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.stopDatabaseListeners();
      });

      expect(mockDatabaseListeners.stop).toHaveBeenCalled();
    });

    it('should stop auth listeners', () => {
      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.stopAuthListeners();
      });

      expect(mockAuthListeners.stop).toHaveBeenCalled();
    });
  });
}); 