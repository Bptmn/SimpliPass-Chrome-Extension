/**
 * useAppRouter.test.ts - Unit tests for system-level router hook
 * 
 * Tests ensure useAppRouter only reacts to system-level state:
 * - user authentication status
 * - user initialization status
 * - error states
 * 
 * Business logic must use navigateTo() explicitly.
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
    isUserFullyInitialized: false,
    listenersError: null,
    platform: 'extension' as const,
  };

  describe('System-level route determination', () => {
    it('should return LOGIN when user is null and no error', () => {
      const { result } = renderHook(() => useAppRouter(defaultProps));
      
      expect(result.current.currentRoute).toBe(ROUTES.LOGIN);
      expect(result.current.isLoading).toBe(false);
    });

    it('should return ERROR when listenersError is present', () => {
      const props = { ...defaultProps, listenersError: 'Connection failed' };
      const { result } = renderHook(() => useAppRouter(props));
      
      expect(result.current.currentRoute).toBe(ROUTES.ERROR);
      expect(result.current.error).toBe('Connection failed');
    });

    it('should return LOGIN when user is null and no error', () => {
      const props = { ...defaultProps, user: null, listenersError: null };
      const { result } = renderHook(() => useAppRouter(props));
      
      expect(result.current.currentRoute).toBe(ROUTES.LOGIN);
      expect(result.current.isLoading).toBe(false);
    });

    it('should return LOCK when user exists but not fully initialized', () => {
      const props = { 
        ...defaultProps, 
        user: mockUser, 
        isUserFullyInitialized: false 
      };
      const { result } = renderHook(() => useAppRouter(props));
      
      expect(result.current.currentRoute).toBe(ROUTES.LOCK);
    });

    it('should return HOME when user is fully authenticated and initialized', () => {
      const props = { 
        ...defaultProps, 
        user: mockUser, 
        isUserFullyInitialized: true 
      };
      const { result } = renderHook(() => useAppRouter(props));
      
      expect(result.current.currentRoute).toBe(ROUTES.HOME);
    });
  });

  describe('Route transitions', () => {
    it('should transition from LOGIN to LOCK when user authenticates but not initialized', () => {
      const { result, rerender } = renderHook(() => 
        useAppRouter({ ...defaultProps, user: null })
      );
      
      expect(result.current.currentRoute).toBe(ROUTES.LOGIN);
      
      // Simulate user authenticating but not fully initialized
      rerender({ ...defaultProps, user: mockUser, isUserFullyInitialized: false });
      
      expect(result.current.currentRoute).toBe(ROUTES.LOCK);
    });

    it('should transition from LOCK to HOME when user becomes fully initialized', () => {
      const { result, rerender } = renderHook(() => 
        useAppRouter({ ...defaultProps, user: mockUser, isUserFullyInitialized: false })
      );
      
      expect(result.current.currentRoute).toBe(ROUTES.LOCK);
      
      // Simulate user becoming fully initialized
      rerender({ ...defaultProps, user: mockUser, isUserFullyInitialized: true });
      
      expect(result.current.currentRoute).toBe(ROUTES.HOME);
    });

    it('should transition to ERROR when error occurs', () => {
      const { result, rerender } = renderHook(() => 
        useAppRouter({ ...defaultProps, user: mockUser, isUserFullyInitialized: true })
      );
      
      expect(result.current.currentRoute).toBe(ROUTES.HOME);
      
      // Simulate error occurring
      rerender({ ...defaultProps, user: mockUser, isUserFullyInitialized: true, listenersError: 'Network error' });
      
      expect(result.current.currentRoute).toBe(ROUTES.ERROR);
    });
  });

  describe('Explicit navigation', () => {
    it('should allow explicit navigation to business routes', () => {
      const { result } = renderHook(() => 
        useAppRouter({ ...defaultProps, user: mockUser, isUserFullyInitialized: true })
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
        useAppRouter({ ...defaultProps, user: mockUser, isUserFullyInitialized: true })
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
        useAppRouter({ ...defaultProps, user: mockUser, isUserFullyInitialized: true })
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
        useAppRouter({ ...defaultProps, user: mockUser, isUserFullyInitialized: true })
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
        useAppRouter({ ...defaultProps, user: mockUser, isUserFullyInitialized: true })
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
        useAppRouter({ ...defaultProps, user: mockUser, isUserFullyInitialized: true })
      );
      
      const newParams = { category: 'credentials', search: 'test' };
      
      act(() => {
        result.current.setParams(newParams);
      });
      
      expect(result.current.routeParams).toEqual(newParams);
    });
  });
}); 