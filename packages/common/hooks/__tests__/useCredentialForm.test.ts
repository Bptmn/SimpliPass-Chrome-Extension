/**
 * Tests for useCredentialForm hook
 */

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

import { renderHook, act } from '@testing-library/react';
import { useCredentialForm } from '../useCredentialForm';

// Mock dependencies
jest.mock('../useFormState');
jest.mock('../useFormValidation');
jest.mock('../useItemsState');
jest.mock('../useAppState');
jest.mock('@common/core/services/validationService');
jest.mock('@common/core/services/formTransformationService');

import { useFormState } from '../useFormState';
import { useFormValidation } from '../useFormValidation';
import { useItemsState } from '../useItemsState';
import { useAppStateStore } from '../useAppState';
import { credentialValidationService } from '@common/core/services/validationService';
import { credentialFormTransformationService } from '@common/core/services/formTransformationService';

const mockUseFormState = useFormState as jest.MockedFunction<typeof useFormState>;
const mockUseFormValidation = useFormValidation as jest.MockedFunction<typeof useFormValidation>;
const mockUseItemsState = useItemsState as jest.MockedFunction<typeof useItemsState>;
const mockUseAppStateStore = useAppStateStore as jest.MockedFunction<typeof useAppStateStore>;
const mockCredentialValidationService = credentialValidationService as jest.Mocked<typeof credentialValidationService>;
const mockCredentialFormTransformationService = credentialFormTransformationService as jest.Mocked<typeof credentialFormTransformationService>;

