/**
 * LockPage Integration Tests
 * 
 * Tests the integration between LockPage component and useReEnterPassword hook.
 * Focuses on password re-entry flow, error handling, and user interactions.
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

import { LockPage } from '../LockPage';
import { useAuth } from '@common/hooks/useAuth';
import { useReEnterPassword } from '@common/hooks/useReEnterPassword';
import type { User } from '@common/types/auth.types';

// Mock the hooks
jest.mock('@common/hooks/useAuth');
jest.mock('@common/hooks/useReEnterPassword');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseReEnterPassword = useReEnterPassword as jest.MockedFunction<typeof useReEnterPassword>;

describe('LockPage Integration Tests', () => {
  const mockLogout = jest.fn();
  const mockReEnterPassword = jest.fn();
  const mockUser: User = {
    uid: 'test-uid',
    email: 'test@example.com',
    emailVerified: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockUseAuth.mockReturnValue({
      user: mockUser,
      logout: mockLogout,
      getCurrentUser: jest.fn(),
      isLoading: false,
      error: null,
      clearError: jest.fn(),
    });

    mockUseReEnterPassword.mockReturnValue({
      reEnterPassword: mockReEnterPassword,
      isLoading: false,
      error: null,
      clearError: jest.fn(),
    });

    // Mock alert
    window.alert = jest.fn();
  });

  describe('Rendering', () => {
    it('should render lock page with all elements', () => {
      render(<LockPage user={mockUser} />);

      expect(screen.getByTestId('lock-page')).toBeInTheDocument();
      expect(screen.getByText('Coffre-fort verrouillé')).toBeInTheDocument();
      expect(screen.getByTestId('lock-submit-button')).toBeInTheDocument();
      expect(screen.getByTestId('lock-cancel-button')).toBeInTheDocument();
    });

    it('should display default reason message when no reason provided', () => {
      render(<LockPage user={mockUser} />);

      expect(screen.getByText('Veuillez entrer votre mot de passe maître pour accéder à vos données.')).toBeInTheDocument();
    });

    it('should display correct message for expired reason', () => {
      render(<LockPage user={mockUser} reason="expired" />);

      expect(screen.getByText('Votre session a expiré. Veuillez entrer votre mot de passe maître pour continuer.')).toBeInTheDocument();
    });

    it('should display correct message for fingerprint_mismatch reason', () => {
      render(<LockPage user={mockUser} reason="fingerprint_mismatch" />);

      expect(screen.getByText('Votre appareil a changé. Veuillez entrer votre mot de passe maître pour continuer.')).toBeInTheDocument();
    });

    it('should display correct message for decryption_failed reason', () => {
      render(<LockPage user={mockUser} reason="decryption_failed" />);

      expect(screen.getByText('Impossible de déverrouiller votre coffre-fort. Veuillez entrer votre mot de passe maître.')).toBeInTheDocument();
    });

    it('should display correct message for corrupted reason', () => {
      render(<LockPage user={mockUser} reason="corrupted" />);

      expect(screen.getByText('Les données de session sont corrompues. Veuillez entrer votre mot de passe maître.')).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should update password state when input changes', () => {
      render(<LockPage user={mockUser} />);

      const passwordInput = screen.getByLabelText('Mot de passe maître');
      fireEvent.change(passwordInput, { target: { value: 'newpassword' } });

      expect(passwordInput).toHaveValue('newpassword');
    });

    it('should call reEnterPassword when submit button is clicked with valid password', async () => {
      mockReEnterPassword.mockResolvedValue(undefined);
      
      render(<LockPage user={mockUser} />);

      const passwordInput = screen.getByLabelText('Mot de passe maître');
      const submitButton = screen.getByTestId('lock-submit-button');

      fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockReEnterPassword).toHaveBeenCalledWith('testpassword');
      });
    });

    it('should disable submit button when password is empty', () => {
      render(<LockPage user={mockUser} />);

      const submitButton = screen.getByTestId('lock-submit-button');
      
      // Button should be disabled when password is empty
      expect(submitButton).toBeDisabled();
      expect(mockReEnterPassword).not.toHaveBeenCalled();
    });

    it('should disable submit button when password is whitespace-only', () => {
      render(<LockPage user={mockUser} />);

      const passwordInput = screen.getByLabelText('Mot de passe maître');
      const submitButton = screen.getByTestId('lock-submit-button');

      fireEvent.change(passwordInput, { target: { value: '   ' } });
      
      // Button should be disabled when password is whitespace-only
      expect(submitButton).toBeDisabled();
      expect(mockReEnterPassword).not.toHaveBeenCalled();
    });

    it('should call logout when cancel button is clicked', async () => {
      mockLogout.mockResolvedValue(undefined);
      
      render(<LockPage user={mockUser} />);

      const cancelButton = screen.getByTestId('lock-cancel-button');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
      });
    });
  });

  describe('Loading State', () => {
    it('should disable submit button and show loading text when isLoading is true', () => {
      mockUseReEnterPassword.mockReturnValue({
        reEnterPassword: mockReEnterPassword,
        isLoading: true,
        error: null,
        clearError: jest.fn(),
      });

      render(<LockPage user={mockUser} />);

      const submitButton = screen.getByTestId('lock-submit-button');
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('Déverrouillage...');
    });

    it('should enable submit button and show normal text when isLoading is false and password is provided', () => {
      render(<LockPage user={mockUser} />);

      const passwordInput = screen.getByLabelText('Mot de passe maître');
      const submitButton = screen.getByTestId('lock-submit-button');

      // Set a password to enable the button
      fireEvent.change(passwordInput, { target: { value: 'testpassword' } });

      expect(submitButton).not.toBeDisabled();
      expect(submitButton).toHaveTextContent('Déverrouiller');
    });

    it('should disable submit button when password is empty', () => {
      render(<LockPage user={mockUser} />);

      const submitButton = screen.getByTestId('lock-submit-button');
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when password has content', () => {
      render(<LockPage user={mockUser} />);

      const passwordInput = screen.getByLabelText('Mot de passe maître');
      const submitButton = screen.getByTestId('lock-submit-button');

      fireEvent.change(passwordInput, { target: { value: 'testpassword' } });

      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should handle reEnterPassword errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockReEnterPassword.mockRejectedValue(new Error('Password validation failed'));
      
      render(<LockPage user={mockUser} />);

      const passwordInput = screen.getByLabelText('Mot de passe maître');
      const submitButton = screen.getByTestId('lock-submit-button');

      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[LockPage] Error during password re-entry:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('should handle logout errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockLogout.mockRejectedValue(new Error('Logout failed'));
      
      render(<LockPage user={mockUser} />);

      const cancelButton = screen.getByTestId('lock-cancel-button');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[LockPage] Error during logout:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Input Properties', () => {
    it('should set password input type to password', () => {
      render(<LockPage user={mockUser} />);

      const passwordInput = screen.getByLabelText('Mot de passe maître');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should set password input as required', () => {
      render(<LockPage user={mockUser} />);

      const passwordInput = screen.getByLabelText('Mot de passe maître');
      expect(passwordInput).toHaveAttribute('required');
    });

    it('should set correct placeholder for password input', () => {
      render(<LockPage user={mockUser} />);

      const passwordInput = screen.getByLabelText('Mot de passe maître');
      expect(passwordInput).toHaveAttribute('placeholder', 'Entrez votre mot de passe maître');
    });
  });
});
