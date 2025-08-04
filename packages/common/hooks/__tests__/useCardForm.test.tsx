import { renderHook, act } from '@testing-library/react';
import { useCardForm } from '../useCardForm';
import { useFormState } from '../useFormState';
import { useFormValidation } from '../useFormValidation';
import { useItems } from '../useItems';
import { useAppRouterContext } from '@common/ui/router/AppRouterProvider';
import { ROUTES } from '@common/ui/router/ROUTES';
import { cardValidationService } from '@common/core/services/validationService';
import { cardFormTransformationService } from '@common/core/services/formTransformationService';
import { cardFormattingService } from '@common/core/services/formattingService';
import type { CardFormData } from '@common/core/types/items.types';

// Mock the platform module to avoid import.meta.env issues
jest.mock('@common/config/platform', () => ({
  getFirebaseConfig: jest.fn().mockResolvedValue({
    apiKey: 'test-api-key',
    authDomain: 'test-project.firebaseapp.com',
    projectId: 'test-project',
    appId: 'test-app-id'
  }),
  getCognitoConfig: jest.fn().mockResolvedValue({
    userPoolId: 'test-user-pool-id',
    userPoolClientId: 'test-client-id',
    region: 'us-east-1'
  }),
  validateFirebaseConfig: jest.fn().mockReturnValue(true),
  validateCognitoConfig: jest.fn().mockReturnValue(true),
  getPlatformConfig: jest.fn().mockReturnValue({
    storageKey: 'userSecretKey',
    vaultKey: 'encryptedVault',
    deviceFingerprintKey: 'deviceFingerprint',
    sessionTimeout: 30 * 60 * 1000,
    maxRetryAttempts: 3,
    encryptionAlgorithm: 'AES-256-GCM',
  }),
}));

// Mock dependencies
jest.mock('../useFormState');
jest.mock('../useFormValidation');
jest.mock('../useItems');
jest.mock('@common/ui/router/AppRouterProvider');
jest.mock('@common/core/services/validationService', () => ({
  cardValidationService: {
    validateField: jest.fn(),
    validateForm: jest.fn(),
    validateCardNumber: jest.fn(),
    validateExpirationDate: jest.fn(),
    validateCVV: jest.fn(),
    validateCardholderName: jest.fn(),
    validateCardTitle: jest.fn()
  }
}));

jest.mock('@common/core/services/formTransformationService', () => ({
  cardFormTransformationService: {
    validateAndTransformCard: jest.fn()
  }
}));

jest.mock('@common/core/services/formattingService', () => ({
  cardFormattingService: {
    formatCardNumber: jest.fn(),
    formatExpirationDate: jest.fn(),
    formatCVV: jest.fn()
  }
}));

