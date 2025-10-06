/**
 * Tests for useCardForm hook
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
import { useCardForm } from '../useCardForm';

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
import { cardValidationService } from '@common/core/services/validationService';
import { cardFormTransformationService } from '@common/core/services/formTransformationService';

const mockUseFormState = useFormState as jest.MockedFunction<typeof useFormState>;
const mockUseFormValidation = useFormValidation as jest.MockedFunction<typeof useFormValidation>;
const mockUseItemsState = useItemsState as jest.MockedFunction<typeof useItemsState>;
const mockUseAppStateStore = useAppStateStore as jest.MockedFunction<typeof useAppStateStore>;
const mockCardValidationService = cardValidationService as jest.Mocked<typeof cardValidationService>;
const mockCardFormTransformationService = cardFormTransformationService as jest.Mocked<typeof cardFormTransformationService>;

describe('useCardForm', () => {
  const mockUser = { uid: 'test-uid', email: 'test@example.com' };
  const mockAddItem = jest.fn();
  const mockValidateField = jest.fn();
  const mockValidateForm = jest.fn();
  const mockSetFieldError = jest.fn();
  const mockSetSubmitting = jest.fn();

  const defaultFormData = {
    title: '',
    cardholderName: '',
    cardNumber: '',
    expirationDate: '',
    expiryMonth: 1,
    expiryYear: new Date().getFullYear(),
    cvv: '',
    cardType: 'unknown',
    bankName: '',
    notes: '',
    category: 'cards',
    tags: []
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useAppStateStore
    mockUseAppStateStore.mockReturnValue(mockUser);

    // Mock useFormState
    mockUseFormState.mockReturnValue({
      formData: defaultFormData,
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
    mockCardValidationService.validateField = jest.fn();
    mockCardFormTransformationService.validateAndTransformCard = jest.fn();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useCardForm());

      expect(result.current.formData).toEqual(defaultFormData);
      expect(result.current.errors).toEqual({});
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should merge with initial data when provided', () => {
      const initialData = {
        title: 'Test Card',
        cardholderName: 'John Doe',
        cardNumber: '1234567890123456',
        expirationDate: '12/25',
        expiryMonth: 12,
        expiryYear: 2025,
        cvv: '123',
        cardType: 'visa',
        bankName: 'Test Bank',
        notes: 'Test note',
        category: 'cards' as const,
        tags: []
      };

      mockUseFormState.mockReturnValue({
        formData: { ...defaultFormData, ...initialData },
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

      const { result } = renderHook(() => useCardForm(initialData));

      expect(result.current.formData.title).toBe('Test Card');
      expect(result.current.formData.cardholderName).toBe('John Doe');
    });
  });

  describe('field change handlers', () => {
    it('should handle field changes without validation', () => {
      const mockUpdateField = jest.fn();
      mockUseFormState.mockReturnValue({
        formData: defaultFormData,
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

      const { result } = renderHook(() => useCardForm());

      act(() => {
        result.current.handleFieldChange('title', 'New Card');
      });

      expect(mockUpdateField).toHaveBeenCalledWith('title', 'New Card');
    });

    it('should handle card number changes', () => {
      const mockUpdateField = jest.fn();
      mockUseFormState.mockReturnValue({
        formData: defaultFormData,
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

      const { result } = renderHook(() => useCardForm());

      act(() => {
        result.current.handleCardNumberChange('1234567890123456');
      });

      expect(mockUpdateField).toHaveBeenCalledWith('cardNumber', '1234567890123456');
    });

    it('should handle expiration date changes', () => {
      const mockUpdateField = jest.fn();
      mockUseFormState.mockReturnValue({
        formData: defaultFormData,
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

      const { result } = renderHook(() => useCardForm());

      act(() => {
        result.current.handleExpirationDateChange('12/25');
      });

      expect(mockUpdateField).toHaveBeenCalledWith('expirationDate', '12/25');
    });

    it('should handle CVV changes', () => {
      const mockUpdateField = jest.fn();
      mockUseFormState.mockReturnValue({
        formData: defaultFormData,
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

      const { result } = renderHook(() => useCardForm());

      act(() => {
        result.current.handleCVVChange('123');
      });

      expect(mockUpdateField).toHaveBeenCalledWith('cvv', '123');
    });
  });

  describe('form validation', () => {
    it('should validate field correctly', () => {
      mockValidateField.mockReturnValue({ isValid: true, error: undefined });
      
      const { result } = renderHook(() => useCardForm());

      act(() => {
        result.current.validateField('title');
      });

      expect(mockValidateField).toHaveBeenCalledWith('title', '');
    });

    it('should check if form is valid', () => {
      mockValidateForm.mockReturnValue({ isValid: true, errors: {} });
      
      const { result } = renderHook(() => useCardForm());

      const isValid = result.current.isFormValid();
      expect(isValid).toBe(true);
      expect(mockValidateForm).toHaveBeenCalled();
    });
  });

  describe('form submission', () => {
    it('should handle successful form submission', async () => {
      const mockCard = { id: 'test-id', title: 'Test Card' };
      mockValidateForm.mockReturnValue({ isValid: true, errors: {} });
      mockCardFormTransformationService.validateAndTransformCard.mockReturnValue({
        isValid: true,
        card: mockCard,
        errors: {}
      });
      mockAddItem.mockResolvedValue(undefined);

      const { result } = renderHook(() => useCardForm());

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockValidateForm).toHaveBeenCalled();
      expect(mockCardFormTransformationService.validateAndTransformCard).toHaveBeenCalled();
      expect(mockAddItem).toHaveBeenCalledWith(mockCard);
      expect(mockSetSubmitting).toHaveBeenCalledWith(false);
    });

    it('should handle form validation errors', async () => {
      mockValidateForm.mockReturnValue({ 
        isValid: false, 
        errors: { title: 'Title is required' } 
      });

      const { result } = renderHook(() => useCardForm());

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockValidateForm).toHaveBeenCalled();
      expect(mockSetFieldError).toHaveBeenCalledWith('title', 'Title is required');
      expect(mockAddItem).not.toHaveBeenCalled();
    });

    it('should handle transformation errors', async () => {
      mockValidateForm.mockReturnValue({ isValid: true, errors: {} });
      mockCardFormTransformationService.validateAndTransformCard.mockReturnValue({
        isValid: false,
        card: null,
        errors: { cardNumber: 'Invalid card number' }
      });

      const { result } = renderHook(() => useCardForm());

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockSetFieldError).toHaveBeenCalledWith('cardNumber', 'Invalid card number');
      expect(mockAddItem).not.toHaveBeenCalled();
    });

    it('should handle submission errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockValidateForm.mockReturnValue({ isValid: true, errors: {} });
      mockCardFormTransformationService.validateAndTransformCard.mockReturnValue({
        isValid: true,
        card: { id: 'test-id' },
        errors: {}
      });
      mockAddItem.mockRejectedValue(new Error('Submission failed'));

      const { result } = renderHook(() => useCardForm());

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to submit card form:', expect.any(Error));
      expect(mockSetSubmitting).toHaveBeenCalledWith(false);
      
      consoleSpy.mockRestore();
    });
  });
});
