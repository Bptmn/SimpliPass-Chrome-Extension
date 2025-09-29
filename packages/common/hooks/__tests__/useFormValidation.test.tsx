/**
 * Tests for useFormValidation hook
 */

import { renderHook } from '@testing-library/react';
import { useFormValidation } from '../useFormValidation';

// Mock validation service
const createMockValidationService = (validationRules: Record<string, (value: any) => { isValid: boolean; error?: string }>) => ({
  validateField: jest.fn((field: string, value: any) => {
    const validator = validationRules[field];
    if (!validator) {
      return { isValid: true };
    }
    return validator(value);
  })
});

describe('useFormValidation', () => {
  const mockValidationService = createMockValidationService({
    name: (value: string) => ({
      isValid: Boolean(value && value.length > 0),
      error: value && value.length > 0 ? undefined : 'Name is required'
    }),
    email: (value: string) => ({
      isValid: Boolean(value && value.includes('@')),
      error: value && value.includes('@') ? undefined : 'Email is invalid'
    }),
    age: (value: number) => ({
      isValid: Boolean(value && value > 0),
      error: value && value > 0 ? undefined : 'Age must be positive'
    })
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate a single field', () => {
    const { result } = renderHook(() => useFormValidation(mockValidationService));

    const validationResult = result.current.validateField('name', 'John');
    expect(validationResult.isValid).toBe(true);
    expect(validationResult.error).toBeUndefined();

    const invalidResult = result.current.validateField('name', '');
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.error).toBe('Name is required');
  });

  it('should validate entire form', () => {
    const { result } = renderHook(() => useFormValidation(mockValidationService));

    const validFormData = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 25
    };

    const result_valid = result.current.validateForm(validFormData);
    expect(result_valid.isValid).toBe(true);
    expect(result_valid.errors).toEqual({});

    const invalidFormData = {
      name: '',
      email: 'invalid-email',
      age: -1
    };

    const result_invalid = result.current.validateForm(invalidFormData);
    expect(result_invalid.isValid).toBe(false);
    expect(result_invalid.errors).toEqual({
      name: 'Name is required',
      email: 'Email is invalid',
      age: 'Age must be positive'
    });
  });

  it('should validate specific fields', () => {
    const { result } = renderHook(() => useFormValidation(mockValidationService));

    const formData = {
      name: 'John Doe',
      email: 'invalid-email',
      age: 25
    };

    const result_partial = result.current.validateFields(formData, ['name', 'age']);
    expect(result_partial.isValid).toBe(true);
    expect(result_partial.errors).toEqual({});

    const result_invalid = result.current.validateFields(formData, ['email']);
    expect(result_invalid.isValid).toBe(false);
    expect(result_invalid.errors).toEqual({
      email: 'Email is invalid'
    });
  });

  it('should check if field is valid', () => {
    const { result } = renderHook(() => useFormValidation(mockValidationService));

    expect(result.current.isFieldValid('name', 'John')).toBe(true);
    expect(result.current.isFieldValid('name', '')).toBe(false);
    expect(result.current.isFieldValid('email', 'john@example.com')).toBe(true);
    expect(result.current.isFieldValid('email', 'invalid')).toBe(false);
  });

  it('should get field error message', () => {
    const { result } = renderHook(() => useFormValidation(mockValidationService));

    expect(result.current.getFieldError('name', 'John')).toBeNull();
    expect(result.current.getFieldError('name', '')).toBe('Name is required');
    expect(result.current.getFieldError('email', 'john@example.com')).toBeNull();
    expect(result.current.getFieldError('email', 'invalid')).toBe('Email is invalid');
  });

  it('should handle unknown fields gracefully', () => {
    const { result } = renderHook(() => useFormValidation(mockValidationService));

    const validationResult = result.current.validateField('unknownField' as any, 'some value');
    expect(validationResult.isValid).toBe(true);
    expect(validationResult.error).toBeUndefined();
  });

  it('should maintain referential stability of functions', () => {
    const { result, rerender } = renderHook(() => useFormValidation(mockValidationService));

    const firstRender = result.current;
    rerender();

    expect(result.current.validateField).toBe(firstRender.validateField);
    expect(result.current.validateForm).toBe(firstRender.validateForm);
    expect(result.current.validateFields).toBe(firstRender.validateFields);
    expect(result.current.isFieldValid).toBe(firstRender.isFieldValid);
    expect(result.current.getFieldError).toBe(firstRender.getFieldError);
  });

  it('should handle complex validation scenarios', () => {
    const complexValidationService = createMockValidationService({
      password: (value: string) => ({
        isValid: value && value.length >= 8,
        error: value && value.length >= 8 ? undefined : 'Password must be at least 8 characters'
      }),
      confirmPassword: (value: string) => ({
        isValid: value && value.length >= 8,
        error: value && value.length >= 8 ? undefined : 'Confirm password must be at least 8 characters'
      })
    });

    const { result } = renderHook(() => useFormValidation(complexValidationService));

    const formData = {
      password: 'short',
      confirmPassword: 'short'
    };

    const validationResult = result.current.validateForm(formData);
    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toEqual({
      password: 'Password must be at least 8 characters',
      confirmPassword: 'Confirm password must be at least 8 characters'
    });
  });

  it('should handle mixed valid and invalid fields', () => {
    const { result } = renderHook(() => useFormValidation(mockValidationService));

    const formData = {
      name: 'John Doe', // valid
      email: '', // invalid
      age: 25 // valid
    };

    const validationResult = result.current.validateForm(formData);
    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toEqual({
      email: 'Email is invalid'
    });
  });
});
