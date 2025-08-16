// formTransformationService.ts
// This service contains all business logic for transforming form data to item objects and vice versa.
// Responsibilities:
// - Transform form data to item objects
// - Transform item objects to form data
// - Apply business rules during transformation
// - Generate required fields and IDs

import { parseExpirationDate, createExpirationDate } from '@common/utils/expirationDate';
import { ItemError } from '@common/core/types/errors.types';
import type { BankCardDecrypted, CredentialDecrypted, SecureNoteDecrypted } from '@common/core/types/items.types';
import type { CardFormData, CredentialFormData, SecureNoteForm } from '@common/core/types/items.types';
import type { ItemDecrypted } from '@common/core/types/items.types';

// ✅ Helper function to get crypto utilities through adapter pattern
const getCryptoUtils = async () => {
  // This should ideally come through an adapter, but for now we'll keep the direct import
  // TODO: Create a crypto adapter to abstract this dependency
  return await import('@common/core/libraries/crypto');
};

// ✅ Helper function to generate item keys
const generateItemKey = async (): Promise<string> => {
  try {
    const cryptoUtils = await getCryptoUtils();
    return await cryptoUtils.generateItemKey();
  } catch (error) {
    console.error('[FormTransformation] Failed to generate item key:', error);
    throw new ItemError('Failed to generate item key', error as Error);
  }
};

// ===== Card Form Transformation Service =====

export const cardFormTransformationService = {
  /**
   * Transforms form data to BankCard object
   */
  transformFormToCard: async (formData: CardFormData): Promise<BankCardDecrypted> => {
    try {
      const expirationDate = parseExpirationDate(formData.expirationDate) || createExpirationDate(formData.expiryMonth, formData.expiryYear);
      const itemKey = await generateItemKey();
      
      return {
        id: itemKey,
        itemType: 'bank_card',
        createdDateTime: new Date(),
        lastUseDateTime: new Date(),
        title: formData.title,
        owner: formData.cardholderName,
        note: formData.notes || '',
        color: '#007AFF',
        itemKey,
        cardNumber: formData.cardNumber,
        expirationDate,
        verificationNumber: formData.cvv,
        bankName: formData.bankName || '',
        bankDomain: '',
      };
    } catch (error) {
      console.error('[FormTransformation] Failed to transform card form:', error);
      throw new ItemError('Failed to transform card form data', error as Error);
    }
  },

  transformCardToForm: (card: BankCardDecrypted): CardFormData => {
    try {
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
    } catch (error) {
      console.error('[FormTransformation] Failed to transform card to form:', error);
      throw new ItemError('Failed to transform card to form data', error as Error);
    }
  },

  /**
   * Validates and transforms form data with business rules
   */
  validateAndTransformCard: async (formData: CardFormData): Promise<{ isValid: boolean; card?: BankCardDecrypted; errors: Record<string, string> }> => {
    try {
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
        const card = await cardFormTransformationService.transformFormToCard(formData);
        return { isValid, card, errors };
      }
      
      return { isValid, errors };
    } catch (error) {
      console.error('[FormTransformation] Failed to validate and transform card:', error);
      throw new ItemError('Failed to validate and transform card form', error as Error);
    }
  }
};

// ===== Credential Form Transformation Service =====

export const credentialFormTransformationService = {
  /**
   * Transforms form data to Credential object
   */
  transformFormToCredential: async (formData: CredentialFormData): Promise<CredentialDecrypted> => {
    try {
      const itemKey = await generateItemKey();
      
      return {
        id: itemKey,
        itemType: 'credential',
        createdDateTime: new Date(),
        lastUseDateTime: new Date(),
        title: formData.title,
        username: formData.username,
        password: formData.password,
        note: formData.notes || '',
        url: formData.url,
        itemKey,
      };
    } catch (error) {
      console.error('[FormTransformation] Failed to transform credential form:', error);
      throw new ItemError('Failed to transform credential form data', error as Error);
    }
  },

  /**
   * Transforms Credential object to form data
   */
  transformCredentialToForm: (credential: CredentialDecrypted): CredentialFormData => {
    try {
      return {
        title: credential.title,
        username: credential.username,
        password: credential.password,
        url: credential.url,
        notes: credential.note,
        category: 'credentials',
        tags: [],
      };
    } catch (error) {
      console.error('[FormTransformation] Failed to transform credential to form:', error);
      throw new ItemError('Failed to transform credential to form data', error as Error);
    }
  },

  /**
   * Validates and transforms form data with business rules
   */
  validateAndTransformCredential: async (formData: CredentialFormData): Promise<{ isValid: boolean; credential?: CredentialDecrypted; errors: Record<string, string> }> => {
    try {
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
        const credential = await credentialFormTransformationService.transformFormToCredential(formData);
        return { isValid: true, credential, errors: {} };
      }
      
      return { isValid: false, credential: undefined, errors };
    } catch (error) {
      console.error('[FormTransformation] Failed to validate and transform credential:', error);
      throw new ItemError('Failed to validate and transform credential form', error as Error);
    }
  },
};

// ===== Secure Note Form Transformation Service =====

