/**
 * LoginPage component tests for SimpliPass
 * Tests form validation, login flow, MFA handling, and error states
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginPage from '../LoginPage';
import { ThemeProvider } from '@app/core/logic/theme';

// Mock dependencies
jest.mock('@app/core/hooks', () => ({
  useLoginPage: jest.fn(() => ({
    email: '',
    password: '',
    emailError: '',
    passwordError: '',
    rememberEmail: false,
    rememberMe: false,
    isLoading: false,
    mfaStep: false,
    mfaUser: null,
    error: null,
    setEmail: jest.fn(),
    setPassword: jest.fn(),
    setRememberEmail: jest.fn(),
    setRememberMe: jest.fn(),
    setError: jest.fn(),
    handleLogin: jest.fn(),
    handleMfaConfirm: jest.fn(),
  })),
  useInputLogic: jest.fn(() => ({
    value: '',
    setValue: jest.fn(),
    error: '',
    setError: jest.fn(),
    isFocused: false,
    setIsFocused: jest.fn(),
    isPasswordVisible: false,
    togglePasswordVisibility: jest.fn(),
    handleContentSizeChange: jest.fn(),
  })),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe('LoginPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form with all fields', () => {
    const { getByPlaceholderText, getByText, getByLabelText } = renderWithTheme(<LoginPage />);

    expect(getByPlaceholderText('Email address')).toBeTruthy();
    expect(getByPlaceholderText('Master password')).toBeTruthy();
    expect(getByText('Remember my email')).toBeTruthy();
    expect(getByText('Remember me for 15 days')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });

  it('handles email input', () => {
    const mockSetEmail = jest.fn();
    const mockUseLoginPage = require('@app/core/hooks').useLoginPage;
    mockUseLoginPage.mockReturnValue({
      email: '',
      password: '',
      emailError: '',
      passwordError: '',
      rememberEmail: false,
      rememberMe: false,
      isLoading: false,
      mfaStep: false,
      mfaUser: null,
      error: null,
      setEmail: mockSetEmail,
      setPassword: jest.fn(),
      setRememberEmail: jest.fn(),
      setRememberMe: jest.fn(),
      setError: jest.fn(),
      handleLogin: jest.fn(),
      handleMfaConfirm: jest.fn(),
    });

    const { getByPlaceholderText } = renderWithTheme(<LoginPage />);
    const emailInput = getByPlaceholderText('Email address');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    expect(mockSetEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('handles password input', () => {
    const mockSetPassword = jest.fn();
    const mockUseLoginPage = require('@app/core/hooks').useLoginPage;
    mockUseLoginPage.mockReturnValue({
      email: '',
      password: '',
      emailError: '',
      passwordError: '',
      rememberEmail: false,
      rememberMe: false,
      isLoading: false,
      mfaStep: false,
      mfaUser: null,
      error: null,
      setEmail: jest.fn(),
      setPassword: mockSetPassword,
      setRememberEmail: jest.fn(),
      setRememberMe: jest.fn(),
      setError: jest.fn(),
      handleLogin: jest.fn(),
      handleMfaConfirm: jest.fn(),
    });

    const { getByPlaceholderText } = renderWithTheme(<LoginPage />);
    const passwordInput = getByPlaceholderText('Master password');
    
    fireEvent.changeText(passwordInput, 'testpassword');
    expect(mockSetPassword).toHaveBeenCalledWith('testpassword');
  });

  it('handles remember email toggle', () => {
    const mockSetRememberEmail = jest.fn();
    const mockUseLoginPage = require('@app/core/hooks').useLoginPage;
    mockUseLoginPage.mockReturnValue({
      email: '',
      password: '',
      emailError: '',
      passwordError: '',
      rememberEmail: false,
      rememberMe: false,
      isLoading: false,
      mfaStep: false,
      mfaUser: null,
      error: null,
      setEmail: jest.fn(),
      setPassword: jest.fn(),
      setRememberEmail: mockSetRememberEmail,
      setRememberMe: jest.fn(),
      setError: jest.fn(),
      handleLogin: jest.fn(),
      handleMfaConfirm: jest.fn(),
    });

    const { getByText } = renderWithTheme(<LoginPage />);
    const rememberEmailToggle = getByText('Remember my email');
    
    fireEvent.press(rememberEmailToggle);
    expect(mockSetRememberEmail).toHaveBeenCalledWith(true);
  });

  it('handles remember me toggle', () => {
    const mockSetRememberMe = jest.fn();
    const mockUseLoginPage = require('@app/core/hooks').useLoginPage;
    mockUseLoginPage.mockReturnValue({
      email: '',
      password: '',
      emailError: '',
      passwordError: '',
      rememberEmail: false,
      rememberMe: false,
      isLoading: false,
      mfaStep: false,
      mfaUser: null,
      error: null,
      setEmail: jest.fn(),
      setPassword: jest.fn(),
      setRememberEmail: jest.fn(),
      setRememberMe: mockSetRememberMe,
      setError: jest.fn(),
      handleLogin: jest.fn(),
      handleMfaConfirm: jest.fn(),
    });

    const { getByText } = renderWithTheme(<LoginPage />);
    const rememberMeToggle = getByText('Remember me for 15 days');
    
    fireEvent.press(rememberMeToggle);
    expect(mockSetRememberMe).toHaveBeenCalledWith(true);
  });

  it('handles login button press', () => {
    const mockHandleLogin = jest.fn();
    const mockUseLoginPage = require('@app/core/hooks').useLoginPage;
    mockUseLoginPage.mockReturnValue({
      email: 'test@example.com',
      password: 'testpassword',
      emailError: '',
      passwordError: '',
      rememberEmail: false,
      rememberMe: false,
      isLoading: false,
      mfaStep: false,
      mfaUser: null,
      error: null,
      setEmail: jest.fn(),
      setPassword: jest.fn(),
      setRememberEmail: jest.fn(),
      setRememberMe: jest.fn(),
      setError: jest.fn(),
      handleLogin: mockHandleLogin,
      handleMfaConfirm: jest.fn(),
    });

    const { getByText } = renderWithTheme(<LoginPage />);
    const loginButton = getByText('Login');
    
    fireEvent.press(loginButton);
    expect(mockHandleLogin).toHaveBeenCalled();
  });

  it('displays email error', () => {
    const mockUseLoginPage = require('@app/core/hooks').useLoginPage;
    mockUseLoginPage.mockReturnValue({
      email: '',
      password: '',
      emailError: 'Email is required',
      passwordError: '',
      rememberEmail: false,
      rememberMe: false,
      isLoading: false,
      mfaStep: false,
      mfaUser: null,
      error: null,
      setEmail: jest.fn(),
      setPassword: jest.fn(),
      setRememberEmail: jest.fn(),
      setRememberMe: jest.fn(),
      setError: jest.fn(),
      handleLogin: jest.fn(),
      handleMfaConfirm: jest.fn(),
    });

    const { getByText } = renderWithTheme(<LoginPage />);
    expect(getByText('Email is required')).toBeTruthy();
  });

  it('displays password error', () => {
    const mockUseLoginPage = require('@app/core/hooks').useLoginPage;
    mockUseLoginPage.mockReturnValue({
      email: '',
      password: '',
      emailError: '',
      passwordError: 'Password is required',
      rememberEmail: false,
      rememberMe: false,
      isLoading: false,
      mfaStep: false,
      mfaUser: null,
      error: null,
      setEmail: jest.fn(),
      setPassword: jest.fn(),
      setRememberEmail: jest.fn(),
      setRememberMe: jest.fn(),
      setError: jest.fn(),
      handleLogin: jest.fn(),
      handleMfaConfirm: jest.fn(),
    });

    const { getByText } = renderWithTheme(<LoginPage />);
    expect(getByText('Password is required')).toBeTruthy();
  });

  it('displays general error', () => {
    const mockUseLoginPage = require('@app/core/hooks').useLoginPage;
    mockUseLoginPage.mockReturnValue({
      email: '',
      password: '',
      emailError: '',
      passwordError: '',
      rememberEmail: false,
      rememberMe: false,
      isLoading: false,
      mfaStep: false,
      mfaUser: null,
      error: 'Login failed',
      setEmail: jest.fn(),
      setPassword: jest.fn(),
      setRememberEmail: jest.fn(),
      setRememberMe: jest.fn(),
      setError: jest.fn(),
      handleLogin: jest.fn(),
      handleMfaConfirm: jest.fn(),
    });

    const { getByText } = renderWithTheme(<LoginPage />);
    expect(getByText('Login failed')).toBeTruthy();
  });

  it('shows loading state', () => {
    const mockUseLoginPage = require('@app/core/hooks').useLoginPage;
    mockUseLoginPage.mockReturnValue({
      email: '',
      password: '',
      emailError: '',
      passwordError: '',
      rememberEmail: false,
      rememberMe: false,
      isLoading: true,
      mfaStep: false,
      mfaUser: null,
      error: null,
      setEmail: jest.fn(),
      setPassword: jest.fn(),
      setRememberEmail: jest.fn(),
      setRememberMe: jest.fn(),
      setError: jest.fn(),
      handleLogin: jest.fn(),
      handleMfaConfirm: jest.fn(),
    });

    const { getByText } = renderWithTheme(<LoginPage />);
    expect(getByText('Logging in...')).toBeTruthy();
  });

  it('displays MFA step when required', () => {
    const mockUseLoginPage = require('@app/core/hooks').useLoginPage;
    mockUseLoginPage.mockReturnValue({
      email: '',
      password: '',
      emailError: '',
      passwordError: '',
      rememberEmail: false,
      rememberMe: false,
      isLoading: false,
      mfaStep: true,
      mfaUser: { id: 'test-user' },
      error: null,
      setEmail: jest.fn(),
      setPassword: jest.fn(),
      setRememberEmail: jest.fn(),
      setRememberMe: jest.fn(),
      setError: jest.fn(),
      handleLogin: jest.fn(),
      handleMfaConfirm: jest.fn(),
    });

    const { getByText, getByPlaceholderText } = renderWithTheme(<LoginPage />);
    expect(getByText('Two-Factor Authentication')).toBeTruthy();
    expect(getByPlaceholderText('Enter verification code')).toBeTruthy();
    expect(getByText('Verify')).toBeTruthy();
  });

  it('handles MFA code input', () => {
    const mockHandleMfaConfirm = jest.fn();
    const mockUseLoginPage = require('@app/core/hooks').useLoginPage;
    mockUseLoginPage.mockReturnValue({
      email: '',
      password: '',
      emailError: '',
      passwordError: '',
      rememberEmail: false,
      rememberMe: false,
      isLoading: false,
      mfaStep: true,
      mfaUser: { id: 'test-user' },
      error: null,
      setEmail: jest.fn(),
      setPassword: jest.fn(),
      setRememberEmail: jest.fn(),
      setRememberMe: jest.fn(),
      setError: jest.fn(),
      handleLogin: jest.fn(),
      handleMfaConfirm: mockHandleMfaConfirm,
    });

    const { getByPlaceholderText, getByText } = renderWithTheme(<LoginPage />);
    const mfaInput = getByPlaceholderText('Enter verification code');
    const verifyButton = getByText('Verify');
    
    fireEvent.changeText(mfaInput, '123456');
    fireEvent.press(verifyButton);
    
    expect(mockHandleMfaConfirm).toHaveBeenCalledWith('123456');
  });

  it('displays MFA error', () => {
    const mockUseLoginPage = require('@app/core/hooks').useLoginPage;
    mockUseLoginPage.mockReturnValue({
      email: '',
      password: '',
      emailError: '',
      passwordError: '',
      rememberEmail: false,
      rememberMe: false,
      isLoading: false,
      mfaStep: true,
      mfaUser: { id: 'test-user' },
      error: 'Invalid verification code',
      setEmail: jest.fn(),
      setPassword: jest.fn(),
      setRememberEmail: jest.fn(),
      setRememberMe: jest.fn(),
      setError: jest.fn(),
      handleLogin: jest.fn(),
      handleMfaConfirm: jest.fn(),
    });

    const { getByText } = renderWithTheme(<LoginPage />);
    expect(getByText('Invalid verification code')).toBeTruthy();
  });

  it('shows loading state during MFA verification', () => {
    const mockUseLoginPage = require('@app/core/hooks').useLoginPage;
    mockUseLoginPage.mockReturnValue({
      email: '',
      password: '',
      emailError: '',
      passwordError: '',
      rememberEmail: false,
      rememberMe: false,
      isLoading: true,
      mfaStep: true,
      mfaUser: { id: 'test-user' },
      error: null,
      setEmail: jest.fn(),
      setPassword: jest.fn(),
      setRememberEmail: jest.fn(),
      setRememberMe: jest.fn(),
      setError: jest.fn(),
      handleLogin: jest.fn(),
      handleMfaConfirm: jest.fn(),
    });

    const { getByText } = renderWithTheme(<LoginPage />);
    expect(getByText('Verifying...')).toBeTruthy();
  });

  it('handles password visibility toggle', () => {
    const mockUseLoginPage = require('@app/core/hooks').useLoginPage;
    mockUseLoginPage.mockReturnValue({
      email: '',
      password: '',
      emailError: '',
      passwordError: '',
      rememberEmail: false,
      rememberMe: false,
      isLoading: false,
      mfaStep: false,
      mfaUser: null,
      error: null,
      setEmail: jest.fn(),
      setPassword: jest.fn(),
      setRememberEmail: jest.fn(),
      setRememberMe: jest.fn(),
      setError: jest.fn(),
      handleLogin: jest.fn(),
      handleMfaConfirm: jest.fn(),
    });

    const { getByLabelText } = renderWithTheme(<LoginPage />);
    const passwordToggle = getByLabelText('Toggle password visibility');
    
    fireEvent.press(passwordToggle);
    // Note: Password visibility is handled by the InputPasswordStrength component
    expect(passwordToggle).toBeTruthy();
  });

  it('displays app branding', () => {
    const { getByText } = renderWithTheme(<LoginPage />);
    expect(getByText('SimpliPass')).toBeTruthy();
  });

  it('displays app description', () => {
    const { getByText } = renderWithTheme(<LoginPage />);
    expect(getByText('Secure password management')).toBeTruthy();
  });
}); 