import { renderHook, act, waitFor } from '@testing-library/react';
import { useLoginPage } from '../useLoginPage';
import { auth } from '../../core/adapters/auth.adapter';

// Mock dependencies
jest.mock('../../core/adapters/auth.adapter');

const mockAuth = auth as jest.Mocked<typeof auth>;

describe('useLoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useLoginPage());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('login process', () => {
    it('should handle successful login', async () => {
      mockAuth.login.mockResolvedValue('success');

      const { result } = renderHook(() => useLoginPage());

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(mockAuth.login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle login failure', async () => {
      const loginError = new Error('Invalid credentials');
      mockAuth.login.mockRejectedValue(loginError);

      const { result } = renderHook(() => useLoginPage());

      await act(async () => {
        try {
          await result.current.login('test@example.com', 'wrongpassword');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(mockAuth.login).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Invalid credentials');
    });

    it('should handle loading state during login', async () => {
      // Create a promise that doesn't resolve immediately
      let resolveLogin: (value: string) => void;
      const loginPromise = new Promise<string>((resolve) => {
        resolveLogin = resolve;
      });
      mockAuth.login.mockReturnValue(loginPromise);

      const { result } = renderHook(() => useLoginPage());

      const loginPromiseAct = act(async () => {
        result.current.login('test@example.com', 'password123');
      });

      // Check loading state is true during login
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBe(null);

      // Resolve the login promise
      resolveLogin!('success');
      await loginPromiseAct;

      expect(result.current.isLoading).toBe(false);
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network connection failed');
      mockAuth.login.mockRejectedValue(networkError);

      const { result } = renderHook(() => useLoginPage());

      await act(async () => {
        try {
          await result.current.login('test@example.com', 'password123');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Network connection failed');
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle unknown errors', async () => {
      const unknownError = { message: undefined };
      mockAuth.login.mockRejectedValue(unknownError);

      const { result } = renderHook(() => useLoginPage());

      await act(async () => {
        try {
          await result.current.login('test@example.com', 'password123');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Login failed');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should clear error when clearError is called', async () => {
      const loginError = new Error('Test error');
      mockAuth.login.mockRejectedValue(loginError);

      const { result } = renderHook(() => useLoginPage());

      // First, trigger an error
      await act(async () => {
        try {
          await result.current.login('test@example.com', 'password123');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Test error');

      // Then clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('input validation', () => {
    it('should handle empty email', async () => {
      const { result } = renderHook(() => useLoginPage());

      await act(async () => {
        try {
          await result.current.login('', 'password123');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(mockAuth.login).toHaveBeenCalledWith('', 'password123');
    });

    it('should handle empty password', async () => {
      const { result } = renderHook(() => useLoginPage());

      await act(async () => {
        try {
          await result.current.login('test@example.com', '');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(mockAuth.login).toHaveBeenCalledWith('test@example.com', '');
    });

    it('should handle special characters in email', async () => {
      mockAuth.login.mockResolvedValue('success');

      const { result } = renderHook(() => useLoginPage());

      await act(async () => {
        await result.current.login('test+tag@example.com', 'password123');
      });

      expect(mockAuth.login).toHaveBeenCalledWith('test+tag@example.com', 'password123');
    });
  });

  describe('concurrent login attempts', () => {
    it('should handle multiple rapid login attempts', async () => {
      let resolveFirstLogin: (value: string) => void;
      let resolveSecondLogin: (value: string) => void;
      
      const firstLoginPromise = new Promise<string>((resolve) => {
        resolveFirstLogin = resolve;
      });
      const secondLoginPromise = new Promise<string>((resolve) => {
        resolveSecondLogin = resolve;
      });

      mockAuth.login
        .mockReturnValueOnce(firstLoginPromise)
        .mockReturnValueOnce(secondLoginPromise);

      const { result } = renderHook(() => useLoginPage());

      // Start first login
      const firstLoginAct = act(async () => {
        result.current.login('test@example.com', 'password123');
      });

      // Start second login while first is still pending
      const secondLoginAct = act(async () => {
        result.current.login('test@example.com', 'password123');
      });

      // Both should be in loading state
      expect(result.current.isLoading).toBe(true);

      // Resolve both logins
      resolveFirstLogin!('success');
      resolveSecondLogin!('success');

      await firstLoginAct;
      await secondLoginAct;

      expect(result.current.isLoading).toBe(false);
    });
  });
}); 