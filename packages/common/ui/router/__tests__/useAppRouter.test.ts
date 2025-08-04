/**
 * useAppRouter.test.ts - Unit tests for system-level router hook
 * 
 * Tests ensure useAppRouter only reacts to system-level state:
 * - user authentication status
 * - user initialization status
 * - error states
 * 
 * Business logic must use navigateTo() explicitly.
 * All route references use ROUTES constants to prevent string literals.
 * 
 * Test Coverage:
 * - System-level route determination
 * - Route transitions based on state changes
 * - Explicit navigation for business routes
 * - Navigation history management
 * - Platform detection
 * - Parameter management
 */

import { renderHook, act } from '@testing-library/react';
import { useAppRouter } from '../useAppRouter';
import { ROUTES } from '../ROUTES';
import type { User } from '@common/core/types/auth.types';

// Mock platform config to avoid import.meta.env issues
jest.mock('@common/config/platform', () => ({
  getFirebaseConfig: jest.fn().mockResolvedValue({
    apiKey: 'test-api-key',
    authDomain: 'test-project.firebaseapp.com',
    projectId: 'test-project',
    storageBucket: 'test-project.appspot.com',
    messagingSenderId: '123456789',
    appId: 'test-app-id',
    measurementId: 'test-measurement-id',
  }),
  getCognitoConfig: jest.fn().mockResolvedValue({
    region: 'us-east-1',
    userPoolId: 'test-user-pool',
    clientId: 'test-client-id',
  })
}));

let mockState = {
  isInitializing: false,
  initializationError: null,
  user: null,
  userSecretKeyExist: false,
  authIsAvailable: true,
};

jest.mock('@common/hooks/useAppState', () => ({
  useAppStateStore: Object.assign(
    jest.fn((selector) => {
      return selector ? selector(mockState) : mockState;
    }),
    {
      getState: jest.fn(() => mockState)
    }
  )
}));

