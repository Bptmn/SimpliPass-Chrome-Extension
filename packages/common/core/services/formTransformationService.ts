// formTransformationService.ts
// This service contains all business logic for transforming form data to item objects and vice versa.
// Responsibilities:
// - Transform form data to item objects
// - Transform item objects to form data
// - Apply business rules during transformation
// - Generate required fields and IDs

import { generateItemKey } from '@common/utils/crypto';
import type { BankCard, Credential, SecureNote } from '@common/core/types/items.types';
import type { CardFormData, CredentialFormData, SecureNoteFormData } from '@common/core/types/items.types';

// ===== Card Form Transformation Service =====

export const cardFormTransformationService = {
  /**
   * Transforms form data to BankCard object
   */
  transformFormToCard: (formData: CardFormData): BankCard => {
    return {
      id: generateItemKey(),
      type: 'bankCard',
      title: formData.title.trim(),
      cardNumber: formData.cardNumber.replace(/\s/g, ''),
      cardholderName: formData.cardholderName.trim(),
      expirationDate: formData.expirationDate,
      cvv: formData.cvv,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: 'bankCard',
      isFavorite: false,
      notes: formData.notes?.trim() || ''
    };
  },

  /**
   * Transforms BankCard object to form data
   */
  transformCardToForm: (card: BankCard): CardFormData => {
    return {
      title: card.title,
      cardNumber: card.cardNumber,
      cardholderName: card.cardholderName,
      expirationDate: card.expirationDate,
      cvv: card.cvv,
      notes: card.notes || ''
    };
  },

  /**
   * Validates and transforms form data with business rules
   */
  validateAndTransformCard: (formData: CardFormData): { isValid: boolean; card?: BankCard; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    
    // Validate required fields
    if (!formData.title?.trim()) {
      errors.title = 'Card title is required';
    }
    
    if (!formData.cardNumber?.replace(/\s/g, '')) {
      errors.cardNumber = 'Card number is required';
    }
    
    if (!formData.cardholderName?.trim()) {
      errors.cardholderName = 'Cardholder name is required';
    }
    
    if (!formData.expirationDate) {
      errors.expirationDate = 'Expiration date is required';
    }
    
    if (!formData.cvv) {
      errors.cvv = 'CVV is required';
    }
    
    const isValid = Object.keys(errors).length === 0;
    
    if (isValid) {
      const card = cardFormTransformationService.transformFormToCard(formData);
      return { isValid, card, errors };
    }
    
    return { isValid, errors };
  }
};

// ===== Credential Form Transformation Service =====

export const credentialFormTransformationService = {
  /**
   * Transforms form data to Credential object
   */
  transformFormToCredential: (formData: CredentialFormData): Credential => {
    return {
      id: generateItemKey(),
      type: 'credential',
      title: formData.title.trim(),
      username: formData.username.trim(),
      password: formData.password,
      url: formData.url?.trim() || '',
      email: formData.email?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: 'credential',
      isFavorite: false,
      notes: formData.notes?.trim() || ''
    };
  },

  /**
   * Transforms Credential object to form data
   */
  transformCredentialToForm: (credential: Credential): CredentialFormData => {
    return {
      title: credential.title,
      username: credential.username,
      password: credential.password,
      url: credential.url || '',
      email: credential.email || '',
      notes: credential.notes || ''
    };
  },

  /**
   * Validates and transforms form data with business rules
   */
  validateAndTransformCredential: (formData: CredentialFormData): { isValid: boolean; credential?: Credential; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    
    // Validate required fields
    if (!formData.title?.trim()) {
      errors.title = 'Credential title is required';
    }
    
    if (!formData.username?.trim()) {
      errors.username = 'Username is required';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    // Validate optional fields if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (formData.url) {
      try {
        new URL(formData.url.startsWith('http') ? formData.url : `https://${formData.url}`);
      } catch {
        errors.url = 'Invalid URL format';
      }
    }
    
    const isValid = Object.keys(errors).length === 0;
    
    if (isValid) {
      const credential = credentialFormTransformationService.transformFormToCredential(formData);
      return { isValid, credential, errors };
    }
    
    return { isValid, errors };
  }
};

// ===== Secure Note Form Transformation Service =====

