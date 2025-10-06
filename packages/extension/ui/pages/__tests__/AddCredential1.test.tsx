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
import { AddCredential1 } from '../AddCredential1';

// Mock dependencies
jest.mock('@common/hooks/useCredentialForm');
jest.mock('@common/core/services/validationService');
jest.mock('../../router/AppRouterProvider');

import { useCredentialForm } from '@common/hooks/useCredentialForm';
import { credentialValidationService } from '@common/core/services/validationService';
import { useAppRouterContext } from '../../router/AppRouterProvider';
import { ROUTES } from '../../router/ROUTES';

const mockUseCredentialForm = useCredentialForm as jest.MockedFunction<typeof useCredentialForm>;
const mockCredentialValidationService = credentialValidationService as jest.Mocked<typeof credentialValidationService>;
const mockUseAppRouterContext = useAppRouterContext as jest.MockedFunction<typeof useAppRouterContext>;

// Mock the validation service methods
jest.mocked(credentialValidationService).validateField = jest.fn();

describe('AddCredential1', () => {
  const mockNavigateTo = jest.fn();
  const mockGoBack = jest.fn();
  const mockSetFieldError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCredentialForm.mockReturnValue({
      formData: { title: '' },
      errors: {},
      isSubmitting: false,
      updateField: jest.fn(),
      setFieldError: mockSetFieldError,
      setSubmitting: jest.fn(),
      handleFieldValidation: jest.fn(),
      handleFormValidation: jest.fn(),
      handleSubmit: jest.fn(),
      handleFieldChange: jest.fn(),
      handleEmailChange: jest.fn(),
      handleURLChange: jest.fn(),
      handleGeneratePassword: jest.fn(),
      handleReset: jest.fn(),
      isFormValid: jest.fn(),
      isTitleValid: jest.fn(),
    });
    mockCredentialValidationService.validateField.mockReturnValue({ isValid: true });
    mockUseAppRouterContext.mockReturnValue({
      currentRoute: ROUTES.ADD_CREDENTIAL_1,
      isLoading: false,
      error: null,
      user: { id: 'user1', email: 'test@example.com' },
      routeParams: {},
      navigateTo: mockNavigateTo,
      navigateToLock: jest.fn(),
      goBack: mockGoBack,
      resetToHome: jest.fn(),
      setParams: jest.fn(),
      isExtension: true,
      isMobile: false,
    });
  });

  describe('rendering', () => {
    it('should render with title input and next button', () => {
      render(<AddCredential1 />);

      expect(screen.getByText('Ajouter un identifiant')).toBeInTheDocument();
      expect(screen.getByLabelText('Nom de l\'identifiant')).toBeInTheDocument();
      expect(screen.getByTestId('add-credential-next-button')).toBeInTheDocument();
      expect(screen.getByTestId('header-back-button')).toBeInTheDocument();
    });

    it('should display current title value', () => {
      mockUseCredentialForm.mockReturnValue({
        ...mockUseCredentialForm(),
        formData: { title: 'Current Title' },
      });
      render(<AddCredential1 />);

      const titleInput = screen.getByDisplayValue('Current Title');
      expect(titleInput).toHaveValue('Current Title');
    });
  });

  describe('form interactions', () => {
    it('should call handleFieldChange when title input changes', () => {
      const mockHandleFieldChange = jest.fn();
      mockUseCredentialForm.mockReturnValue({
        ...mockUseCredentialForm(),
        handleFieldChange: mockHandleFieldChange,
      });
      render(<AddCredential1 />);

      const titleInput = screen.getByLabelText('Nom de l\'identifiant');
      fireEvent.change(titleInput, { target: { value: 'New Title' } });

      expect(mockHandleFieldChange).toHaveBeenCalledWith('title', 'New Title');
    });
  });

  describe('navigation', () => {
    it('should navigate to ADD_CREDENTIAL_2 with title on valid input', () => {
      mockUseCredentialForm.mockReturnValue({
        ...mockUseCredentialForm(),
        formData: { title: 'Valid Title' },
      });
      render(<AddCredential1 />);
      
      const nextButton = screen.getByTestId('add-credential-next-button');
      fireEvent.click(nextButton);

      expect(mockCredentialValidationService.validateField).toHaveBeenCalledWith('title', 'Valid Title');
      expect(mockNavigateTo).toHaveBeenCalledWith(ROUTES.ADD_CREDENTIAL_2, { title: 'Valid Title' });
    });

    it('should show error and not navigate on invalid title input', () => {
      mockUseCredentialForm.mockReturnValue({
        ...mockUseCredentialForm(),
        formData: { title: 'a' }, // Title with content but invalid according to validation
      });
      mockCredentialValidationService.validateField.mockReturnValue({ isValid: false, error: 'Title is too short' });

      render(<AddCredential1 />);
      const nextButton = screen.getByTestId('add-credential-next-button');
      fireEvent.click(nextButton);

      expect(mockCredentialValidationService.validateField).toHaveBeenCalledWith('title', 'a');
      expect(mockSetFieldError).toHaveBeenCalledWith('title', 'Title is too short');
      expect(mockNavigateTo).not.toHaveBeenCalled();
    });

    it('should go back when back button is clicked', () => {
      render(<AddCredential1 />);
      const backButton = screen.getByTestId('header-back-button');
      fireEvent.click(backButton);
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  describe('button states', () => {
    it('should disable next button when title is empty', () => {
      mockUseCredentialForm.mockReturnValue({
        ...mockUseCredentialForm(),
        formData: { title: '' },
      });
      render(<AddCredential1 />);
      
      const nextButton = screen.getByTestId('add-credential-next-button');
      expect(nextButton).toBeDisabled();
    });

    it('should enable next button when title is provided', () => {
      mockUseCredentialForm.mockReturnValue({
        ...mockUseCredentialForm(),
        formData: { title: 'Some Title' },
      });
      render(<AddCredential1 />);
      
      const nextButton = screen.getByTestId('add-credential-next-button');
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe('error handling', () => {
    it('should display error message when validation fails', () => {
      mockUseCredentialForm.mockReturnValue({
        ...mockUseCredentialForm(),
        formData: { title: 'Invalid Title' },
        errors: { title: 'Title is too short' },
      });
      render(<AddCredential1 />);

      expect(screen.getByText('Title is too short')).toBeInTheDocument();
    });

    it('should not display error message when validation passes', () => {
      render(<AddCredential1 />);
      const errorMessage = screen.queryByText('Title is too short');
      expect(errorMessage).not.toBeInTheDocument();
    });
  });
});