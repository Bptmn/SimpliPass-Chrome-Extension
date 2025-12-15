// Mock platform configuration before any imports
jest.mock('@common/config/platform', () => ({
  getFirebaseConfig: jest.fn().mockResolvedValue({
    apiKey: 'test-api-key',
    authDomain: 'test.firebaseapp.com',
    projectId: 'test-project',
    storageBucket: 'test.appspot.com',
    messagingSenderId: '123456789',
    appId: 'test-app-id'
  }),
  getCognitoConfig: jest.fn().mockResolvedValue({
    region: 'us-east-1',
    userPoolId: 'test-pool-id',
    userPoolWebClientId: 'test-client-id'
  }),
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddCredential2 } from '../AddCredential2';

// Mock dependencies
jest.mock('@common/hooks/useUser');
jest.mock('@common/hooks/useItemsCRUD');
jest.mock('@common/utils/passwordGenerator');
jest.mock('@common/core/libraries/crypto');
jest.mock('@common/utils/checkPasswordStrength');
jest.mock('../../router/AppRouterProvider');

import { useUser } from '@common/hooks/useUser';
import { useItemsCRUD } from '@common/hooks/useItemsCRUD';
import { passwordGenerator } from '@common/utils/passwordGenerator';
import { generateItemKey } from '@common/core/libraries/crypto';
import { checkPasswordStrength } from '@common/utils/checkPasswordStrength';
import { useAppRouterContext } from '../../router/AppRouterProvider';
import { ROUTES } from '../../router/ROUTES';

const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;
const mockUseItemsCRUD = useItemsCRUD as jest.MockedFunction<typeof useItemsCRUD>;
const mockPasswordGenerator = passwordGenerator as jest.MockedFunction<typeof passwordGenerator>;
const mockGenerateItemKey = generateItemKey as jest.MockedFunction<typeof generateItemKey>;
const mockCheckPasswordStrength = checkPasswordStrength as jest.MockedFunction<typeof checkPasswordStrength>;
const mockUseAppRouterContext = useAppRouterContext as jest.MockedFunction<typeof useAppRouterContext>;

const mockRouter = {
  navigateTo: jest.fn(),
  goBack: jest.fn(),
  resetToHome: jest.fn(),
  currentRoute: ROUTES.ADD_CREDENTIAL_2,
  routeParams: { title: 'Test Credential' },
  isLoading: false,
  error: null,
  user: { id: 'user1', email: 'test@example.com' },
  navigateToLock: jest.fn(),
  setParams: jest.fn(),
  isExtension: true,
  isMobile: false,
};

describe('AddCredential2', () => {
  const mockNavigateTo = jest.fn();
  const mockGoBack = jest.fn();
  const mockAddCredential = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUser.mockReturnValue({ user: { id: 'user1', email: 'test@example.com' }, isLoading: false, error: null });
    mockUseItemsCRUD.mockReturnValue({
      addCredential: mockAddCredential,
      isLoading: false,
      error: null,
      addItem: jest.fn(),
      addBankCard: jest.fn(),
      addSecureNote: jest.fn(),
      editItem: jest.fn(),
      deleteItem: jest.fn(),
      clearError: jest.fn(),
    });
    mockPasswordGenerator.mockReturnValue('GeneratedPassword123!');
    mockGenerateItemKey.mockResolvedValue('mockItemKey');
    mockCheckPasswordStrength.mockReturnValue('perfect');
    mockUseAppRouterContext.mockReturnValue({
      ...mockRouter,
      navigateTo: mockNavigateTo,
      goBack: mockGoBack,
    });
  });

  describe('initialization', () => {
    it('should render with initial title and pre-filled username', () => {
      render(<AddCredential2 title="Test Credential" />);

      expect(screen.getByText('Ajouter un identifiant')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Credential')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('GeneratedPassword123!')).toBeInTheDocument();
    });

    it('should initialize with user email as username', () => {
      render(<AddCredential2 title="Test Credential" />);

      const usernameInput = screen.getByDisplayValue('test@example.com') as HTMLInputElement;
      expect(usernameInput.value).toBe('test@example.com');
    });

    it('should initialize with generated password', () => {
      render(<AddCredential2 title="Test Credential" />);

      const passwordInput = screen.getByDisplayValue('GeneratedPassword123!') as HTMLInputElement;
      expect(passwordInput.value).toBe('GeneratedPassword123!');
    });

    it('should initialize with provided link as URL', () => {
      render(<AddCredential2 title="Test Credential" link="https://example.com" />);

      const urlInput = screen.getByDisplayValue('https://example.com') as HTMLInputElement;
      expect(urlInput.value).toBe('https://example.com');
    });
  });

  describe('form submission', () => {
    it('should navigate to home after successful credential creation', async () => {
      render(<AddCredential2 title="Test Credential" />);

      const saveButton = screen.getByTestId('add-credential-submit-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockAddCredential).toHaveBeenCalledWith(expect.objectContaining({
          title: 'Test Credential',
          username: 'test@example.com',
          password: 'GeneratedPassword123!',
          url: '',
          note: '',
          itemType: 'credential',
        }));
        expect(mockNavigateTo).toHaveBeenCalledWith(ROUTES.HOME);
      });
    });

    it('should handle credential creation errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockAddCredential.mockRejectedValueOnce(new Error('Failed to save'));
      render(<AddCredential2 title="Test Credential" />);
      
      const saveButton = screen.getByTestId('add-credential-submit-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('[AddCredential2] Add failed:', expect.any(Error));
      });
      
      consoleErrorSpy.mockRestore();
    });

    it('should show loading state during submission', () => {
      mockUseItemsCRUD.mockReturnValue({
        ...mockUseItemsCRUD(),
        isLoading: true,
      });
      render(<AddCredential2 title="Test Credential" />);

      const saveButton = screen.getByTestId('add-credential-submit-button');
      expect(saveButton).toBeDisabled();
      expect(saveButton).toHaveTextContent('Ajout en cours...');
    });
  });

  describe('back navigation', () => {
    it('should go back when back button is clicked', () => {
      render(<AddCredential2 title="Test Credential" />);

      const backButton = screen.getByTestId('header-back-button');
      fireEvent.click(backButton);

      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  describe('form interactions', () => {
    it('should update title when title input changes', () => {
      render(<AddCredential2 title="Test Credential" />);

      const titleInput = screen.getByDisplayValue('Test Credential') as HTMLInputElement;
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

      expect(titleInput).toHaveValue('Updated Title');
    });

    it('should update username when username input changes', () => {
      render(<AddCredential2 title="Test Credential" />);

      const usernameInput = screen.getByDisplayValue('test@example.com') as HTMLInputElement;
      fireEvent.change(usernameInput, { target: { value: 'newuser@example.com' } });

      expect(usernameInput).toHaveValue('newuser@example.com');
    });

    it('should update password when password input changes', () => {
      render(<AddCredential2 title="Test Credential" />);

      const passwordInput = screen.getByDisplayValue('GeneratedPassword123!') as HTMLInputElement;
      fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } });

      expect(passwordInput).toHaveValue('NewPassword123!');
    });

    it('should update URL when URL input changes', () => {
      render(<AddCredential2 title="Test Credential" />);

      const urlInput = screen.getByLabelText('URL du site') as HTMLInputElement;
      fireEvent.change(urlInput, { target: { value: 'https://newsite.com' } });

      expect(urlInput).toHaveValue('https://newsite.com');
    });

    it('should update note when note input changes', () => {
      render(<AddCredential2 title="Test Credential" />);

      const noteInput = screen.getByLabelText('Note') as HTMLTextAreaElement;
      fireEvent.change(noteInput, { target: { value: 'This is a test note' } });

      expect(noteInput).toHaveValue('This is a test note');
    });
  });

  describe('password strength', () => {
    it('should display password strength when password is provided', () => {
      render(<AddCredential2 title="Test Credential" />);

      expect(screen.getByText(/Force du mot de passe:/)).toBeInTheDocument();
    });

    it('should update password strength when password changes', () => {
      mockCheckPasswordStrength.mockReturnValue({
        score: 3,
        strength: 'good',
        level: 'Bon',
      });

      render(<AddCredential2 title="Test Credential" />);

      const passwordInput = screen.getByDisplayValue('GeneratedPassword123!') as HTMLInputElement;
      fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } });

      expect(mockCheckPasswordStrength).toHaveBeenCalledWith('NewPassword123!');
    });
  });

  describe('error handling', () => {
    it('should display error banner if there is an error', () => {
      mockUseItemsCRUD.mockReturnValue({
        ...mockUseItemsCRUD(),
        error: 'An error occurred',
      });
      render(<AddCredential2 title="Test Credential" />);
      expect(screen.getByText('An error occurred')).toBeInTheDocument();
    });

    it('should not display error banner if there is no error', () => {
      render(<AddCredential2 title="Test Credential" />);
      const errorBanner = screen.queryByTestId('error-banner');
      expect(errorBanner).not.toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    it('should disable submit button when title is empty', () => {
      render(<AddCredential2 title="" />);

      const saveButton = screen.getByTestId('add-credential-submit-button');
      expect(saveButton).toBeDisabled();
    });

    it('should disable submit button when username is empty', () => {
      render(<AddCredential2 title="Test Credential" />);

      const usernameInput = screen.getByDisplayValue('test@example.com') as HTMLInputElement;
      fireEvent.change(usernameInput, { target: { value: '' } });

      const saveButton = screen.getByTestId('add-credential-submit-button');
      expect(saveButton).toBeDisabled();
    });

    it('should disable submit button when password is empty', () => {
      render(<AddCredential2 title="Test Credential" />);

      const passwordInput = screen.getByDisplayValue('GeneratedPassword123!') as HTMLInputElement;
      fireEvent.change(passwordInput, { target: { value: '' } });

      const saveButton = screen.getByTestId('add-credential-submit-button');
      expect(saveButton).toBeDisabled();
    });

    it('should enable submit button when all required fields are filled', () => {
      render(<AddCredential2 title="Test Credential" />);

      const saveButton = screen.getByTestId('add-credential-submit-button');
      expect(saveButton).not.toBeDisabled();
    });
  });
});