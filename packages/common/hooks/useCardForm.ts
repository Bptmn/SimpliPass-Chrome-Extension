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
import { useItemsState } from './useItemsState';
import { useAppStateStore } from './useAppState';
import { useAppRouterContext } from '@common/ui/router/AppRouterProvider';
import { ROUTES } from '@common/ui/router/ROUTES';
import { cardValidationService } from '@common/core/services/validationService';
import { cardFormTransformationService } from '@common/core/services/formTransformationService';
import type { CardFormData } from '@common/core/types/items.types';

// Initial form data
const cardFormInitialData: CardFormData = {
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

export interface UseCardFormReturn {
  // Form state
  formData: CardFormData;
  errors: Partial<Record<keyof CardFormData, string>>;
  isSubmitting: boolean;
  
  // Actions
  updateField: (field: keyof CardFormData, value: string) => void;
  validateField: (field: keyof CardFormData) => void;
  handleSubmit: () => Promise<void>;
  handleFieldChange: (field: keyof CardFormData, value: string) => void;
  handleCardNumberChange: (value: string) => void;
  handleExpirationDateChange: (value: string) => void;
  handleCVVChange: (value: string) => void;
  isFormValid: () => boolean;
}

export const useCardForm = (initialData?: CardFormData): UseCardFormReturn => {
  const user = useAppStateStore(state => state.user);
  const { 
    formData, 
    errors, 
    isSubmitting, 
    updateField, 
    setFieldError, 
    setSubmitting 
  } = useFormState({
    ...cardFormInitialData,
    ...initialData // ✅ Merge with initial data if provided
  });

  const { validateField, validateForm } = useFormValidation(cardValidationService);
  const { addItem } = useItemsState({ user });
  const { navigateTo } = useAppRouterContext();

  // Field validation handler
  const handleFieldValidation = useCallback((field: keyof CardFormData) => {
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
        setFieldError(field as keyof CardFormData, error);
      });
      return;
    }

    setSubmitting(true);
    try {
      // Transform form data to card format
      const { isValid, card, errors: transformErrors } = 
        cardFormTransformationService.validateAndTransformCard(formData);
      
      if (!isValid) {
        // Set validation errors
        Object.entries(transformErrors).forEach(([field, error]) => {
          setFieldError(field as keyof CardFormData, error);
        });
        return;
      }

      if (card) {
        // Add item to vault
        await addItem(card);
        
        // Navigate to success page
        navigateTo(ROUTES.HOME);
      }
    } catch (error) {
      console.error('Failed to submit card form:', error);
    } finally {
      setSubmitting(false);
    }
  }, [formData, validateForm, addItem, navigateTo, setSubmitting, setFieldError]);

  // Reset form (unused - removed)
  // const resetForm = useCallback(() => {
  //   // Reset to initial data
  //   updateField('title', '');
  //   updateField('cardholderName', '');
  //   updateField('cardNumber', '');
  //   updateField('expiryMonth', 1);
  //   updateField('expiryYear', new Date().getFullYear());
  //   updateField('cvv', '');
  //   updateField('cardType', 'visa');
  //   updateField('bankName', '');
  //   updateField('notes', '');
  //   updateField('category', 'bankCards');
  //   updateField('tags', []);
  // }, [updateField]);

  // Clear errors (unused - removed)
  // const clearErrors = useCallback(() => {
  //   Object.keys(errors).forEach(field => {
  //     setFieldError(field as keyof CardFormData, undefined);
  //   });
  // }, [errors, setFieldError]);

  // Field change handler - NO validation on change
  const handleFieldChange = useCallback((field: keyof CardFormData, value: string) => {
    updateField(field, value);
    // Removed: handleFieldValidation(field);
  }, [updateField]);

  // Card number change handler - NO validation on change
  const handleCardNumberChange = useCallback((value: string) => {
    updateField('cardNumber', value);
    // Removed: handleFieldValidation('cardNumber');
  }, [updateField]);

  // Expiration date change handler - NO validation on change
  const handleExpirationDateChange = useCallback((value: string) => {
    updateField('expirationDate', value);
    // Removed: handleFieldValidation('expirationDate');
  }, [updateField]);

  // CVV change handler - NO validation on change
  const handleCVVChange = useCallback((value: string) => {
    updateField('cvv', value);
    // Removed: handleFieldValidation('cvv');
  }, [updateField]);

  // Form validation check
  const isFormValid = useCallback(() => {
    return handleFormValidation();
  }, [handleFormValidation]);

  return {
    formData,
    errors,
    isSubmitting,
    updateField,
    validateField: handleFieldValidation,
    handleSubmit,
    handleFieldChange,
    handleCardNumberChange,
    handleExpirationDateChange,
    handleCVVChange,
    isFormValid
  };
}; 