describe('useCredentialForm', () => {
  const mockUser = { uid: 'test-uid', email: 'test@example.com' };
  const mockAddItem = jest.fn();
  const mockValidateField = jest.fn();
  const mockValidateForm = jest.fn();
  const mockSetFieldError = jest.fn();
  const mockSetSubmitting = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useAppStateStore
    mockUseAppStateStore.mockReturnValue(mockUser);

    // Mock useFormState
    mockUseFormState.mockReturnValue({
      formData: {
        title: '',
        username: '',
        password: '',
        url: '',
        notes: '',
        category: 'credentials',
        tags: []
      },
      errors: {},
      isSubmitting: false,
      updateField: jest.fn(),
      setFieldError: mockSetFieldError,
      setSubmitting: mockSetSubmitting,
      updateFields: jest.fn(),
      setFormErrors: jest.fn(),
      clearErrors: jest.fn(),
      clearFieldError: jest.fn(),
      resetForm: jest.fn(),
      setFormDataValue: jest.fn(),
      isDirty: false,
      hasErrors: false,
      getFirstError: jest.fn()
    });

    // Mock useFormValidation
    mockUseFormValidation.mockReturnValue({
      validateField: mockValidateField,
      validateForm: mockValidateForm,
      validateFields: jest.fn(),
      isFieldValid: jest.fn(),
      getFieldError: jest.fn()
    });

    // Mock useItemsState
    mockUseItemsState.mockReturnValue({
      addItem: mockAddItem,
      updateItem: jest.fn(),
      deleteItem: jest.fn(),
      items: [],
      isLoading: false,
      error: null,
      clearError: jest.fn()
    });

    // Mock validation service
    mockCredentialValidationService.validateField = jest.fn();
    mockCredentialFormTransformationService.validateAndTransformCredential = jest.fn();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useCredentialForm());

      expect(result.current.formData).toEqual({
        title: '',
        username: '',
        password: '',
        url: '',
        notes: '',
        category: 'credentials',
        tags: []
      });
      expect(result.current.errors).toEqual({});
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('field change handlers', () => {
    it('should handle field changes without validation', () => {
      const mockUpdateField = jest.fn();
      mockUseFormState.mockReturnValue({
        formData: { title: '', username: '', password: '', url: '', notes: '', category: 'credentials', tags: [] },
        errors: {},
        isSubmitting: false,
        updateField: mockUpdateField,
        setFieldError: mockSetFieldError,
        setSubmitting: mockSetSubmitting,
        updateFields: jest.fn(),
        setFormErrors: jest.fn(),
        clearErrors: jest.fn(),
        clearFieldError: jest.fn(),
        resetForm: jest.fn(),
        setFormDataValue: jest.fn(),
        isDirty: false,
        hasErrors: false,
        getFirstError: jest.fn()
      });

      const { result } = renderHook(() => useCredentialForm());

      act(() => {
        result.current.handleFieldChange('title', 'New Title');
      });

      expect(mockUpdateField).toHaveBeenCalledWith('title', 'New Title');
    });

    it('should handle email changes', () => {
      const mockUpdateField = jest.fn();
      mockUseFormState.mockReturnValue({
        formData: { title: '', username: '', password: '', url: '', notes: '', category: 'credentials', tags: [] },
        errors: {},
        isSubmitting: false,
        updateField: mockUpdateField,
        setFieldError: mockSetFieldError,
        setSubmitting: mockSetSubmitting,
        updateFields: jest.fn(),
        setFormErrors: jest.fn(),
        clearErrors: jest.fn(),
        clearFieldError: jest.fn(),
        resetForm: jest.fn(),
        setFormDataValue: jest.fn(),
        isDirty: false,
        hasErrors: false,
        getFirstError: jest.fn()
      });

      const { result } = renderHook(() => useCredentialForm());

      act(() => {
        result.current.handleEmailChange('test@example.com');
      });

      expect(mockUpdateField).toHaveBeenCalledWith('username', 'test@example.com');
    });

    it('should handle URL changes', () => {
      const mockUpdateField = jest.fn();
      mockUseFormState.mockReturnValue({
        formData: { title: '', username: '', password: '', url: '', notes: '', category: 'credentials', tags: [] },
        errors: {},
        isSubmitting: false,
        updateField: mockUpdateField,
        setFieldError: mockSetFieldError,
        setSubmitting: mockSetSubmitting,
        updateFields: jest.fn(),
        setFormErrors: jest.fn(),
        clearErrors: jest.fn(),
        clearFieldError: jest.fn(),
        resetForm: jest.fn(),
        setFormDataValue: jest.fn(),
        isDirty: false,
        hasErrors: false,
        getFirstError: jest.fn()
      });

      const { result } = renderHook(() => useCredentialForm());

      act(() => {
        result.current.handleURLChange('https://example.com');
      });

      expect(mockUpdateField).toHaveBeenCalledWith('url', 'https://example.com');
    });
  });

  describe('password generation', () => {
    it('should generate password and update field', () => {
      const mockUpdateField = jest.fn();
      mockUseFormState.mockReturnValue({
        formData: { title: '', username: '', password: '', url: '', notes: '', category: 'credentials', tags: [] },
        errors: {},
        isSubmitting: false,
        updateField: mockUpdateField,
        setFieldError: mockSetFieldError,
        setSubmitting: mockSetSubmitting,
        updateFields: jest.fn(),
        setFormErrors: jest.fn(),
        clearErrors: jest.fn(),
        clearFieldError: jest.fn(),
        resetForm: jest.fn(),
        setFormDataValue: jest.fn(),
        isDirty: false,
        hasErrors: false,
        getFirstError: jest.fn()
      });

      const { result } = renderHook(() => useCredentialForm());

      act(() => {
        result.current.handleGeneratePassword();
      });

      expect(mockUpdateField).toHaveBeenCalledWith('password', 'GeneratedPassword123!');
    });
  });

  describe('form validation', () => {
    it('should validate title field correctly', () => {
      mockValidateField.mockReturnValue({ isValid: true, error: undefined });
      
      const { result } = renderHook(() => useCredentialForm());

      act(() => {
        result.current.validateField('title');
      });

      expect(mockValidateField).toHaveBeenCalledWith('title', '');
    });

    it('should check if form is valid', () => {
      mockValidateForm.mockReturnValue({ isValid: true, errors: {} });
      
      const { result } = renderHook(() => useCredentialForm());

      const isValid = result.current.isFormValid();
      expect(isValid).toBe(true);
      expect(mockValidateForm).toHaveBeenCalled();
    });

    it('should check if title is valid', () => {
      mockValidateField.mockReturnValue({ isValid: true, error: undefined });
      
      const { result } = renderHook(() => useCredentialForm());

      const isValid = result.current.isTitleValid();
      expect(isValid).toBe(true);
      expect(mockValidateField).toHaveBeenCalledWith('title', '');
    });
  });

  describe('form submission', () => {
    it('should handle successful form submission', async () => {
      const mockCredential = { id: 'test-id', title: 'Test Credential' };
      mockValidateForm.mockReturnValue({ isValid: true, errors: {} });
      mockCredentialFormTransformationService.validateAndTransformCredential.mockReturnValue({
        isValid: true,
        credential: mockCredential,
        errors: {}
      });
      mockAddItem.mockResolvedValue(undefined);

      const { result } = renderHook(() => useCredentialForm());

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockValidateForm).toHaveBeenCalled();
      expect(mockCredentialFormTransformationService.validateAndTransformCredential).toHaveBeenCalled();
      expect(mockAddItem).toHaveBeenCalledWith(mockCredential);
      expect(mockSetSubmitting).toHaveBeenCalledWith(false);
    });

    it('should handle form validation errors', async () => {
      mockValidateForm.mockReturnValue({ 
        isValid: false, 
        errors: { title: 'Title is required' } 
      });

      const { result } = renderHook(() => useCredentialForm());

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockValidateForm).toHaveBeenCalled();
      expect(mockSetFieldError).toHaveBeenCalledWith('title', 'Title is required');
      expect(mockAddItem).not.toHaveBeenCalled();
    });

    it('should handle transformation errors', async () => {
      mockValidateForm.mockReturnValue({ isValid: true, errors: {} });
      mockCredentialFormTransformationService.validateAndTransformCredential.mockReturnValue({
        isValid: false,
        credential: null,
        errors: { username: 'Username is required' }
      });

      const { result } = renderHook(() => useCredentialForm());

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockSetFieldError).toHaveBeenCalledWith('username', 'Username is required');
      expect(mockAddItem).not.toHaveBeenCalled();
    });

    it('should handle submission errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockValidateForm.mockReturnValue({ isValid: true, errors: {} });
      mockCredentialFormTransformationService.validateAndTransformCredential.mockReturnValue({
        isValid: true,
        credential: { id: 'test-id' },
        errors: {}
      });
      mockAddItem.mockRejectedValue(new Error('Submission failed'));

      const { result } = renderHook(() => useCredentialForm());

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to submit credential form:', expect.any(Error));
      expect(mockSetSubmitting).toHaveBeenCalledWith(false);
      
      consoleSpy.mockRestore();
    });
  });

  describe('form reset', () => {
    it('should reset form to initial state', () => {
      const mockUpdateField = jest.fn();
      mockUseFormState.mockReturnValue({
        formData: { title: 'Test', username: 'user', password: 'pass', url: 'url', notes: 'note', category: 'credentials', tags: [] },
        errors: {},
        isSubmitting: false,
        updateField: mockUpdateField,
        setFieldError: mockSetFieldError,
        setSubmitting: mockSetSubmitting,
        updateFields: jest.fn(),
        setFormErrors: jest.fn(),
        clearErrors: jest.fn(),
        clearFieldError: jest.fn(),
        resetForm: jest.fn(),
        setFormDataValue: jest.fn(),
        isDirty: false,
        hasErrors: false,
        getFirstError: jest.fn()
      });

      const { result } = renderHook(() => useCredentialForm());

      act(() => {
        result.current.handleReset();
      });

      // Should call updateField for each field to reset to initial values
      expect(mockUpdateField).toHaveBeenCalledWith('title', '');
      expect(mockUpdateField).toHaveBeenCalledWith('username', '');
      expect(mockUpdateField).toHaveBeenCalledWith('password', '');
      expect(mockUpdateField).toHaveBeenCalledWith('url', '');
      expect(mockUpdateField).toHaveBeenCalledWith('notes', '');
    });
  });
});
