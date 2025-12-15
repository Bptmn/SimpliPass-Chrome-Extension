/**
 * useLogin Hook Tests
 * 
 * Tests the login form state management, validation, and authentication flow.
 * Focuses on UI state management and user interactions.
 */

import { renderHook, act } from '@testing-library/react';
import { useLogin } from '../useLogin';
import { authService } from '../../core/services/authService';

// Mock the auth service
jest.mock('../../core/services/authService', () => ({
  authService: {
    login: jest.fn(),
  },
}));

const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('useLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useLogin());

      expect(result.current.email).toBe('');
      expect(result.current.password).toBe('');
      expect(result.current.emailError).toBe('');
      expect(result.current.passwordError).toBe('');
      expect(result.current.rememberEmail).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.mfaChallenge).toBeNull();
      expect(result.current.loginSuccess).toBe(false);
    });
  });

  describe('form state management', () => {
    it('should update email', () => {
      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.setEmail('test@example.com');
      });

      expect(result.current.email).toBe('test@example.com');
    });

    it('should update password', () => {
      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.setPassword('Password123!');
      });

      expect(result.current.password).toBe('Password123!');
    });

    it('should update remember email preference', () => {
      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.setRememberEmail(true);
      });

      expect(result.current.rememberEmail).toBe(true);
    });
  });

  describe('form validation', () => {
    it('should validate email correctly', () => {
      const { result } = renderHook(() => useLogin());

      // Test empty email
      act(() => {
        result.current.setEmail('');
      });
      
      act(() => {
        result.current.validateForm();
      });

      expect(result.current.emailError).toBe('Email is required');

      // Test invalid email
      act(() => {
        result.current.setEmail('invalid-email');
      });
      
      act(() => {
        result.current.validateForm();
      });

      expect(result.current.emailError).toBe('Invalid email format');

      // Test valid email
      act(() => {
        result.current.setEmail('test@example.com');
      });
      
      act(() => {
        result.current.validateForm();
      });

      expect(result.current.emailError).toBe('');
    });

    it('should validate password correctly', () => {
      const { result } = renderHook(() => useLogin());

      // Test empty password
      act(() => {
        result.current.setPassword('');
      });
      
      act(() => {
        result.current.validateForm();
      });

      expect(result.current.passwordError).toBe('Password is required');

      // Test valid password (any non-empty password is accepted for login)
      act(() => {
        result.current.setPassword('anypassword');
      });
      
      act(() => {
        result.current.validateForm();
      });

      expect(result.current.passwordError).toBe('');
    });

    it('should return false for invalid form', () => {
      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.setEmail('');
        result.current.setPassword('');
      });

      const isValid = result.current.validateForm();
      expect(isValid).toBe(false);
    });

    it('should return true for valid form', () => {
      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.setEmail('test@example.com');
        result.current.setPassword('anypassword');
      });

      const isValid = result.current.validateForm();
      expect(isValid).toBe(true);
    });
  });

  describe('login flow', () => {
    it('should handle successful login without MFA', async () => {
      const { result } = renderHook(() => useLogin());

      mockAuthService.login.mockResolvedValue('success');

      act(() => {
        result.current.setEmail('test@example.com');
        result.current.setPassword('Password123!');
      });

      await act(async () => {
        await result.current.handleLogin();
      });

      expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'Password123!');
      expect(result.current.loginSuccess).toBe(true);
      expect(result.current.mfaChallenge).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should handle MFA challenge', async () => {
      const { result } = renderHook(() => useLogin());

      const mfaChallenge = {
        mfaRequired: true,
        challengeName: 'SOFTWARE_TOKEN_MFA',
        session: 'test-session',
      };

      mockAuthService.login.mockResolvedValue(mfaChallenge);

      act(() => {
        result.current.setEmail('test@example.com');
        result.current.setPassword('Password123!');
      });

      await act(async () => {
        await result.current.handleLogin();
      });

      expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'Password123!');
      expect(result.current.mfaChallenge).toEqual(mfaChallenge);
      expect(result.current.loginSuccess).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle login error', async () => {
      const { result } = renderHook(() => useLogin());

      const errorMessage = 'Invalid credentials';
      mockAuthService.login.mockRejectedValue(new Error(errorMessage));

      act(() => {
        result.current.setEmail('test@example.com');
        result.current.setPassword('wrongpassword'); // Any password accepted, but wrong credentials
      });

      await act(async () => {
        await result.current.handleLogin();
      });

      expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
      // Error message is transformed by useLogin error handling
      expect(result.current.error).toContain('Invalid email or password');
      expect(result.current.loginSuccess).toBe(false);
      expect(result.current.mfaChallenge).toBeNull();
    });

    it('should not call auth service with invalid form', async () => {
      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.setEmail('');
        result.current.setPassword('');
      });

      await act(async () => {
        await result.current.handleLogin();
      });

      expect(mockAuthService.login).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
    });

    it('should set loading state during login', async () => {
      const { result } = renderHook(() => useLogin());

      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });
      mockAuthService.login.mockReturnValue(loginPromise);

      act(() => {
        result.current.setEmail('test@example.com');
        result.current.setPassword('Password123!');
      });

      // Start login
      act(() => {
        result.current.handleLogin();
      });

      expect(result.current.isLoading).toBe(true);

      // Resolve login
      await act(async () => {
        resolveLogin!('success');
        await loginPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should clear error', async () => {
      const { result } = renderHook(() => useLogin());

      // Set error through login failure
      mockAuthService.login.mockRejectedValue(new Error('Login failed'));

      act(() => {
        result.current.setEmail('test@example.com');
        result.current.setPassword('Password123!');
      });

      await act(async () => {
        await result.current.handleLogin();
      });

      expect(result.current.error).toBe('Login failed');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should clear MFA challenge', async () => {
      const { result } = renderHook(() => useLogin());

      const mfaChallenge = {
        mfaRequired: true,
        challengeName: 'SOFTWARE_TOKEN_MFA',
        session: 'test-session',
      };

      // Set MFA challenge through login
      mockAuthService.login.mockResolvedValue(mfaChallenge);

      act(() => {
        result.current.setEmail('test@example.com');
        result.current.setPassword('Password123!');
      });

      await act(async () => {
        await result.current.handleLogin();
      });

      expect(result.current.mfaChallenge).toEqual(mfaChallenge);

      act(() => {
        result.current.clearMfaChallenge();
      });

      expect(result.current.mfaChallenge).toBeNull();
    });
  });
});
