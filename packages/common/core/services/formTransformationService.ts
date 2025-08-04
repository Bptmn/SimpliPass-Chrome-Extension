// formTransformationService.ts
// This service contains all business logic for transforming form data to item objects and vice versa.
// Responsibilities:
// - Transform form data to item objects
// - Transform item objects to form data
// - Apply business rules during transformation
// - Generate required fields and IDs

import { generateItemKey } from '@common/utils/crypto';
import { parseExpirationDate, createExpirationDate } from '@common/utils/expirationDate';
import type { BankCardDecrypted, CredentialDecrypted, SecureNoteDecrypted } from '@common/core/types/items.types';
import type { CardFormData, CredentialFormData, SecureNoteForm } from '@common/core/types/items.types';
import type { ItemDecrypted } from '@common/core/types/items.types';

// ===== Card Form Transformation Service =====

export const cardFormTransformationService = {
  /**
   * Transforms form data to BankCard object
   */
  transformFormToCard: (formData: CardFormData): BankCardDecrypted => {
    const expirationDate = parseExpirationDate(formData.expirationDate) || createExpirationDate(formData.expiryMonth, formData.expiryYear);
    return {
      id: generateItemKey(),
      itemType: 'bankCard',
      createdDateTime: new Date(),
      lastUseDateTime: new Date(),
      title: formData.title,
      owner: formData.cardholderName,
      note: formData.notes || '',
      color: '#007AFF',
      itemKey: generateItemKey(),
      cardNumber: formData.cardNumber,
      expirationDate,
      verificationNumber: formData.cvv,
      bankName: formData.bankName || '',
      bankDomain: '',
    };
  },

  transformCardToForm: (card: BankCardDecrypted): CardFormData => {
    return {
      title: card.title,
      cardholderName: card.owner,
      cardNumber: card.cardNumber,
      expirationDate: `${card.expirationDate.month.toString().padStart(2, '0')}/${card.expirationDate.year.toString().slice(-2)}`,
      expiryMonth: card.expirationDate.month,
      expiryYear: card.expirationDate.year,
      cvv: card.verificationNumber,
      cardType: 'unknown',
      bankName: card.bankName,
      notes: card.note,
      category: 'cards',
      tags: [],
    };
  },

  /**
   * Validates and transforms form data with business rules
   */
  validateAndTransformCard: (formData: CardFormData): { isValid: boolean; card?: BankCardDecrypted; errors: Record<string, string> } => {
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
  transformFormToCredential: (formData: CredentialFormData): CredentialDecrypted => {
    return {
      id: generateItemKey(),
      itemType: 'credential',
      createdDateTime: new Date(),
      lastUseDateTime: new Date(),
      title: formData.title,
      username: formData.username,
      password: formData.password,
      note: formData.notes || '',
      url: formData.url,
      itemKey: generateItemKey(),
    };
  },

  /**
   * Transforms Credential object to form data
   */
  transformCredentialToForm: (credential: CredentialDecrypted): CredentialFormData => {
    return {
      title: credential.title,
      username: credential.username,
      password: credential.password,
      url: credential.url,
      notes: credential.note,
      category: 'credentials',
      tags: [],
    };
  },

  /**
   * Validates and transforms form data with business rules
   */
  validateAndTransformCredential: (formData: CredentialFormData): { isValid: boolean; credential?: CredentialDecrypted; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    
    // Validate required fields
    if (!formData.title?.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.username?.trim()) {
      errors.username = 'Username is required';
    }
    
    if (!formData.password?.trim()) {
      errors.password = 'Password is required';
    }
    
    // Validate URL format if provided
    if (formData.url && !/^https?:\/\/.+/.test(formData.url)) {
      errors.url = 'Invalid URL format';
    }
    
    const isValid = Object.keys(errors).length === 0;
    
    if (isValid) {
      const credential = credentialFormTransformationService.transformFormToCredential(formData);
      return { isValid: true, credential, errors: {} };
    }
    
    return { isValid: false, credential: undefined, errors };
  },
};

// ===== Secure Note Form Transformation Service =====

export const secureNoteFormTransformationService = {
  /**
   * Transforms form data to SecureNote object
   */
  transformFormToSecureNote: (formData: SecureNoteForm): SecureNoteDecrypted => {
    return {
      id: generateItemKey(),
      itemType: 'secureNote',
      createdDateTime: new Date(),
      lastUseDateTime: new Date(),
      title: formData.title,
      note: formData.content,
      color: '#007AFF',
      itemKey: generateItemKey(),
    };
  },

  transformSecureNoteToForm: (secureNote: SecureNoteDecrypted): SecureNoteForm => {
    return {
      title: secureNote.title,
      content: secureNote.note,
      category: 'notes',
      tags: [],
    };
  },

  validateAndTransformSecureNote: (formData: SecureNoteForm): { isValid: boolean; secureNote?: SecureNoteDecrypted; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    
    // Validate required fields
    if (!formData.title?.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.content?.trim()) {
      errors.content = 'Content is required';
    }
    
    const isValid = Object.keys(errors).length === 0;
    
    if (isValid) {
      const secureNote = secureNoteFormTransformationService.transformFormToSecureNote(formData);
      return { isValid: true, secureNote, errors: {} };
    }
    
    return { isValid: false, secureNote: undefined, errors };
  },
};

// ===== Generic Form Transformation Service =====

export const genericFormTransformationService = {
  /**
   * Generic method to transform any form data to item
   */
  transformFormToItem: <T extends Record<string, any>>(formData: T, itemType: string): ItemDecrypted => {
    switch (itemType) {
      case 'bankCard':
        return cardFormTransformationService.transformFormToCard(formData as unknown as CardFormData);
      case 'credential':
        return credentialFormTransformationService.transformFormToCredential(formData as unknown as CredentialFormData);
      case 'secureNote':
        return secureNoteFormTransformationService.transformFormToSecureNote(formData as unknown as SecureNoteForm);
      default:
        throw new Error(`Unknown item type: ${itemType}`);
    }
  },

  /**
   * Generic method to transform any item to form data
   */
  transformItemToForm: <T extends Record<string, any>>(item: ItemDecrypted): T => {
    const itemType = item.itemType;
    if (itemType === 'bankCard') {
      return cardFormTransformationService.transformCardToForm(item as BankCardDecrypted) as unknown as T;
    } else if (itemType === 'credential') {
      return credentialFormTransformationService.transformCredentialToForm(item as CredentialDecrypted) as unknown as T;
    } else if (itemType === 'secureNote') {
      return secureNoteFormTransformationService.transformSecureNoteToForm(item as SecureNoteDecrypted) as unknown as T;
    } else {
      throw new Error(`Unknown item type: ${itemType}`);
    }
  },

  /**
   * Generic method to validate and transform form data
   */
  validateAndTransformForm: <T extends Record<string, any>>(formData: T, itemType: string): { isValid: boolean; item?: ItemDecrypted; errors: Record<string, string> } => {
    switch (itemType) {
      case 'bankCard':
        return cardFormTransformationService.validateAndTransformCard(formData as unknown as CardFormData);
      case 'credential':
        return credentialFormTransformationService.validateAndTransformCredential(formData as unknown as CredentialFormData);
      case 'secureNote':
        return secureNoteFormTransformationService.validateAndTransformSecureNote(formData as unknown as SecureNoteForm);
      default:
        throw new Error(`Unknown item type: ${itemType}`);
    }
  }
};

// ===== Type Definitions =====

export interface CardFormTransformationService {
  transformFormToCard: (formData: CardFormData) => BankCardDecrypted;
  transformCardToForm: (card: BankCardDecrypted) => CardFormData;
  validateAndTransformCard: (formData: CardFormData) => { isValid: boolean; card?: BankCardDecrypted; errors: Record<string, string> };
}

export interface CredentialFormTransformationService {
  transformFormToCredential: (formData: CredentialFormData) => CredentialDecrypted;
  transformCredentialToForm: (credential: CredentialDecrypted) => CredentialFormData;
  validateAndTransformCredential: (formData: CredentialFormData) => { isValid: boolean; credential?: CredentialDecrypted; errors: Record<string, string> };
}

export interface SecureNoteFormTransformationService {
  transformFormToSecureNote: (formData: SecureNoteForm) => SecureNoteDecrypted;
  transformSecureNoteToForm: (secureNote: SecureNoteDecrypted) => SecureNoteForm;
  validateAndTransformSecureNote: (formData: SecureNoteForm) => { isValid: boolean; secureNote?: SecureNoteDecrypted; errors: Record<string, string> };
}

export interface GenericFormTransformationService {
  transformFormToItem: <T extends Record<string, any>>(formData: T, itemType: string) => ItemDecrypted;
  transformItemToForm: <T extends Record<string, any>>(item: ItemDecrypted) => T;
  validateAndTransformForm: <T extends Record<string, any>>(formData: T, itemType: string) => { isValid: boolean; item?: ItemDecrypted; errors: Record<string, string> };
} 