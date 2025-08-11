// useFormState.ts
// This hook manages UI state for forms across the application.
// Responsibilities:
// - Form data state management
// - Error state management
// - Loading/submitting state management
// - Field update handlers
// - Form reset functionality

import { useState, useCallback } from 'react';

export const useFormState = <T extends Record<string, any>>(
  initialData: T
) => {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  /**
   * Updates a single field in the form
   */
  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Removed: Clear error when user starts typing
    // Errors should only be cleared when validation is explicitly triggered
  }, [setFormData]);

  /**
   * Updates multiple fields at once
   */
  const updateFields = useCallback((updates: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
    
    // Removed: Clear errors for updated fields
    // Errors should only be cleared when validation is explicitly triggered
  }, [setFormData]);

  /**
   * Sets a specific error for a field
   */
  const setFieldError = useCallback((field: keyof T, error: string | undefined) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, [setErrors]);

  /**
   * Sets multiple errors at once
   */
  const setFormErrors = useCallback((newErrors: Partial<Record<keyof T, string>>) => {
    setErrors(newErrors);
  }, [setErrors]);

  /**
   * Clears all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, [setErrors]);

  /**
   * Clears error for a specific field
   */
  const clearFieldError = useCallback((field: keyof T) => {
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, [setErrors]);

  /**
   * Resets the form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setIsSubmitting(false);
    setIsDirty(false);
  }, [initialData, setFormData, setErrors]);

  /**
   * Sets the form data to a new value
   */
  const setFormDataValue = useCallback((newData: T) => {
    setFormData(newData);
    setIsDirty(true);
  }, [setFormData]);

  /**
   * Sets the submitting state
   */
  const setSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, [setIsSubmitting]);

  /**
   * Checks if the form has any errors
   */
  const hasErrors = useCallback(() => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  /**
   * Gets the first error message
   */
  const getFirstError = useCallback(() => {
    const firstErrorKey = Object.keys(errors)[0] as keyof T;
    return firstErrorKey ? errors[firstErrorKey] : null;
  }, [errors]);

  return {
    // State
    formData,
    errors,
    isSubmitting,
    isDirty,
    
    // Actions
    updateField,
    updateFields,
    setFieldError,
    setFormErrors,
    clearErrors,
    clearFieldError,
    resetForm,
    setFormDataValue,
    setSubmitting,
    
    // Utilities
    hasErrors,
    getFirstError
  };
}; 