export const secureNoteFormTransformationService = {
  /**
   * Transforms form data to SecureNote object
   */
  transformFormToSecureNote: (formData: SecureNoteFormData): SecureNote => {
    return {
      id: generateItemKey(),
      type: 'secureNote',
      title: formData.title.trim(),
      content: formData.content.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: 'secureNote',
      isFavorite: false,
      notes: formData.notes?.trim() || ''
    };
  },

  /**
   * Transforms SecureNote object to form data
   */
  transformSecureNoteToForm: (secureNote: SecureNote): SecureNoteFormData => {
    return {
      title: secureNote.title,
      content: secureNote.content,
      notes: secureNote.notes || ''
    };
  },

  /**
   * Validates and transforms form data with business rules
   */
  validateAndTransformSecureNote: (formData: SecureNoteFormData): { isValid: boolean; secureNote?: SecureNote; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    
    // Validate required fields
    if (!formData.title?.trim()) {
      errors.title = 'Note title is required';
    }
    
    if (!formData.content?.trim()) {
      errors.content = 'Note content is required';
    }
    
    // Validate length constraints
    if (formData.title && formData.title.length > 100) {
      errors.title = 'Title too long (max 100 characters)';
    }
    
    if (formData.content && formData.content.length > 10000) {
      errors.content = 'Content too long (max 10,000 characters)';
    }
    
    const isValid = Object.keys(errors).length === 0;
    
    if (isValid) {
      const secureNote = secureNoteFormTransformationService.transformFormToSecureNote(formData);
      return { isValid, secureNote, errors };
    }
    
    return { isValid, errors };
  }
};

// ===== Generic Form Transformation Service =====

export const genericFormTransformationService = {
  /**
   * Generic method to transform any form data to item
   */
  transformFormToItem: <T extends Record<string, any>>(
    formData: T,
    itemType: 'bankCard' | 'credential' | 'secureNote'
  ): any => {
    switch (itemType) {
      case 'bankCard':
        return cardFormTransformationService.transformFormToCard(formData as CardFormData);
      case 'credential':
        return credentialFormTransformationService.transformFormToCredential(formData as CredentialFormData);
      case 'secureNote':
        return secureNoteFormTransformationService.transformFormToSecureNote(formData as SecureNoteFormData);
      default:
        throw new Error(`Unknown item type: ${itemType}`);
    }
  },

  /**
   * Generic method to transform any item to form data
   */
  transformItemToForm: <T extends Record<string, any>>(
    item: any,
    itemType: 'bankCard' | 'credential' | 'secureNote'
  ): T => {
    switch (itemType) {
      case 'bankCard':
        return cardFormTransformationService.transformCardToForm(item) as T;
      case 'credential':
        return credentialFormTransformationService.transformCredentialToForm(item) as T;
      case 'secureNote':
        return secureNoteFormTransformationService.transformSecureNoteToForm(item) as T;
      default:
        throw new Error(`Unknown item type: ${itemType}`);
    }
  },

  /**
   * Generic method to validate and transform form data
   */
  validateAndTransformForm: <T extends Record<string, any>>(
    formData: T,
    itemType: 'bankCard' | 'credential' | 'secureNote'
  ): { isValid: boolean; item?: any; errors: Record<string, string> } => {
    switch (itemType) {
      case 'bankCard':
        return cardFormTransformationService.validateAndTransformCard(formData as CardFormData);
      case 'credential':
        return credentialFormTransformationService.validateAndTransformCredential(formData as CredentialFormData);
      case 'secureNote':
        return secureNoteFormTransformationService.validateAndTransformSecureNote(formData as SecureNoteFormData);
      default:
        throw new Error(`Unknown item type: ${itemType}`);
    }
  }
};

// ===== Type Definitions =====

export interface CardFormTransformationService {
  transformFormToCard: (formData: CardFormData) => BankCard;
  transformCardToForm: (card: BankCard) => CardFormData;
  validateAndTransformCard: (formData: CardFormData) => { isValid: boolean; card?: BankCard; errors: Record<string, string> };
}

export interface CredentialFormTransformationService {
  transformFormToCredential: (formData: CredentialFormData) => Credential;
  transformCredentialToForm: (credential: Credential) => CredentialFormData;
  validateAndTransformCredential: (formData: CredentialFormData) => { isValid: boolean; credential?: Credential; errors: Record<string, string> };
}

export interface SecureNoteFormTransformationService {
  transformFormToSecureNote: (formData: SecureNoteFormData) => SecureNote;
  transformSecureNoteToForm: (secureNote: SecureNote) => SecureNoteFormData;
  validateAndTransformSecureNote: (formData: SecureNoteFormData) => { isValid: boolean; secureNote?: SecureNote; errors: Record<string, string> };
}

export interface GenericFormTransformationService {
  transformFormToItem: <T extends Record<string, any>>(formData: T, itemType: 'bankCard' | 'credential' | 'secureNote') => any;
  transformItemToForm: <T extends Record<string, any>>(item: any, itemType: 'bankCard' | 'credential' | 'secureNote') => T;
  validateAndTransformForm: <T extends Record<string, any>>(formData: T, itemType: 'bankCard' | 'credential' | 'secureNote') => { isValid: boolean; item?: any; errors: Record<string, string> };
} 