const mockUseFormState = {
  formData: {
    title: '',
    cardNumber: '',
    cardholderName: '',
    expirationDate: '',
    cvv: '',
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

const mockUseAppRouterContext = {
  navigate: jest.fn()
};

// Get the mocked services
const { cardValidationService: mockCardValidationService } = require('@common/core/services/validationService');
const { cardFormTransformationService: mockCardFormTransformationService } = require('@common/core/services/formTransformationService');
const { cardFormattingService: mockCardFormattingService } = require('@common/core/services/formattingService');

describe('useCardForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    jest.mocked(useFormState).mockReturnValue(mockUseFormState);
    jest.mocked(useFormValidation).mockReturnValue(mockUseFormValidation);
    jest.mocked(useItems).mockReturnValue(mockUseItems);
    jest.mocked(useAppRouterContext).mockReturnValue(mockUseAppRouterContext);
    // Setup service mocks
    mockCardValidationService.validateField.mockReturnValue({ isValid: true, error: null });
    mockCardValidationService.validateForm.mockReturnValue({ isValid: true, errors: {} });
    mockCardFormTransformationService.validateAndTransformCard.mockResolvedValue({ success: true, data: {} });
    mockCardFormattingService.formatCardNumber.mockImplementation((value) => value);
    mockCardFormattingService.formatExpirationDate.mockImplementation((value) => value);
    mockCardFormattingService.formatCVV.mockImplementation((value) => value);
  });

  describe('initialization', () => {
    it('should initialize with default form data when no initial data provided', () => {
      const { result } = renderHook(() => useCardForm());

      expect(useFormState).toHaveBeenCalledWith({
        title: '',
        cardNumber: '',
        cardholderName: '',
        expirationDate: '',
        cvv: '',
        notes: ''
      });
      expect(useFormValidation).toHaveBeenCalledWith(cardValidationService);
      expect(result.current.formData).toEqual(mockUseFormState.formData);
    });

    it('should initialize with merged initial data', () => {
      const initialData = {
        title: 'Test Card',
        cardholderName: 'John Doe'
      };

      renderHook(() => useCardForm(initialData));

      expect(useFormState).toHaveBeenCalledWith({
        title: 'Test Card',
        cardNumber: '',
        cardholderName: 'John Doe',
        expirationDate: '',
        cvv: '',
        notes: ''
      });
    });
  });

  describe('field handling', () => {
    it('should handle regular field changes', () => {
      const { result } = renderHook(() => useCardForm());

      act(() => {
        result.current.handleFieldChange('title', 'New Card');
      });

      expect(mockUseFormState.updateField).toHaveBeenCalledWith('title', 'New Card');
    });

    it('should perform real-time validation for card number', () => {
      mockUseFormValidation.validateField.mockReturnValue({ isValid: false, error: 'Invalid card number' });
      
      const { result } = renderHook(() => useCardForm());

      act(() => {
        result.current.handleFieldChange('cardNumber', '1234');
      });

      expect(mockUseFormState.updateField).toHaveBeenCalledWith('cardNumber', '1234');
      expect(mockUseFormValidation.validateField).toHaveBeenCalledWith('cardNumber', '1234');
      expect(mockUseFormState.setFieldError).toHaveBeenCalledWith('cardNumber', 'Invalid card number');
    });

    it('should clear field error when validation passes', () => {
      mockUseFormValidation.validateField.mockReturnValue({ isValid: true, error: undefined });
      
      const { result } = renderHook(() => useCardForm());

      act(() => {
        result.current.handleFieldChange('cardNumber', '4111111111111111');
      });

      expect(mockUseFormValidation.validateField).toHaveBeenCalledWith('cardNumber', '4111111111111111');
      expect(mockUseFormState.setFieldError).toHaveBeenCalledWith('cardNumber', undefined);
    });

    it('should perform real-time validation for expiration date', () => {
      mockUseFormValidation.validateField.mockReturnValue({ isValid: false, error: 'Invalid date' });
      
      const { result } = renderHook(() => useCardForm());

      act(() => {
        result.current.handleFieldChange('expirationDate', '12/25');
      });

      expect(mockUseFormValidation.validateField).toHaveBeenCalledWith('expirationDate', '12/25');
      expect(mockUseFormState.setFieldError).toHaveBeenCalledWith('expirationDate', 'Invalid date');
    });

    it('should perform real-time validation for CVV', () => {
      mockUseFormValidation.validateField.mockReturnValue({ isValid: false, error: 'Invalid CVV' });
      
      const { result } = renderHook(() => useCardForm());

      act(() => {
        result.current.handleFieldChange('cvv', '123');
      });

      expect(mockUseFormValidation.validateField).toHaveBeenCalledWith('cvv', '123');
      expect(mockUseFormState.setFieldError).toHaveBeenCalledWith('cvv', 'Invalid CVV');
    });
  });

  describe('formatting handlers', () => {
    it('should format card number when handleCardNumberChange is called', () => {
      mockCardFormattingService.formatCardNumber.mockReturnValue('4111 1111 1111 1111');
      
      const { result } = renderHook(() => useCardForm());

      act(() => {
        result.current.handleCardNumberChange('4111111111111111');
      });

      expect(mockCardFormattingService.formatCardNumber).toHaveBeenCalledWith('4111111111111111');
      expect(mockUseFormState.updateField).toHaveBeenCalledWith('cardNumber', '4111 1111 1111 1111');
    });

    it('should format expiration date when handleExpirationDateChange is called', () => {
      mockCardFormattingService.formatExpirationDate.mockReturnValue('12/25');
      
      const { result } = renderHook(() => useCardForm());

      act(() => {
        result.current.handleExpirationDateChange('1225');
      });

      expect(mockCardFormattingService.formatExpirationDate).toHaveBeenCalledWith('1225');
      expect(mockUseFormState.updateField).toHaveBeenCalledWith('expirationDate', '12/25');
    });

    it('should format CVV when handleCVVChange is called', () => {
      mockCardFormattingService.formatCVV.mockReturnValue('123');
      
      const { result } = renderHook(() => useCardForm());

      act(() => {
        result.current.handleCVVChange('1234');
      });

      expect(mockCardFormattingService.formatCVV).toHaveBeenCalledWith('1234');
      expect(mockUseFormState.updateField).toHaveBeenCalledWith('cvv', '123');
    });
  });

  describe('form submission', () => {
    it('should handle successful form submission', async () => {
      const mockCard = {
        id: 'card-1',
        type: 'card',
        title: 'Test Card',
        cardNumber: '4111111111111111',
        cardholderName: 'John Doe',
        expirationDate: '12/25',
        cvv: '123',
        notes: ''
      };

      mockUseFormValidation.validateForm.mockReturnValue({ isValid: true, errors: {} });
      mockCardFormTransformationService.validateAndTransformCard.mockReturnValue({
        isValid: true,
        card: mockCard,
        errors: {}
      });
      mockUseItems.addItem.mockResolvedValue(undefined);

      const { result } = renderHook(() => useCardForm());

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockUseFormState.setSubmitting).toHaveBeenCalledWith(true);
      expect(mockUseFormValidation.validateForm).toHaveBeenCalledWith(mockUseFormState.formData);
      expect(mockCardFormTransformationService.validateAndTransformCard).toHaveBeenCalledWith(mockUseFormState.formData);
      expect(mockUseItems.addItem).toHaveBeenCalledWith(mockCard);
      expect(mockUseAppRouterContext.navigate).toHaveBeenCalledWith(ROUTES.HOME);
      expect(mockUseFormState.setSubmitting).toHaveBeenCalledWith(false);
    });

    it('should handle validation errors during submission', async () => {
      const validationErrors = {
        cardNumber: 'Invalid card number',
        expirationDate: 'Invalid date'
      };

      mockUseFormValidation.validateForm.mockReturnValue({ isValid: false, errors: validationErrors });

      const { result } = renderHook(() => useCardForm());

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockUseFormValidation.validateForm).toHaveBeenCalledWith(mockUseFormState.formData);
      expect(mockUseFormState.setFieldError).toHaveBeenCalledWith('cardNumber', 'Invalid card number');
      expect(mockUseFormState.setFieldError).toHaveBeenCalledWith('expirationDate', 'Invalid date');
      expect(mockUseItems.addItem).not.toHaveBeenCalled();
      expect(mockUseAppRouterContext.navigate).not.toHaveBeenCalled();
      expect(mockUseFormState.setSubmitting).toHaveBeenCalledWith(false);
    });

    it('should handle transformation errors during submission', async () => {
      const transformErrors = {
        cardNumber: 'Invalid card number format'
      };

      mockUseFormValidation.validateForm.mockReturnValue({ isValid: true, errors: {} });
      mockCardFormTransformationService.validateAndTransformCard.mockReturnValue({
        isValid: false,
        card: null,
        errors: transformErrors
      });

      const { result } = renderHook(() => useCardForm());

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockCardFormTransformationService.validateAndTransformCard).toHaveBeenCalledWith(mockUseFormState.formData);
      expect(mockUseFormState.setFieldError).toHaveBeenCalledWith('cardNumber', 'Invalid card number format');
      expect(mockUseItems.addItem).not.toHaveBeenCalled();
      expect(mockUseAppRouterContext.navigate).not.toHaveBeenCalled();
      expect(mockUseFormState.setSubmitting).toHaveBeenCalledWith(false);
    });

    it('should handle errors during submission', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockUseFormValidation.validateForm.mockReturnValue({ isValid: true, errors: {} });
      mockCardFormTransformationService.validateAndTransformCard.mockReturnValue({
        isValid: true,
        card: { id: 'card-1', type: 'card' },
        errors: {}
      });
      mockUseItems.addItem.mockRejectedValue(new Error('Database error'));

      const { result } = renderHook(() => useCardForm());

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Error submitting card form:', expect.any(Error));
      expect(mockUseFormState.setSubmitting).toHaveBeenCalledWith(false);
      
      consoleSpy.mockRestore();
    });
  });

  describe('form utilities', () => {
    it('should reset form when handleReset is called', () => {
      const { result } = renderHook(() => useCardForm());

      act(() => {
        result.current.handleReset();
      });

      expect(mockUseFormState.resetForm).toHaveBeenCalled();
    });

    it('should return form validity status', () => {
      mockUseFormValidation.validateForm.mockReturnValue({ isValid: true, errors: {} });
      
      const { result } = renderHook(() => useCardForm());

      const isValid = result.current.isFormValid();

      expect(mockUseFormValidation.validateForm).toHaveBeenCalledWith(mockUseFormState.formData);
      expect(isValid).toBe(true);
    });

    it('should return false when form is invalid', () => {
      mockUseFormValidation.validateForm.mockReturnValue({ isValid: false, errors: {} });
      
      const { result } = renderHook(() => useCardForm());

      const isValid = result.current.isFormValid();

      expect(isValid).toBe(false);
    });

    it('should return false when form is submitting', () => {
      mockUseFormState.isSubmitting = true;
      mockUseFormValidation.validateForm.mockReturnValue({ isValid: true, errors: {} });
      
      const { result } = renderHook(() => useCardForm());

      const isValid = result.current.isFormValid();

      expect(isValid).toBe(false);
    });
  });

  describe('returned values', () => {
    it('should return all expected properties and methods', () => {
      const { result } = renderHook(() => useCardForm());

      expect(result.current).toHaveProperty('formData');
      expect(result.current).toHaveProperty('errors');
      expect(result.current).toHaveProperty('isSubmitting');
      expect(result.current).toHaveProperty('handleFieldChange');
      expect(result.current).toHaveProperty('handleCardNumberChange');
      expect(result.current).toHaveProperty('handleExpirationDateChange');
      expect(result.current).toHaveProperty('handleCVVChange');
      expect(result.current).toHaveProperty('handleSubmit');
      expect(result.current).toHaveProperty('handleReset');
      expect(result.current).toHaveProperty('isFormValid');
    });
  });
}); 