export const secureNoteFormTransformationService = {
  /**
   * Transforms form data to SecureNote object
   */
  transformFormToSecureNote: async (formData: SecureNoteForm): Promise<SecureNoteDecrypted> => {
    try {
      const itemKey = await generateItemKey();
      
      return {
        id: itemKey,
        itemType: 'secure_note',
        createdDateTime: new Date(),
        lastUseDateTime: new Date(),
        title: formData.title,
        note: formData.content,
        color: '#007AFF',
        itemKey,
      };
    } catch (error) {
      console.error('[FormTransformation] Failed to transform secure note form:', error);
      throw new ItemError('Failed to transform secure note form data', error as Error);
    }
  },

  transformSecureNoteToForm: (secureNote: SecureNoteDecrypted): SecureNoteForm => {
    try {
      return {
        title: secureNote.title,
        content: secureNote.note,
        category: 'notes',
        tags: [],
      };
    } catch (error) {
      console.error('[FormTransformation] Failed to transform secure note to form:', error);
      throw new ItemError('Failed to transform secure note to form data', error as Error);
    }
  },

  validateAndTransformSecureNote: async (formData: SecureNoteForm): Promise<{ isValid: boolean; secureNote?: SecureNoteDecrypted; errors: Record<string, string> }> => {
    try {
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
        const secureNote = await secureNoteFormTransformationService.transformFormToSecureNote(formData);
        return { isValid: true, secureNote, errors: {} };
      }
      
      return { isValid: false, secureNote: undefined, errors };
    } catch (error) {
      console.error('[FormTransformation] Failed to validate and transform secure note:', error);
      throw new ItemError('Failed to validate and transform secure note form', error as Error);
    }
  },
};

// ===== Generic Form Transformation Service =====

export const genericFormTransformationService = {
  /**
   * Generic method to transform any form data to item
   */
  transformFormToItem: async <T extends Record<string, any>>(formData: T, itemType: string): Promise<ItemDecrypted> => {
    try {
      switch (itemType) {
        case 'bankCard':
          return await cardFormTransformationService.transformFormToCard(formData as unknown as CardFormData);
        case 'credential':
          return await credentialFormTransformationService.transformFormToCredential(formData as unknown as CredentialFormData);
        case 'secureNote':
          return await secureNoteFormTransformationService.transformFormToSecureNote(formData as unknown as SecureNoteForm);
        default:
          throw new ItemError(`Unknown item type: ${itemType}`);
      }
    } catch (error) {
      console.error('[FormTransformation] Failed to transform form to item:', error);
      throw new ItemError('Failed to transform form data to item', error as Error);
    }
  },

  /**
   * Generic method to transform any item to form data
   */
  transformItemToForm: <T extends Record<string, any>>(item: ItemDecrypted): T => {
    try {
      const itemType = item.itemType;
      if (itemType === 'bank_card') {
        return cardFormTransformationService.transformCardToForm(item as BankCardDecrypted) as unknown as T;
      } else if (itemType === 'credential') {
        return credentialFormTransformationService.transformCredentialToForm(item as CredentialDecrypted) as unknown as T;
              } else if (itemType === 'secure_note') {
        return secureNoteFormTransformationService.transformSecureNoteToForm(item as SecureNoteDecrypted) as unknown as T;
      } else {
        throw new ItemError(`Unknown item type: ${itemType}`);
      }
    } catch (error) {
      console.error('[FormTransformation] Failed to transform item to form:', error);
      throw new ItemError('Failed to transform item to form data', error as Error);
    }
  },

  /**
   * Generic method to validate and transform form data
   */
  validateAndTransformForm: async <T extends Record<string, any>>(formData: T, itemType: string): Promise<{ isValid: boolean; item?: ItemDecrypted; errors: Record<string, string> }> => {
    try {
      switch (itemType) {
        case 'bankCard':
          return await cardFormTransformationService.validateAndTransformCard(formData as unknown as CardFormData);
        case 'credential':
          return await credentialFormTransformationService.validateAndTransformCredential(formData as unknown as CredentialFormData);
        case 'secureNote':
          return await secureNoteFormTransformationService.validateAndTransformSecureNote(formData as unknown as SecureNoteForm);
        default:
          throw new ItemError(`Unknown item type: ${itemType}`);
      }
    } catch (error) {
      console.error('[FormTransformation] Failed to validate and transform form:', error);
      throw new ItemError('Failed to validate and transform form data', error as Error);
    }
  }
};

// ===== Type Definitions =====

export interface CardFormTransformationService {
  transformFormToCard: (formData: CardFormData) => Promise<BankCardDecrypted>;
  transformCardToForm: (card: BankCardDecrypted) => CardFormData;
  validateAndTransformCard: (formData: CardFormData) => Promise<{ isValid: boolean; card?: BankCardDecrypted; errors: Record<string, string> }>;
}

export interface CredentialFormTransformationService {
  transformFormToCredential: (formData: CredentialFormData) => Promise<CredentialDecrypted>;
  transformCredentialToForm: (credential: CredentialDecrypted) => CredentialFormData;
  validateAndTransformCredential: (formData: CredentialFormData) => Promise<{ isValid: boolean; credential?: CredentialDecrypted; errors: Record<string, string> }>;
}

export interface SecureNoteFormTransformationService {
  transformFormToSecureNote: (formData: SecureNoteForm) => Promise<SecureNoteDecrypted>;
  transformSecureNoteToForm: (secureNote: SecureNoteDecrypted) => SecureNoteForm;
  validateAndTransformSecureNote: (formData: SecureNoteForm) => Promise<{ isValid: boolean; secureNote?: SecureNoteDecrypted; errors: Record<string, string> }>;
}

export interface GenericFormTransformationService {
  transformFormToItem: <T extends Record<string, any>>(formData: T, itemType: string) => Promise<ItemDecrypted>;
  transformItemToForm: <T extends Record<string, any>>(item: ItemDecrypted) => T;
  validateAndTransformForm: <T extends Record<string, any>>(formData: T, itemType: string) => Promise<{ isValid: boolean; item?: ItemDecrypted; errors: Record<string, string> }>;
} 