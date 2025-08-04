import { renderHook } from '@testing-library/react';
import { useFormValidation } from '../useFormValidation';
import type { ValidationResult } from '@common/core/types/errors.types';

// Mock validation service
const createMockValidationService = () => ({
  validateField: jest.fn<ValidationResult, [string, any]>()
});

describe('useFormValidation', () => {
  let mockValidationService: ReturnType<typeof createMockValidationService>;

  beforeEach(() => {
    mockValidationService = createMockValidationService();
  });

  describe('validateField', () => {
    it('should call validation service with correct parameters', () => {
      const mockResult: ValidationResult = { isValid: true, error: undefined };
      mockValidationService.validateField.mockReturnValue(mockResult);

      const { result } = renderHook(() => useFormValidation(mockValidationService));

      const field = 'email';
      const value = 'test@example.com';
      const validationResult = result.current.validateField(field, value);

      expect(mockValidationService.validateField).toHaveBeenCalledWith(field, value);
      expect(validationResult).toEqual(mockResult);
    });

    it('should return validation result from service', () => {
      const mockResult: ValidationResult = { isValid: false, error: 'Invalid email' };
      mockValidationService.validateField.mockReturnValue(mockResult);

      const { result } = renderHook(() => useFormValidation(mockValidationService));

      const validationResult = result.current.validateField('email', 'invalid-email');

      expect(validationResult).toEqual(mockResult);
    });

    it('should handle different field types', () => {
      const { result } = renderHook(() => useFormValidation(mockValidationService));

      result.current.validateField('email', 'test@example.com');
      result.current.validateField('password', 'password123');
      result.current.validateField('username', 'john_doe');

      expect(mockValidationService.validateField).toHaveBeenCalledWith('email', 'test@example.com');
      expect(mockValidationService.validateField).toHaveBeenCalledWith('password', 'password123');
      expect(mockValidationService.validateField).toHaveBeenCalledWith('username', 'john_doe');
    });
  });

  describe('validateForm', () => {
    it('should validate all fields in form data', () => {
      const formData = {
        email: 'test@example.com',
        password: 'password123',
        username: 'john_doe'
      };

      mockValidationService.validateField
        .mockReturnValueOnce({ isValid: true, error: undefined })
        .mockReturnValueOnce({ isValid: false, error: 'Password too short' })
        .mockReturnValueOnce({ isValid: true, error: undefined });

      const { result } = renderHook(() => useFormValidation(mockValidationService));

      const validationResult = result.current.validateForm(formData);

      expect(mockValidationService.validateField).toHaveBeenCalledWith('email', 'test@example.com');
      expect(mockValidationService.validateField).toHaveBeenCalledWith('password', 'password123');
      expect(mockValidationService.validateField).toHaveBeenCalledWith('username', 'john_doe');
      expect(validationResult).toEqual({
        isValid: false,
        errors: { password: 'Password too short' }
      });
    });

    it('should return valid result when all fields are valid', () => {
      const formData = {
        email: 'test@example.com',
        password: 'password123'
      };

      mockValidationService.validateField
        .mockReturnValueOnce({ isValid: true, error: undefined })
        .mockReturnValueOnce({ isValid: true, error: undefined });

      const { result } = renderHook(() => useFormValidation(mockValidationService));

      const validationResult = result.current.validateForm(formData);

      expect(validationResult).toEqual({
        isValid: true,
        errors: {}
      });
    });

    it('should return invalid result when any field is invalid', () => {
      const formData = {
        email: 'invalid-email',
        password: 'password123'
      };

      mockValidationService.validateField
        .mockReturnValueOnce({ isValid: false, error: 'Invalid email' })
        .mockReturnValueOnce({ isValid: true, error: undefined });

      const { result } = renderHook(() => useFormValidation(mockValidationService));

      const validationResult = result.current.validateForm(formData);

      expect(validationResult).toEqual({
        isValid: false,
        errors: { email: 'Invalid email' }
      });
    });

    it('should handle multiple validation errors', () => {
      const formData = {
        email: 'invalid-email',
        password: 'short',
        username: ''
      };

      mockValidationService.validateField
        .mockReturnValueOnce({ isValid: false, error: 'Invalid email' })
        .mockReturnValueOnce({ isValid: false, error: 'Password too short' })
        .mockReturnValueOnce({ isValid: false, error: 'Username required' });

      const { result } = renderHook(() => useFormValidation(mockValidationService));

      const validationResult = result.current.validateForm(formData);

      expect(validationResult).toEqual({
        isValid: false,
        errors: {
          email: 'Invalid email',
          password: 'Password too short',
          username: 'Username required'
        }
      });
    });

    it('should handle empty form data', () => {
      const formData = {};

      const { result } = renderHook(() => useFormValidation(mockValidationService));

      const validationResult = result.current.validateForm(formData);

      expect(validationResult).toEqual({
        isValid: true,
        errors: {}
      });
      expect(mockValidationService.validateField).not.toHaveBeenCalled();
    });
  });

  describe('validateFields', () => {
    it('should validate only specified fields', () => {
      const formData = {
        email: 'test@example.com',
        password: 'password123',
        username: 'john_doe'
      };

      const fieldsToValidate = ['email', 'password'] as const;

      mockValidationService.validateField
        .mockReturnValueOnce({ isValid: true, error: undefined })
        .mockReturnValueOnce({ isValid: false, error: 'Password too short' });

      const { result } = renderHook(() => useFormValidation(mockValidationService));

      const validationResult = result.current.validateFields(formData, fieldsToValidate);

      expect(mockValidationService.validateField).toHaveBeenCalledWith('email', 'test@example.com');
      expect(mockValidationService.validateField).toHaveBeenCalledWith('password', 'password123');
      expect(mockValidationService.validateField).not.toHaveBeenCalledWith('username', 'john_doe');
      expect(validationResult).toEqual({
        isValid: false,
        errors: { password: 'Password too short' }
      });
    });

    it('should return valid result when all specified fields are valid', () => {
      const formData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const fieldsToValidate = ['email', 'password'] as const;

      mockValidationService.validateField
        .mockReturnValueOnce({ isValid: true, error: undefined })
        .mockReturnValueOnce({ isValid: true, error: undefined });

      const { result } = renderHook(() => useFormValidation(mockValidationService));

      const validationResult = result.current.validateFields(formData, fieldsToValidate);

      expect(validationResult).toEqual({
        isValid: true,
        errors: {}
      });
    });

    it('should handle empty fields array', () => {
      const formData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const fieldsToValidate: string[] = [];

      const { result } = renderHook(() => useFormValidation(mockValidationService));

      const validationResult = result.current.validateFields(formData, fieldsToValidate);

      expect(validationResult).toEqual({
        isValid: true,
        errors: {}
      });
      expect(mockValidationService.validateField).not.toHaveBeenCalled();
    });
  });

  describe('isFieldValid', () => {
    it('should return true for valid field', () => {
      mockValidationService.validateField.mockReturnValue({ isValid: true, error: undefined });

      const { result } = renderHook(() => useFormValidation(mockValidationService));

      const isValid = result.current.isFieldValid('email', 'test@example.com');

      expect(mockValidationService.validateField).toHaveBeenCalledWith('email', 'test@example.com');
      expect(isValid).toBe(true);
    });

    it('should return false for invalid field', () => {
      mockValidationService.validateField.mockReturnValue({ isValid: false, error: 'Invalid email' });

      const { result } = renderHook(() => useFormValidation(mockValidationService));

      const isValid = result.current.isFieldValid('email', 'invalid-email');

      expect(isValid).toBe(false);
    });
  });

  describe('getFieldError', () => {
    it('should return error message for invalid field', () => {
      mockValidationService.validateField.mockReturnValue({ isValid: false, error: 'Invalid email' });

      const { result } = renderHook(() => useFormValidation(mockValidationService));

      const error = result.current.getFieldError('email', 'invalid-email');

      expect(mockValidationService.validateField).toHaveBeenCalledWith('email', 'invalid-email');
      expect(error).toBe('Invalid email');
    });

    it('should return null for valid field', () => {
      mockValidationService.validateField.mockReturnValue({ isValid: true, error: undefined });

      const { result } = renderHook(() => useFormValidation(mockValidationService));

      const error = result.current.getFieldError('email', 'test@example.com');

      expect(error).toBe(undefined);
    });

    it('should return error message when error is empty string', () => {
      mockValidationService.validateField.mockReturnValue({ isValid: false, error: '' });

      const { result } = renderHook(() => useFormValidation(mockValidationService));

      const error = result.current.getFieldError('email', 'invalid-email');

      expect(error).toBe('');
    });
  });

  describe('returned values', () => {
    it('should return all expected methods', () => {
      const { result } = renderHook(() => useFormValidation(mockValidationService));

      expect(result.current).toHaveProperty('validateField');
      expect(result.current).toHaveProperty('validateForm');
      expect(result.current).toHaveProperty('validateFields');
      expect(result.current).toHaveProperty('isFieldValid');
      expect(result.current).toHaveProperty('getFieldError');
    });

    it('should return functions for all methods', () => {
      const { result } = renderHook(() => useFormValidation(mockValidationService));

      expect(typeof result.current.validateField).toBe('function');
      expect(typeof result.current.validateForm).toBe('function');
      expect(typeof result.current.validateFields).toBe('function');
      expect(typeof result.current.isFieldValid).toBe('function');
      expect(typeof result.current.getFieldError).toBe('function');
    });
  });

  describe('edge cases', () => {
    it('should handle undefined values', () => {
      mockValidationService.validateField.mockReturnValue({ isValid: false, error: 'Field is required' });

      const { result } = renderHook(() => useFormValidation(mockValidationService));

      const validationResult = result.current.validateField('email', undefined);

      expect(mockValidationService.validateField).toHaveBeenCalledWith('email', undefined);
      expect(validationResult).toEqual({ isValid: false, error: 'Field is required' });
    });

    it('should handle null values', () => {
      mockValidationService.validateField.mockReturnValue({ isValid: false, error: 'Field is required' });

      const { result } = renderHook(() => useFormValidation(mockValidationService));

      const validationResult = result.current.validateField('email', null);

      expect(mockValidationService.validateField).toHaveBeenCalledWith('email', null);
      expect(validationResult).toEqual({ isValid: false, error: 'Field is required' });
    });

    it('should handle empty string values', () => {
      mockValidationService.validateField.mockReturnValue({ isValid: false, error: 'Field is required' });

      const { result } = renderHook(() => useFormValidation(mockValidationService));

      const validationResult = result.current.validateField('email', '');

      expect(mockValidationService.validateField).toHaveBeenCalledWith('email', '');
      expect(validationResult).toEqual({ isValid: false, error: 'Field is required' });
    });

    it('should handle form data with undefined values', () => {
      const formData = {
        email: undefined,
        password: 'password123'
      };

      mockValidationService.validateField
        .mockReturnValueOnce({ isValid: false, error: 'Email is required' })
        .mockReturnValueOnce({ isValid: true, error: undefined });

      const { result } = renderHook(() => useFormValidation(mockValidationService));

      const validationResult = result.current.validateForm(formData);

      expect(validationResult).toEqual({
        isValid: false,
        errors: { email: 'Email is required' }
      });
    });
  });
}); 