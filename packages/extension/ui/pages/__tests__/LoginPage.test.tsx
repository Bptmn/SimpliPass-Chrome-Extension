/**
 * LoginPage Integration Tests
 * 
 * Tests the integration between LoginPage component and useLogin hook.
 * Focuses on form submission, error display, and user interactions.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock platform configuration before any imports
jest.mock('@common/config/platform', () => ({
  getFirebaseConfig: jest.fn().mockResolvedValue({
    apiKey: 'test-api-key',
    authDomain: 'test-project.firebaseapp.com',
    projectId: 'test-project',
    storageBucket: 'test-project.appspot.com',
    messagingSenderId: '123456789',
    appId: 'test-app-id',
  }),
  getCognitoConfig: jest.fn().mockResolvedValue({
    userPoolId: 'test-user-pool-id',
    userPoolWebClientId: 'test-client-id',
    region: 'us-east-1',
  }),
}));

import { LoginPage } from '../LoginPage';
import { useLogin } from '@common/hooks/useLogin';

// Mock the useLogin hook
jest.mock('@common/hooks/useLogin');
const mockUseLogin = useLogin as jest.MockedFunction<typeof useLogin>;

describe('LoginPage Integration Tests', () => {
  const mockSetEmail = jest.fn();
  const mockSetPassword = jest.fn();
  const mockHandleLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    mockUseLogin.mockReturnValue({
      email: '',
      password: '',
      emailError: null,
      passwordError: null,
      isLoading: false,
      error: null,
      setEmail: mockSetEmail,
      setPassword: mockSetPassword,
      handleLogin: mockHandleLogin,
      rememberEmail: false,
      setRememberEmail: jest.fn(),
      validateForm: jest.fn(),
      clearError: jest.fn(),
      clearMfaChallenge: jest.fn(),
      mfaChallenge: null,
    });
  });

  describe('Rendering', () => {
    it('should render login form with all elements', () => {
      render(<LoginPage />);

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.getByText('SimpliPass Login')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
    });

    it('should display email and password values from hook', () => {
      mockUseLogin.mockReturnValue({
        email: 'test@example.com',
        password: 'testpassword',
        emailError: null,
        passwordError: null,
        isLoading: false,
        error: null,
        setEmail: mockSetEmail,
        setPassword: mockSetPassword,
        handleLogin: mockHandleLogin,
        rememberEmail: false,
        setRememberEmail: jest.fn(),
        validateForm: jest.fn(),
        clearError: jest.fn(),
        clearMfaChallenge: jest.fn(),
        mfaChallenge: null,
      });

      render(<LoginPage />);

      expect(screen.getByTestId('email-input')).toHaveValue('test@example.com');
      expect(screen.getByTestId('password-input')).toHaveValue('testpassword');
    });
  });

  describe('Form Interactions', () => {
    it('should call setEmail when email input changes', () => {
      render(<LoginPage />);

      const emailInput = screen.getByTestId('email-input');
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } });

      expect(mockSetEmail).toHaveBeenCalledWith('new@example.com');
    });

    it('should call setPassword when password input changes', () => {
      render(<LoginPage />);

      const passwordInput = screen.getByTestId('password-input');
      fireEvent.change(passwordInput, { target: { value: 'newpassword' } });

      expect(mockSetPassword).toHaveBeenCalledWith('newpassword');
    });

    it('should call handleLogin when login button is clicked', () => {
      render(<LoginPage />);

      const loginButton = screen.getByTestId('login-button');
      fireEvent.click(loginButton);

      expect(mockHandleLogin).toHaveBeenCalled();
    });
  });

  describe('Error Display', () => {
    it('should display general error when present', () => {
      mockUseLogin.mockReturnValue({
        email: '',
        password: '',
        emailError: null,
        passwordError: null,
        isLoading: false,
        error: 'Login failed',
        setEmail: mockSetEmail,
        setPassword: mockSetPassword,
        handleLogin: mockHandleLogin,
        rememberEmail: false,
        setRememberEmail: jest.fn(),
        validateForm: jest.fn(),
        clearError: jest.fn(),
        clearMfaChallenge: jest.fn(),
        mfaChallenge: null,
      });

      render(<LoginPage />);

      expect(screen.getByTestId('error-banner')).toBeInTheDocument();
      expect(screen.getByText('Login failed')).toBeInTheDocument();
    });

    it('should display email error when present', () => {
      mockUseLogin.mockReturnValue({
        email: '',
        password: '',
        emailError: 'Invalid email format',
        passwordError: null,
        isLoading: false,
        error: null,
        setEmail: mockSetEmail,
        setPassword: mockSetPassword,
        handleLogin: mockHandleLogin,
        rememberEmail: false,
        setRememberEmail: jest.fn(),
        validateForm: jest.fn(),
        clearError: jest.fn(),
        clearMfaChallenge: jest.fn(),
        mfaChallenge: null,
      });

      render(<LoginPage />);

      const errorMessages = screen.getAllByTestId('error-message');
      expect(errorMessages[0]).toHaveTextContent('Invalid email format');
    });

    it('should display password error when present', () => {
      mockUseLogin.mockReturnValue({
        email: '',
        password: '',
        emailError: null,
        passwordError: 'Password is required',
        isLoading: false,
        error: null,
        setEmail: mockSetEmail,
        setPassword: mockSetPassword,
        handleLogin: mockHandleLogin,
        rememberEmail: false,
        setRememberEmail: jest.fn(),
        validateForm: jest.fn(),
        clearError: jest.fn(),
        clearMfaChallenge: jest.fn(),
        mfaChallenge: null,
      });

      render(<LoginPage />);

      const errorMessages = screen.getAllByTestId('error-message');
      expect(errorMessages[0]).toHaveTextContent('Password is required');
    });

    it('should not display error banner when no general error', () => {
      render(<LoginPage />);

      expect(screen.queryByTestId('error-banner')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should disable login button and show loading text when isLoading is true', () => {
      mockUseLogin.mockReturnValue({
        email: '',
        password: '',
        emailError: null,
        passwordError: null,
        isLoading: true,
        error: null,
        setEmail: mockSetEmail,
        setPassword: mockSetPassword,
        handleLogin: mockHandleLogin,
        rememberEmail: false,
        setRememberEmail: jest.fn(),
        validateForm: jest.fn(),
        clearError: jest.fn(),
        clearMfaChallenge: jest.fn(),
        mfaChallenge: null,
      });

      render(<LoginPage />);

      const loginButton = screen.getByTestId('login-button');
      expect(loginButton).toBeDisabled();
      expect(loginButton).toHaveTextContent('Logging in...');
    });

    it('should enable login button and show normal text when isLoading is false', () => {
      render(<LoginPage />);

      const loginButton = screen.getByTestId('login-button');
      expect(loginButton).not.toBeDisabled();
      expect(loginButton).toHaveTextContent('Login');
    });
  });

  describe('Input Types', () => {
    it('should set password input type to password', () => {
      render(<LoginPage />);

      const passwordInput = screen.getByTestId('password-input');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should set email input type to text (default)', () => {
      render(<LoginPage />);

      const emailInput = screen.getByTestId('email-input');
      expect(emailInput).toHaveAttribute('type', 'text');
    });
  });
});
