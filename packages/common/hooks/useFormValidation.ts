// useFormValidation.ts
// This hook integrates with validation services to provide form validation functionality.
// Responsibilities:
// - Field validation using validation services
// - Form validation using validation services
// - Real-time validation integration
// - Error state management integration

import { useCallback } from 'react';
import type { ValidationResult } from '@common/core/types/errors.types';

export interface ValidationService<T> {
  validateField: (field: keyof T, value: any) => ValidationResult;
}

export const useFormValidation = <T extends Record<string, any>>(
  validationService: ValidationService<T>
) => {
  /**
   * Validates a single field using the validation service
   */
  const validateField = useCallback((field: keyof T, value: any): ValidationResult => {
    return validationService.validateField(field, value);
  }, [validationService]);

  /**
   * Validates the entire form using the validation service
   */
  const validateForm = useCallback((formData: T): { isValid: boolean; errors: Partial<Record<keyof T, string>> } => {
    const errors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    // Validate each field in the form data
    Object.keys(formData).forEach(key => {
      const field = key as keyof T;
      const value = formData[field];
      const result = validationService.validateField(field, value);
      
      if (!result.isValid) {
        errors[field] = result.error;
        isValid = false;
      }
    });

    return { isValid, errors };
  }, [validationService]);

  /**
   * Validates specific fields
   */
  const validateFields = useCallback((formData: T, fields: (keyof T)[]): { isValid: boolean; errors: Partial<Record<keyof T, string>> } => {
    const errors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    fields.forEach(field => {
      const value = formData[field];
      const result = validationService.validateField(field, value);
      
      if (!result.isValid) {
        errors[field] = result.error;
        isValid = false;
      }
    });

    return { isValid, errors };
  }, [validationService]);

  /**
   * Checks if a field is valid
   */
  const isFieldValid = useCallback((field: keyof T, value: any): boolean => {
    const result = validationService.validateField(field, value);
    return result.isValid;
  }, [validationService]);

  /**
   * Gets error message for a field
   */
  const getFieldError = useCallback((field: keyof T, value: any): string | null => {
    const result = validationService.validateField(field, value);
    return result.error;
  }, [validationService]);

  return {
    validateField,
    validateForm,
    validateFields,
    isFieldValid,
    getFieldError
  };
}; 