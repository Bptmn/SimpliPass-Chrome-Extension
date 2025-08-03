// useCardForm.ts
// This hook orchestrates UI state management for card forms using the service layer.
// Responsibilities:
// - Form state management for card forms
// - Integration with validation services
// - Integration with transformation services
// - Navigation after form submission
// - Real-time validation

import { useCallback } from 'react';
import { useFormState } from './useFormState';
import { useFormValidation } from './useFormValidation';
import { useItems } from './useItems';
import { useAppRouterContext } from '@common/ui/router/AppRouterProvider';
import { ROUTES } from '@common/ui/router/ROUTES';
import { cardValidationService } from '@common/core/services/validationService';
import { cardFormTransformationService } from '@common/core/services/formTransformationService';
import { cardFormattingService } from '@common/core/services/formattingService';
import type { CardFormData } from '@common/core/types/items.types';

// Initial form data for card forms
const cardFormInitialData: CardFormData = {
  title: '',
  cardNumber: '',
  cardholderName: '',
  expirationDate: '',
  cvv: '',
  notes: ''
};

export const useCardForm = (initialData?: Partial<CardFormData>) => {
  const { 
    formData, 
    errors, 
    isSubmitting, 
    updateField, 
    resetForm, 
    setFieldError, 
    setSubmitting 
  } = useFormState({
    ...cardFormInitialData,
    ...initialData
  });

  const { validateField, validateForm } = useFormValidation(cardValidationService);
  const { addItem } = useItems();
  const { navigate } = useAppRouterContext();

  /**
   * Handles field changes with real-time validation
   */
  const handleFieldChange = useCallback((field: keyof CardFormData, value: string) => {
    updateField(field, value);
    
    // Real-time validation for specific fields
    if (field === 'cardNumber' || field === 'expirationDate' || field === 'cvv') {
      const result = validateField(field, value);
      if (!result.isValid) {
        setFieldError(field, result.error);
      } else {
        setFieldError(field, undefined);
      }
    }
  }, [updateField, validateField, setFieldError]);

  /**
   * Formats card number as user types
   */
  const handleCardNumberChange = useCallback((value: string) => {
    const formatted = cardFormattingService.formatCardNumber(value);
    handleFieldChange('cardNumber', formatted);
  }, [handleFieldChange]);

  /**
   * Formats expiration date as user types
   */
  const handleExpirationDateChange = useCallback((value: string) => {
    const formatted = cardFormattingService.formatExpirationDate(value);
    handleFieldChange('expirationDate', formatted);
  }, [handleFieldChange]);

  /**
   * Formats CVV (numeric only)
   */
  const handleCVVChange = useCallback((value: string) => {
    const formatted = cardFormattingService.formatCVV(value);
    handleFieldChange('cvv', formatted);
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
          setFieldError(field as keyof CardFormData, error);
        });
        return;
      }

      // Transform form data to card object
      const { isValid: transformValid, card, errors: transformErrors } = 
        cardFormTransformationService.validateAndTransformCard(formData);
      
      if (!transformValid) {
        Object.entries(transformErrors).forEach(([field, error]) => {
          setFieldError(field as keyof CardFormData, error);
        });
        return;
      }

      // Add the card to the vault
      await addItem(card);
      
      // Navigate to home page
      navigate(ROUTES.HOME);
    } catch (error) {
      console.error('Error submitting card form:', error);
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
    handleCardNumberChange,
    handleExpirationDateChange,
    handleCVVChange,
    
    // Form handlers
    handleSubmit,
    handleReset,
    
    // Utilities
    isFormValid
  };
}; 