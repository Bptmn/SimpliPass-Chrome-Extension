/**
 * useLoginPage hook tests for SimpliPass
 * Tests state, effect, error, and handler logic
 */

import { renderHook, act } from '@testing-library/react';
import { useLoginPage } from '../useLoginPage';
import { loginUser, confirmMfa } from '@app/core/logic/user';

// Mock the dependencies
jest.mock('@app/core/logic/user');
jest.mock('@app/core/states/user', () => ({
  useUserStore: {
    getState: jest.fn(() => ({ user: null })),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('useLoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should initialize with rememberMe as false', () => {
    const { result } = renderHook(() => useLoginPage());
    expect(result.current.rememberMe).toBe(false);
  });

  it('should update rememberMe state', () => {
    const { result } = renderHook(() => useLoginPage());

    act(() => {
      result.current.setRememberMe(true);
    });

    expect(result.current.rememberMe).toBe(true);
  });

  it('should pass rememberMe as false by default to loginUser', async () => {
    const mockLoginUser = loginUser as jest.MockedFunction<typeof loginUser>;
    mockLoginUser.mockResolvedValue({ mfaRequired: false });

    const { result } = renderHook(() => useLoginPage());

    // Set form data
    act(() => {
      result.current.setEmail('test@example.com');
      result.current.setPassword('password123');
      result.current.setRememberEmail(false);
    });

    // Trigger login
    await act(async () => {
      await result.current.handleLogin();
    });

    expect(mockLoginUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      rememberEmail: false,
      rememberMe: false,
    });
  });

  it('should pass rememberMe as true to loginUser', async () => {
    const mockLoginUser = loginUser as jest.MockedFunction<typeof loginUser>;
    mockLoginUser.mockResolvedValue({ mfaRequired: false });

    const { result } = renderHook(() => useLoginPage());

    // Set rememberMe
    act(() => {
      result.current.setRememberMe(true);
    });

    // Set form data
    act(() => {
      result.current.setEmail('test@example.com');
      result.current.setPassword('password123');
      result.current.setRememberEmail(true);
    });

    // Trigger login
    await act(async () => {
      await result.current.handleLogin();
    });

    expect(mockLoginUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      rememberEmail: true,
      rememberMe: true,
    });
  });

  it('should call confirmMfa with code and password', async () => {
    const mockConfirmMfa = confirmMfa as jest.MockedFunction<typeof confirmMfa>;
    mockConfirmMfa.mockResolvedValue({} as any);

    const { result } = renderHook(() => useLoginPage());

    // Set password
    act(() => {
      result.current.setPassword('password123');
    });

    // Set MFA user
    act(() => {
      result.current.setError(null);
    });

    // Trigger MFA confirmation
    await act(async () => {
      await result.current.handleMfaConfirm('123456');
    });

    expect(mockConfirmMfa).toHaveBeenCalledWith({
      code: '123456',
      password: 'password123',
    });
  });
}); 