// Mock user for testing
const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  username: 'testuser',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('useAppRouter', () => {
  const defaultProps = {
    platform: 'extension' as const,
  };

  // Mock the Zustand store state
  const mockUseAppStateStore = require('@common/hooks/useAppState').useAppStateStore;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('System-level route determination', () => {
    it('should return LOADING when app is initializing', () => {
      mockState = {
        isInitializing: true,
        initializationError: null,
        user: null,
        userSecretKeyExist: false,
        authIsAvailable: true,
      };
      
      const { result } = renderHook(() => useAppRouter(defaultProps));
      
      expect(result.current.currentRoute).toBe(ROUTES.LOADING);
      expect(result.current.isLoading).toBe(true);
    });

    it('should return LOGIN when user is null and not initializing', () => {
      mockState = {
        isInitializing: false,
        initializationError: null,
        user: null,
        userSecretKeyExist: false,
        authIsAvailable: true,
      };
      
      const { result } = renderHook(() => useAppRouter(defaultProps));
      
      expect(result.current.currentRoute).toBe(ROUTES.LOGIN);
      expect(result.current.isLoading).toBe(false);
    });

    it('should return LOCK when user exists but no secret key', () => {
      mockState = {
        isInitializing: false,
        initializationError: null,
        user: mockUser,
        userSecretKeyExist: false,
        authIsAvailable: true,
      };
      
      const { result } = renderHook(() => useAppRouter(defaultProps));
      
      expect(result.current.currentRoute).toBe(ROUTES.LOCK);
    });

    it('should return HOME when user is fully authenticated and initialized', () => {
      mockState = {
        isInitializing: false,
        initializationError: null,
        user: mockUser,
        userSecretKeyExist: true,
        authIsAvailable: true,
      };
      
      const { result } = renderHook(() => useAppRouter(defaultProps));
      
      expect(result.current.currentRoute).toBe(ROUTES.HOME);
    });
  });

  describe('Route transitions', () => {
    it('should transition from LOADING to LOGIN when initialization completes', () => {
      // Start with loading state
      mockState = {
        isInitializing: true,
        initializationError: null,
        user: null,
        userSecretKeyExist: false,
        authIsAvailable: true,
      };
      
      const { result, rerender } = renderHook(() => useAppRouter(defaultProps));
      
      expect(result.current.currentRoute).toBe(ROUTES.LOADING);
      
      // Simulate initialization completing
      mockState = {
        isInitializing: false,
        initializationError: null,
        user: null,
        userSecretKeyExist: false,
        authIsAvailable: true,
      };
      
      rerender();
      
      expect(result.current.currentRoute).toBe(ROUTES.LOGIN);
    });

    it('should transition from LOGIN to LOCK when user authenticates but not initialized', () => {
      // Start with no user
      mockState = {
        isInitializing: false,
        initializationError: null,
        user: null,
        userSecretKeyExist: false,
        authIsAvailable: true,
      };
      
      const { result, rerender } = renderHook(() => useAppRouter(defaultProps));
      
      expect(result.current.currentRoute).toBe(ROUTES.LOGIN);
      
      // Simulate user authenticating but not fully initialized
      mockState = {
        isInitializing: false,
        initializationError: null,
        user: mockUser,
        userSecretKeyExist: false,
        authIsAvailable: true,
      };
      
      rerender();
      
      expect(result.current.currentRoute).toBe(ROUTES.LOCK);
    });

    it('should transition from LOCK to HOME when user becomes fully initialized', () => {
      // Start with user but no secret key
      mockState = {
        isInitializing: false,
        initializationError: null,
        user: mockUser,
        userSecretKeyExist: false,
        authIsAvailable: true,
      };
      
      const { result, rerender } = renderHook(() => useAppRouter(defaultProps));
      
      expect(result.current.currentRoute).toBe(ROUTES.LOCK);
      
      // Simulate user becoming fully initialized
      mockState = {
        isInitializing: false,
        initializationError: null,
        user: mockUser,
        userSecretKeyExist: true,
        authIsAvailable: true,
      };
      
      rerender();
      
      expect(result.current.currentRoute).toBe(ROUTES.HOME);
    });
  });

  describe('Explicit navigation', () => {
    it('should allow explicit navigation to business routes', () => {
      const { result } = renderHook(() => 
        useAppRouter({ ...defaultProps, user: mockUser, userSecretKeyExist: true })
      );
      
      expect(result.current.currentRoute).toBe(ROUTES.HOME);
      
      // Explicit navigation to business route
      act(() => {
        result.current.navigateTo(ROUTES.SETTINGS);
      });
      
      expect(result.current.currentRoute).toBe(ROUTES.SETTINGS);
    });

    it('should preserve route parameters during explicit navigation', () => {
      const { result } = renderHook(() => 
        useAppRouter({ ...defaultProps, user: mockUser, userSecretKeyExist: true })
      );
      
      const testParams = { credential: { id: '123', title: 'Test' } };
      
      act(() => {
        result.current.navigateTo(ROUTES.CREDENTIAL_DETAILS, testParams);
      });
      
      expect(result.current.currentRoute).toBe(ROUTES.CREDENTIAL_DETAILS);
      expect(result.current.routeParams).toEqual(testParams);
    });

    it('should allow navigation to lock with reason', () => {
      const { result } = renderHook(() => 
        useAppRouter({ ...defaultProps, user: mockUser, userSecretKeyExist: true })
      );
      
      act(() => {
        result.current.navigateToLock('expired');
      });
      
      expect(result.current.currentRoute).toBe(ROUTES.LOCK);
      expect(result.current.lockReason).toBe('expired');
    });
  });

  describe('Navigation history', () => {
    it('should maintain navigation history', () => {
      const { result } = renderHook(() => 
        useAppRouter({ ...defaultProps, user: mockUser, userSecretKeyExist: true })
      );
      
      expect(result.current.currentRoute).toBe(ROUTES.HOME);
      
      // Navigate to settings
      act(() => {
        result.current.navigateTo(ROUTES.SETTINGS);
      });
      
      expect(result.current.currentRoute).toBe(ROUTES.SETTINGS);
      
      // Go back
      act(() => {
        result.current.goBack();
      });
      
      expect(result.current.currentRoute).toBe(ROUTES.HOME);
    });

    it('should reset to home correctly', () => {
      const { result } = renderHook(() => 
        useAppRouter({ ...defaultProps, user: mockUser, userSecretKeyExist: true })
      );
      
      // Navigate to settings
      act(() => {
        result.current.navigateTo(ROUTES.SETTINGS);
      });
      
      expect(result.current.currentRoute).toBe(ROUTES.SETTINGS);
      
      // Reset to home
      act(() => {
        result.current.resetToHome();
      });
      
      expect(result.current.currentRoute).toBe(ROUTES.HOME);
    });
  });

  describe('Platform detection', () => {
    it('should correctly identify extension platform', () => {
      const { result } = renderHook(() => 
        useAppRouter({ ...defaultProps, platform: 'extension' })
      );
      
      expect(result.current.isExtension).toBe(true);
      expect(result.current.isMobile).toBe(false);
    });

    it('should correctly identify mobile platform', () => {
      const { result } = renderHook(() => 
        useAppRouter({ ...defaultProps, platform: 'mobile' })
      );
      
      expect(result.current.isExtension).toBe(false);
      expect(result.current.isMobile).toBe(true);
    });
  });

  describe('Parameter management', () => {
    it('should allow setting route parameters', () => {
      const { result } = renderHook(() => 
        useAppRouter({ ...defaultProps, user: mockUser, userSecretKeyExist: true })
      );
      
      const newParams = { category: 'credentials', search: 'test' };
      
      act(() => {
        result.current.setParams(newParams);
      });
      
      expect(result.current.routeParams).toEqual(newParams);
    });
  });
}); 