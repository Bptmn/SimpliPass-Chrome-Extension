/**
 * useFormState Hook - Layer 1: UI Layer
 * 
 * Generic form state management with error handling:
 * - Form data state management
 * - Error state management
 * - Loading/submitting state management
 * - Field update handlers
 * - Form reset functionality
 * 
 * Pure UI state management only.
 */

import { useState, useCallback } from 'react';

export interface UseFormStateReturn<T> {
  // State
  formData: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isDirty: boolean;
  
  // Actions
  updateField: (field: keyof T, value: any) => void;
  updateFields: (updates: Partial<T>) => void;
  setFieldError: (field: keyof T, error: string | undefined) => void;
  setFormErrors: (newErrors: Partial<Record<keyof T, string>>) => void;
  clearErrors: () => void;
  clearFieldError: (field: keyof T) => void;
  resetForm: () => void;
  setFormDataValue: (newData: T) => void;
  setSubmitting: (submitting: boolean) => void;
  
  // Utilities
  hasErrors: () => boolean;
  getFirstError: () => string | null;
}

export const useFormState = <T extends Record<string, any>>(
  initialData: T
): UseFormStateReturn<T> => {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // ✅ Update a single field
  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  // ✅ Update multiple fields at once
  const updateFields = useCallback((updates: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
    
    // Clear errors for updated fields
    const updatedFields = Object.keys(updates) as (keyof T)[];
    const newErrors = { ...errors };
    updatedFields.forEach(field => {
      if (newErrors[field]) {
        delete newErrors[field];
      }
    });
    setErrors(newErrors);
  }, [errors]);

  // ✅ Set a specific error for a field
  const setFieldError = useCallback((field: keyof T, error: string | undefined) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  // ✅ Set multiple errors at once
  const setFormErrors = useCallback((newErrors: Partial<Record<keyof T, string>>) => {
    setErrors(newErrors);
  }, []);

  // ✅ Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // ✅ Clear error for a specific field
  const clearFieldError = useCallback((field: keyof T) => {
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  // ✅ Reset the form to initial state
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setIsSubmitting(false);
    setIsDirty(false);
  }, [initialData]);

  // ✅ Set the form data to a new value
  const setFormDataValue = useCallback((newData: T) => {
    setFormData(newData);
    setIsDirty(true);
  }, []);

  // ✅ Set the submitting state
  const setSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  // ✅ Check if the form has any errors
  const hasErrors = useCallback(() => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  // ✅ Get the first error message
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