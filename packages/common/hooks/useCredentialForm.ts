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
import { useItems } from './useItems';
import { usePasswordGenerator } from './usePasswordGenerator';
import { useAppRouterContext } from '@common/ui/router/AppRouterProvider';
import { ROUTES } from '@common/ui/router/ROUTES';
import { credentialValidationService } from '@common/core/services/validationService';
import { credentialFormTransformationService } from '@common/core/services/formTransformationService';
import { validationFormattingService } from '@common/core/services/formattingService';
import type { CredentialFormData } from '@common/core/types/items.types';

// Initial form data for credential forms
const credentialFormInitialData: CredentialFormData = {
  title: '',
  username: '',
  password: '',
  url: '',
  email: '',
  notes: ''
};

export const useCredentialForm = (initialData?: Partial<CredentialFormData>) => {
  const { 
    formData, 
    errors, 
    isSubmitting, 
    updateField, 
    resetForm, 
    setFieldError, 
    setSubmitting 
  } = useFormState({
    ...credentialFormInitialData,
    ...initialData
  });

  const { validateField, validateForm } = useFormValidation(credentialValidationService);
  const { addItem } = useItems();
  const { generatePassword } = usePasswordGenerator();
  const { navigate } = useAppRouterContext();

  /**
   * Handles field changes with real-time validation
   */
  const handleFieldChange = useCallback((field: keyof CredentialFormData, value: string) => {
    updateField(field, value);
    
    // Real-time validation for specific fields
    if (field === 'email' || field === 'url' || field === 'username') {
      const result = validateField(field, value);
      if (!result.isValid) {
        setFieldError(field, result.error);
      } else {
        setFieldError(field, undefined);
      }
    }
  }, [updateField, validateField, setFieldError]);

  /**
   * Generates a new password and updates the form
   */
  const handleGeneratePassword = useCallback(() => {
    const newPassword = generatePassword();
    updateField('password', newPassword);
  }, [generatePassword, updateField]);

  /**
   * Normalizes email input
   */
  const handleEmailChange = useCallback((value: string) => {
    const normalized = validationFormattingService.normalizeEmail(value);
    handleFieldChange('email', normalized);
  }, [handleFieldChange]);

  /**
   * Normalizes URL input
   */
  const handleURLChange = useCallback((value: string) => {
    const normalized = validationFormattingService.normalizeURL(value);
    handleFieldChange('url', normalized);
  }, [handleFieldChange]);

  /**
   * Handles form submission with validation and transformation
   */
  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    
    try {
      // Validate the entire form
      const { isValid, errors: validationErrors } = validateForm(formData);
      if (!isValid) {
        // Set all validation errors
        Object.entries(validationErrors).forEach(([field, error]) => {
          setFieldError(field as keyof CredentialFormData, error);
        });
        return;
      }

      // Transform form data to credential object
      const { isValid: transformValid, credential, errors: transformErrors } = 
        credentialFormTransformationService.validateAndTransformCredential(formData);
      
      if (!transformValid) {
        Object.entries(transformErrors).forEach(([field, error]) => {
          setFieldError(field as keyof CredentialFormData, error);
        });
        return;
      }

      // Add the credential to the vault
      await addItem(credential);
      
      // Navigate to home page
      navigate(ROUTES.HOME);
    } catch (error) {
      console.error('Error submitting credential form:', error);
      // Handle error (could show toast notification)
    } finally {
      setSubmitting(false);
    }
  }, [formData, validateForm, addItem, navigate, setSubmitting, setFieldError]);

  /**
   * Resets the form to initial state
   */
  const handleReset = useCallback(() => {
    resetForm();
  }, [resetForm]);

  /**
   * Checks if the form is valid for submission
   */
  const isFormValid = useCallback(() => {
    const { isValid } = validateForm(formData);
    return isValid && !isSubmitting;
  }, [formData, validateForm, isSubmitting]);

  return {
    // Form state
    formData,
    errors,
    isSubmitting,
    
    // Field handlers
    handleFieldChange,
    handleEmailChange,
    handleURLChange,
    handleGeneratePassword,
    
    // Form handlers
    handleSubmit,
    handleReset,
    
    // Utilities
    isFormValid
  };
}; 