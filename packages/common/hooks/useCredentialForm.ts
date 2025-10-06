// useCredentialForm.ts
// This hook orchestrates UI state management for credential forms using the service layer.
// Responsibilities:
// - Form state management for credential forms
// - Integration with validation services
// - Integration with transformation services
// - Password generation integration
// - Navigation after form submission
// - Real-time validation

import { useCallback } from 'react';
import { useFormState } from './useFormState';
import { useFormValidation } from './useFormValidation';
import { useItemsState } from './useItemsState';
import { useAppStateStore } from './useAppState';
// Router imports removed - navigation should be handled in components
import { credentialValidationService } from '@common/core/services/validationService';
import { credentialFormTransformationService } from '@common/core/services/formTransformationService';
// Removed unused import
import type { CredentialFormData } from '@common/core/types/items.types';

// Initial form data
const credentialFormInitialData: CredentialFormData = {
  title: '',
  username: '',
  password: '',
  url: '',
  notes: '',
  category: 'credentials',
  tags: []
};

export interface UseCredentialFormReturn {
  // Form state
  formData: CredentialFormData;
  errors: Partial<Record<keyof CredentialFormData, string>>;
  isSubmitting: boolean;
  
  // Actions
  updateField: (field: keyof CredentialFormData, value: string) => void;
  validateField: (field: keyof CredentialFormData) => void;
  handleSubmit: () => Promise<void>;
  handleFieldChange: (field: keyof CredentialFormData, value: string) => void;
  handleEmailChange: (value: string) => void;
  handleURLChange: (value: string) => void;
  handleGeneratePassword: () => void;
  handleReset: () => void;
  isFormValid: () => boolean;
  isTitleValid: () => boolean;
}

export const useCredentialForm = (): UseCredentialFormReturn => {
  const user = useAppStateStore(state => state.user);
  const { 
    formData, 
    errors, 
    isSubmitting, 
    updateField, 
    setFieldError, 
    setSubmitting 
  } = useFormState({
    ...credentialFormInitialData,
    // initialData
  });

  const { validateField, validateForm } = useFormValidation(credentialValidationService);
  const { addItem } = useItemsState({ user });
  // Navigation removed - should be handled by components

  // Field validation handler
  const handleFieldValidation = useCallback((field: keyof CredentialFormData) => {
    const value = formData[field];
    const result = validateField(field as string, value);
    
    if (!result.isValid) {
      setFieldError(field, result.error);
    } else {
      setFieldError(field, undefined);
    }
  }, [formData, validateField, setFieldError]);

  // Form validation handler
  const handleFormValidation = useCallback(() => {
    const result = validateForm(formData);
    return result.isValid;
  }, [validateForm, formData]);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    // ✅ Validate all fields when submit button is clicked
    const result = validateForm(formData);
    if (!result.isValid) {
      // Set all validation errors
      Object.entries(result.errors).forEach(([field, error]) => {
        setFieldError(field as keyof CredentialFormData, error);
      });
      return;
    }

    setSubmitting(true);
    try {
      // Transform form data to credential format
      const { isValid, credential, errors: transformErrors } = 
        credentialFormTransformationService.validateAndTransformCredential(formData);
      
      if (!isValid) {
        // Set validation errors
        Object.entries(transformErrors).forEach(([field, error]) => {
          setFieldError(field as keyof CredentialFormData, error);
        });
        return;
      }

      if (credential) {
        // Add item to vault
        await addItem(credential);
        
        // Navigate to success page
        // Navigation should be handled by component
      }
    } catch (error) {
      console.error('Failed to submit credential form:', error);
    } finally {
      setSubmitting(false);
    }
  }, [formData, validateForm, addItem, setSubmitting, setFieldError]);

  // Field change handler - NO validation on change
  const handleFieldChange = useCallback((field: keyof CredentialFormData, value: string) => {
    updateField(field, value);
    // Removed: handleFieldValidation(field);
  }, [updateField]);

  // Email change handler - NO validation on change
  const handleEmailChange = useCallback((value: string) => {
    updateField('username', value);
    // Removed: handleFieldValidation('username');
  }, [updateField]);

  // URL change handler - NO validation on change
  const handleURLChange = useCallback((value: string) => {
    updateField('url', value);
    // Removed: handleFieldValidation('url');
  }, [updateField]);

  // Generate password handler
  const handleGeneratePassword = useCallback(() => {
    // This would typically generate a password and update the field
    const generatedPassword = 'GeneratedPassword123!';
    updateField('password', generatedPassword);
  }, [updateField]);

  // Reset form handler
  const handleReset = useCallback(() => {
    // Reset form to initial state
    Object.keys(credentialFormInitialData).forEach(key => {
      updateField(key as keyof CredentialFormData, credentialFormInitialData[key as keyof CredentialFormData]);
    });
  }, [updateField]);

  // Form validation check
  const isFormValid = useCallback(() => {
    return handleFormValidation();
  }, [handleFormValidation]);

  // Step-specific validation for AddCredential1 (title only)
  const isTitleValid = useCallback(() => {
    const result = validateField('title', formData.title);
    return result.isValid;
  }, [validateField, formData.title]);

  return {
    formData,
    errors,
    isSubmitting,
    updateField,
    validateField: handleFieldValidation,
    handleSubmit,
    handleFieldChange,
    handleEmailChange,
    handleURLChange,
    handleGeneratePassword,
    handleReset,
    isFormValid,
    isTitleValid
  };
}; 