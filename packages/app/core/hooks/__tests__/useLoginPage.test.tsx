/**
 * useLoginPage hook tests for SimpliPass
 * Tests state, effect, error, and handler logic
 */

import { renderHook, act } from '@testing-library/react-native';
import { useLoginPage } from '../useLoginPage';

// Mock dependencies
jest.mock('@app/core/logic/user', () => ({
  loginUser: jest.fn(() => Promise.resolve({ success: true })),
}));
jest.mock('@app/core/states/user', () => {
  const mockSetUser = jest.fn();
  const mockUser = { id: 'u1', email: 'test@example.com' };
  const useUserStore = (selector: any) => selector({ setUser: mockSetUser });
  useUserStore.getState = () => ({ user: mockUser });
  return { useUserStore };
});
jest.mock('@app/core/hooks', () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));
jest.mock('react-router-dom', () => {
  const navigate = jest.fn();
  return { useNavigate: () => navigate, __esModule: true, navigate };
});

describe('useLoginPage Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useLoginPage());
    expect(result.current.email).toBe('');
    expect(result.current.password).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should update email and password', () => {
    const { result } = renderHook(() => useLoginPage());
    act(() => {
      result.current.setEmail('test@example.com');
      result.current.setPassword('secret');
    });
    expect(result.current.email).toBe('test@example.com');
    expect(result.current.password).toBe('secret');
  });

  it('should handle login success', async () => {
    const { navigate } = require('react-router-dom');
    const { result } = renderHook(() => useLoginPage());
    act(() => {
      result.current.setEmail('test@example.com');
      result.current.setPassword('secret');
    });
    await act(async () => {
      await result.current.handleLogin();
    });
    expect(result.current.error).toBe(null);
    expect(navigate).toHaveBeenCalledWith('/home');
  });

  it('should handle login error', async () => {
    const { loginUser } = require('@app/core/logic/user');
    loginUser.mockImplementationOnce(() => Promise.reject(new Error('Login failed')));
    const { result } = renderHook(() => useLoginPage());
    act(() => {
      result.current.setEmail('fail@example.com');
      result.current.setPassword('fail');
    });
    await act(async () => {
      await result.current.handleLogin();
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Login failed');
  });
}); 