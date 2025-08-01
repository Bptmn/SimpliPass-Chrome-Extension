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
    user: null,
    userSecretKeyExist: false,
    isInitializing: false,
    platform: 'extension' as const,
  };

  describe('System-level route determination', () => {
    it('should return LOADING when app is initializing', () => {
      const props = { ...defaultProps, isInitializing: true };
      const { result } = renderHook(() => useAppRouter(props));
      
      expect(result.current.currentRoute).toBe(ROUTES.LOADING);
      expect(result.current.isLoading).toBe(true);
    });

    it('should return LOGIN when user is null and not initializing', () => {
      const { result } = renderHook(() => useAppRouter(defaultProps));
      
      expect(result.current.currentRoute).toBe(ROUTES.LOGIN);
      expect(result.current.isLoading).toBe(false);
    });

    it('should return LOCK when user exists but no secret key', () => {
      const props = { 
        ...defaultProps, 
        user: mockUser, 
        userSecretKeyExist: false 
      };
      const { result } = renderHook(() => useAppRouter(props));
      
      expect(result.current.currentRoute).toBe(ROUTES.LOCK);
    });

    it('should return HOME when user is fully authenticated and initialized', () => {
      const props = { 
        ...defaultProps, 
        user: mockUser, 
        userSecretKeyExist: true 
      };
      const { result } = renderHook(() => useAppRouter(props));
      
      expect(result.current.currentRoute).toBe(ROUTES.HOME);
    });
  });

  describe('Route transitions', () => {
    it('should transition from LOADING to LOGIN when initialization completes', () => {
      const { result, rerender } = renderHook(() => 
        useAppRouter({ ...defaultProps, isInitializing: true })
      );
      
      expect(result.current.currentRoute).toBe(ROUTES.LOADING);
      
      // Simulate initialization completing
      rerender({ ...defaultProps, isInitializing: false });
      
      expect(result.current.currentRoute).toBe(ROUTES.LOGIN);
    });

    it('should transition from LOGIN to LOCK when user authenticates but not initialized', () => {
      const { result, rerender } = renderHook(() => 
        useAppRouter({ ...defaultProps, user: null })
      );
      
      expect(result.current.currentRoute).toBe(ROUTES.LOGIN);
      
      // Simulate user authenticating but not fully initialized
      rerender({ ...defaultProps, user: mockUser, userSecretKeyExist: false });
      
      expect(result.current.currentRoute).toBe(ROUTES.LOCK);
    });

    it('should transition from LOCK to HOME when user becomes fully initialized', () => {
      const { result, rerender } = renderHook(() => 
        useAppRouter({ ...defaultProps, user: mockUser, userSecretKeyExist: false })
      );
      
      expect(result.current.currentRoute).toBe(ROUTES.LOCK);
      
      // Simulate user becoming fully initialized
      rerender({ ...defaultProps, user: mockUser, userSecretKeyExist: true });
      
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