import { renderHook, act } from '@testing-library/react';
import { useCredentialForm } from '../useCredentialForm';
import type { CredentialFormData } from '@common/core/types/items.types';

// Mock dependencies
jest.mock('../useFormState');
jest.mock('../useFormValidation');
jest.mock('../useItems');
jest.mock('../usePasswordGenerator');
jest.mock('@common/ui/router/AppRouterProvider');
jest.mock('@common/core/services/validationService');
jest.mock('@common/core/services/formTransformationService');
jest.mock('@common/core/services/formattingService');
jest.mock('@common/config/platform', () => ({
  getFirebaseConfig: jest.fn().mockResolvedValue({
    apiKey: 'test-api-key',
    authDomain: 'test-project.firebaseapp.com',
    projectId: 'test-project',
    storageBucket: 'test-project.appspot.com',
    messagingSenderId: '123456789',
    appId: 'test-app-id',
    measurementId: 'test-measurement-id',
  }),
  getCognitoConfig: jest.fn().mockResolvedValue({
    region: 'us-east-1',
    userPoolId: 'test-user-pool',
    clientId: 'test-client-id',
  })
}));

// Mock the hooks
const mockUseFormState = {
  formData: {
    title: '',
    username: '',
    password: '',
    url: '',
    email: '',
    notes: ''
  },
  errors: {},
  isSubmitting: false,
  updateField: jest.fn(),
  resetForm: jest.fn(),
  setFieldError: jest.fn(),
  setSubmitting: jest.fn()
};

const mockUseFormValidation = {
  validateField: jest.fn(),
  validateForm: jest.fn()
};

const mockUseItems = {
  addItem: jest.fn()
};

const mockUsePasswordGenerator = {
  generatePassword: jest.fn()
};

const mockUseAppRouterContext = {
  navigate: jest.fn()
};

const mockCredentialValidationService = {
  validateField: jest.fn(),
  validateForm: jest.fn()
};

const mockCredentialFormTransformationService = {
  validateAndTransformCredential: jest.fn()
};

const mockValidationFormattingService = {
  normalizeEmail: jest.fn(),
  normalizeURL: jest.fn()
};

// Setup mocks
jest.mocked(require('../useFormState').useFormState).mockReturnValue(mockUseFormState);
jest.mocked(require('../useFormValidation').useFormValidation).mockReturnValue(mockUseFormValidation);
jest.mocked(require('../useItems').useItems).mockReturnValue(mockUseItems);
jest.mocked(require('../usePasswordGenerator').usePasswordGenerator).mockReturnValue(mockUsePasswordGenerator);
jest.mocked(require('@common/ui/router/AppRouterProvider').useAppRouterContext).mockReturnValue(mockUseAppRouterContext);

// Mock services directly
const mockValidationService = require('@common/core/services/validationService');
const mockFormTransformationService = require('@common/core/services/formTransformationService');
const mockFormattingService = require('@common/core/services/formattingService');

mockValidationService.credentialValidationService = mockCredentialValidationService;
mockFormTransformationService.credentialFormTransformationService = mockCredentialFormTransformationService;
mockFormattingService.validationFormattingService = mockValidationFormattingService;

describe('useCredentialForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock form data
    mockUseFormState.formData = {
      title: '',
      username: '',
      password: '',
      url: '',
      email: '',
      notes: ''
    };
    mockUseFormState.errors = {};
    mockUseFormState.isSubmitting = false;
  });

  describe('initial state', () => {
    it('should initialize with default form data', () => {
      const { result } = renderHook(() => useCredentialForm());

      expect(result.current.formData).toEqual({
        title: '',
        username: '',
        password: '',
        url: '',
        email: '',
        notes: ''
      });
      expect(result.current.errors).toEqual({});
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should initialize with provided initial data', () => {
      const initialData: Partial<CredentialFormData> = {
        title: 'Test Credential',
        username: 'testuser',
        email: 'test@example.com'
      };

      // Mock the useFormState to return the merged data
      mockUseFormState.formData = {
        title: 'Test Credential',
        username: 'testuser',
        password: '',
        url: '',
        email: 'test@example.com',
        notes: ''
      };

      const { result } = renderHook(() => useCredentialForm(initialData));

      expect(result.current.formData.title).toBe('Test Credential');
      expect(result.current.formData.username).toBe('testuser');
      expect(result.current.formData.email).toBe('test@example.com');
    });
  });

  describe('field handling', () => {
    it('should handle field changes', () => {
      const { result } = renderHook(() => useCredentialForm());

      act(() => {
        result.current.handleFieldChange('title', 'New Credential');
      });

      expect(mockUseFormState.updateField).toHaveBeenCalledWith('title', 'New Credential');
    });

    it('should validate email field on change', () => {
      mockUseFormValidation.validateField.mockReturnValue({ isValid: false, error: 'Invalid email' });

      const { result } = renderHook(() => useCredentialForm());

      act(() => {
        result.current.handleFieldChange('email', 'invalid-email');
      });

      expect(mockUseFormValidation.validateField).toHaveBeenCalledWith('email', 'invalid-email');
      expect(mockUseFormState.setFieldError).toHaveBeenCalledWith('email', 'Invalid email');
    });

    it('should clear email error when validation passes', () => {
      mockUseFormValidation.validateField.mockReturnValue({ isValid: true, error: undefined });

      const { result } = renderHook(() => useCredentialForm());

      act(() => {
        result.current.handleFieldChange('email', 'valid@email.com');
      });

      expect(mockUseFormState.setFieldError).toHaveBeenCalledWith('email', undefined);
    });

    it('should validate URL field on change', () => {
      mockUseFormValidation.validateField.mockReturnValue({ isValid: false, error: 'Invalid URL' });

      const { result } = renderHook(() => useCredentialForm());

      act(() => {
        result.current.handleFieldChange('url', 'invalid-url');
      });

      expect(mockUseFormValidation.validateField).toHaveBeenCalledWith('url', 'invalid-url');
      expect(mockUseFormState.setFieldError).toHaveBeenCalledWith('url', 'Invalid URL');
    });

    it('should validate username field on change', () => {
      mockUseFormValidation.validateField.mockReturnValue({ isValid: false, error: 'Username required' });

      const { result } = renderHook(() => useCredentialForm());

      act(() => {
        result.current.handleFieldChange('username', '');
      });

      expect(mockUseFormValidation.validateField).toHaveBeenCalledWith('username', '');
      expect(mockUseFormState.setFieldError).toHaveBeenCalledWith('username', 'Username required');
    });
  });

  describe('password generation', () => {
    it('should generate password and update form', () => {
      const mockPassword = 'generated-password-123';
      mockUsePasswordGenerator.generatePassword.mockReturnValue(mockPassword);

      const { result } = renderHook(() => useCredentialForm());

      act(() => {
        result.current.handleGeneratePassword();
      });

      expect(mockUsePasswordGenerator.generatePassword).toHaveBeenCalled();
      expect(mockUseFormState.updateField).toHaveBeenCalledWith('password', mockPassword);
    });
  });

  describe('email normalization', () => {
    it('should normalize email input', () => {
      const normalizedEmail = 'normalized@email.com';
      mockValidationFormattingService.normalizeEmail.mockReturnValue(normalizedEmail);

      const { result } = renderHook(() => useCredentialForm());

      act(() => {
        result.current.handleEmailChange('  TEST@EMAIL.COM  ');
      });

      expect(mockValidationFormattingService.normalizeEmail).toHaveBeenCalledWith('  TEST@EMAIL.COM  ');
      expect(mockUseFormState.updateField).toHaveBeenCalledWith('email', normalizedEmail);
    });
  });

  describe('URL normalization', () => {
    it('should normalize URL input', () => {
      const normalizedURL = 'https://example.com';
      mockValidationFormattingService.normalizeURL.mockReturnValue(normalizedURL);

      const { result } = renderHook(() => useCredentialForm());

      act(() => {
        result.current.handleURLChange('example.com');
      });

      expect(mockValidationFormattingService.normalizeURL).toHaveBeenCalledWith('example.com');
      expect(mockUseFormState.updateField).toHaveBeenCalledWith('url', normalizedURL);
    });
  });

  describe('form submission', () => {
    it('should handle successful form submission', async () => {
      const mockCredential = {
        id: 'test-id',
        itemType: 'credential' as const,
        title: 'Test Credential',
        username: 'testuser',
        password: 'testpass',
        url: 'https://test.com',
        email: 'test@example.com',
        note: 'Test notes',
        itemKey: 'test-key',
        createdDateTime: new Date(),
        lastUseDateTime: new Date()
      };

      mockUseFormValidation.validateForm.mockReturnValue({ isValid: true, errors: {} });
      mockCredentialFormTransformationService.validateAndTransformCredential.mockReturnValue({
        isValid: true,
        credential: mockCredential,
        errors: {}
      });

      const { result } = renderHook(() => useCredentialForm());

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockUseFormState.setSubmitting).toHaveBeenCalledWith(true);
      expect(mockUseFormValidation.validateForm).toHaveBeenCalledWith(mockUseFormState.formData);
      expect(mockCredentialFormTransformationService.validateAndTransformCredential).toHaveBeenCalledWith(mockUseFormState.formData);
      expect(mockUseItems.addItem).toHaveBeenCalledWith(mockCredential);
      expect(mockUseAppRouterContext.navigate).toHaveBeenCalledWith('HOME');
      expect(mockUseFormState.setSubmitting).toHaveBeenCalledWith(false);
    });

    it('should handle validation errors during submission', async () => {
      const validationErrors = {
        title: 'Title is required',
        username: 'Username is required'
      };

      mockUseFormValidation.validateForm.mockReturnValue({ isValid: false, errors: validationErrors });

      const { result } = renderHook(() => useCredentialForm());

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockUseFormState.setSubmitting).toHaveBeenCalledWith(true);
      expect(mockUseFormValidation.validateForm).toHaveBeenCalledWith(mockUseFormState.formData);
      expect(mockUseFormState.setFieldError).toHaveBeenCalledWith('title', 'Title is required');
      expect(mockUseFormState.setFieldError).toHaveBeenCalledWith('username', 'Username is required');
      expect(mockUseItems.addItem).not.toHaveBeenCalled();
      expect(mockUseAppRouterContext.navigate).not.toHaveBeenCalled();
      expect(mockUseFormState.setSubmitting).toHaveBeenCalledWith(false);
    });

    it('should handle transformation errors during submission', async () => {
      const transformErrors = {
        email: 'Invalid email format',
        url: 'Invalid URL format'
      };

      mockUseFormValidation.validateForm.mockReturnValue({ isValid: true, errors: {} });
      mockCredentialFormTransformationService.validateAndTransformCredential.mockReturnValue({
        isValid: false,
        credential: null,
        errors: transformErrors
      });

      const { result } = renderHook(() => useCredentialForm());

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockUseFormState.setSubmitting).toHaveBeenCalledWith(true);
      expect(mockUseFormValidation.validateForm).toHaveBeenCalledWith(mockUseFormState.formData);
      expect(mockCredentialFormTransformationService.validateAndTransformCredential).toHaveBeenCalledWith(mockUseFormState.formData);
      expect(mockUseFormState.setFieldError).toHaveBeenCalledWith('email', 'Invalid email format');
      expect(mockUseFormState.setFieldError).toHaveBeenCalledWith('url', 'Invalid URL format');
      expect(mockUseItems.addItem).not.toHaveBeenCalled();
      expect(mockUseAppRouterContext.navigate).not.toHaveBeenCalled();
      expect(mockUseFormState.setSubmitting).toHaveBeenCalledWith(false);
    });

    it('should handle submission errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      mockUseFormValidation.validateForm.mockReturnValue({ isValid: true, errors: {} });
      mockCredentialFormTransformationService.validateAndTransformCredential.mockReturnValue({
        isValid: true,
        credential: { id: 'test' },
        errors: {}
      });
      mockUseItems.addItem.mockRejectedValue(new Error('Database error'));

      const { result } = renderHook(() => useCredentialForm());

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error submitting credential form:', expect.any(Error));
      expect(mockUseFormState.setSubmitting).toHaveBeenCalledWith(false);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('form reset', () => {
    it('should reset form to initial state', () => {
      const { result } = renderHook(() => useCredentialForm());

      act(() => {
        result.current.handleReset();
      });

      expect(mockUseFormState.resetForm).toHaveBeenCalled();
    });
  });

  describe('form validation', () => {
    it('should return true when form is valid and not submitting', () => {
      mockUseFormValidation.validateForm.mockReturnValue({ isValid: true, errors: {} });
      mockUseFormState.isSubmitting = false;

      const { result } = renderHook(() => useCredentialForm());

      expect(result.current.isFormValid()).toBe(true);
      expect(mockUseFormValidation.validateForm).toHaveBeenCalledWith(mockUseFormState.formData);
    });

    it('should return false when form is invalid', () => {
      mockUseFormValidation.validateForm.mockReturnValue({ isValid: false, errors: {} });
      mockUseFormState.isSubmitting = false;

      const { result } = renderHook(() => useCredentialForm());

      expect(result.current.isFormValid()).toBe(false);
    });

    it('should return false when form is submitting', () => {
      mockUseFormValidation.validateForm.mockReturnValue({ isValid: true, errors: {} });
      mockUseFormState.isSubmitting = true;

      const { result } = renderHook(() => useCredentialForm());

      expect(result.current.isFormValid()).toBe(false);
    });
  });

  describe('return values', () => {
    it('should return all expected functions and state', () => {
      const { result } = renderHook(() => useCredentialForm());

      expect(result.current).toHaveProperty('formData');
      expect(result.current).toHaveProperty('errors');
      expect(result.current).toHaveProperty('isSubmitting');
      expect(result.current).toHaveProperty('handleFieldChange');
      expect(result.current).toHaveProperty('handleEmailChange');
      expect(result.current).toHaveProperty('handleURLChange');
      expect(result.current).toHaveProperty('handleGeneratePassword');
      expect(result.current).toHaveProperty('handleSubmit');
      expect(result.current).toHaveProperty('handleReset');
      expect(result.current).toHaveProperty('isFormValid');
    });
  });
}); 