// packages/common/core/services/cryptoService.ts
import {
  CredentialDecrypted,
  BankCardDecrypted,
  SecureNoteDecrypted,
  ItemEncrypted,
  ItemDecrypted,
} from '../types/items.types';
import { CryptographyError, ItemError } from '../types/errors.types';

export interface ICryptoService {
    decryptItem(userSecretKey: string, itemToDecrypt: ItemEncrypted): Promise<ItemDecrypted | null>;
    decryptAllItems(userSecretKey: string, itemsList: ItemEncrypted[]): Promise<ItemDecrypted[]>;
    encryptItem(userSecretKey: string, itemToEncrypt: ItemDecrypted): Promise<ItemEncrypted>;
}

// ✅ Helper function to get crypto utilities through adapter pattern
const getCryptoUtils = async () => {
  // This should ideally come through an adapter, but for now we'll keep the direct import
  // TODO: Create a crypto adapter to abstract this dependency
  return await import('@common/core/libraries/crypto');
};

// Export functions directly - no singleton needed for stateless service
export const decryptItem = async (userSecretKey: string, itemToDecrypt: ItemEncrypted): Promise<ItemDecrypted | null> => {
    try {
        const cryptoUtils = await getCryptoUtils();
        const itemKey = await cryptoUtils.decryptData(userSecretKey, itemToDecrypt.item_key_encrypted);
        const decryptedContent = await cryptoUtils.decryptData(itemKey, itemToDecrypt.content_encrypted);
        console.log('[Cryptography] Decrypted content length:', decryptedContent.length);
        console.log('[Cryptography] Decrypted content (first 100 chars):', decryptedContent.substring(0, 100) + (decryptedContent.length > 100 ? '...' : ''));
        
        const contentJson = JSON.parse(decryptedContent);
        console.log('[Cryptography] Parsed JSON keys:', Object.keys(contentJson));
        console.log('[Cryptography] Parsed JSON itemType:', contentJson.itemType);
        console.log('[Cryptography] Full parsed JSON:', JSON.stringify(contentJson, null, 2));
        
        // ✅ Database adapter now provides standard Date objects
        const createdDateTime = itemToDecrypt.created_at;
        const lastUseDateTime = itemToDecrypt.last_used_at;
        
        // Handle backward compatibility for items without itemType
        let itemType = contentJson.itemType;
        
        // If itemType is missing, try to infer it from the data structure
        if (!itemType) {
          // Check for credential: has username field (even if empty) or password field
          if ('username' in contentJson || 'password' in contentJson) {
            itemType = 'credential';
            console.log('[Cryptography] Inferred itemType as credential from data structure (has username/password fields)');
          } else if (contentJson.cardNumber || contentJson.owner) {
            itemType = 'bank_card';
            console.log('[Cryptography] Inferred itemType as bank_card from data structure');
          } else if (contentJson.note && !('username' in contentJson)) {
            itemType = 'secure_note';
            console.log('[Cryptography] Inferred itemType as secure_note from data structure');
          } else {
            console.error('[Cryptography] Cannot infer itemType from data structure:', Object.keys(contentJson));
            throw new ItemError('Cannot determine item type from decrypted data');
          }
        }
        
        switch (itemType) {
          case 'credential':
            return {
              id: itemToDecrypt.id || '',
              createdDateTime,
              lastUseDateTime,
              title: contentJson.title || '',
              username: contentJson.username || '',
              password: contentJson.password || '',
              note: contentJson.note || '',
              url: contentJson.url || '',
              itemType: 'credential',
              itemKey,
            } as CredentialDecrypted;
          case 'bank_card':
          case 'bankCard': {
            const expirationDate = contentJson.expirationDate;
            return {
              id: itemToDecrypt.id || '',
              createdDateTime,
              lastUseDateTime,
              title: contentJson.title || '',
              owner: contentJson.owner || '',
              note: contentJson.note || '',
              color: contentJson.color || '',
              itemType: 'bank_card',
              itemKey,
              cardNumber: contentJson.cardNumber || '',
              expirationDate,
              verificationNumber: contentJson.verificationNumber || '',
              bankName: contentJson.bankName || '',
              bankDomain: contentJson.bankDomain || '',
            } as BankCardDecrypted;
          }
          case 'secure_note':
          case 'secureNote':
            return {
              id: itemToDecrypt.id || '',
              createdDateTime,
              lastUseDateTime,
              title: contentJson.title || '',
              note: contentJson.note || '',
              color: contentJson.color || '',
              itemType: 'secure_note',
              itemKey,
            } as SecureNoteDecrypted;
          default:
            console.error('[Cryptography] Unknown item type:', itemType);
            throw new ItemError(`Unknown item type: ${itemType}`);
        }
    } catch (error) {
        console.error('[Cryptography] Decryption failed for item', itemToDecrypt.id, error);
        
        // ✅ Proper error categorization for UI layer
        if (error instanceof CryptographyError || error instanceof ItemError) {
          throw error;
        }
        
        if (error instanceof Error) {
          if (error.message.includes('Invalid key') || error.message.includes('decryption')) {
            throw new CryptographyError('Failed to decrypt item - invalid key or corrupted data', error);
          }
          if (error.message.includes('JSON')) {
            throw new ItemError('Invalid item data format', error);
          }
        }
        
        throw new CryptographyError('Failed to decrypt item', error as Error);
    }
};

export const decryptAllItems = async (userSecretKey: string, itemsList: ItemEncrypted[]): Promise<ItemDecrypted[]> => {
    const decryptedItems: ItemDecrypted[] = [];
    const errors: Error[] = [];
    
    if (!itemsList.length) {
        return decryptedItems;
    }
    
    for (const item of itemsList) {
        try {
            if (
                typeof item.item_key_encrypted !== 'string' ||
                typeof item.content_encrypted !== 'string'
            ) {
                console.error('[Cryptography] Malformed item:', item);
                errors.push(new ItemError(`Malformed item: ${item.id}`));
                continue;
            }
            const decryptedItem = await decryptItem(userSecretKey, item);
            if (decryptedItem) {
                decryptedItems.push(decryptedItem);
            }
        } catch (error) {
            console.error('[Cryptography] Error processing item:', error);
            errors.push(error as Error);
        }
    }
    
    // ✅ If all items failed, log and return empty (do not crash UI)
    if (decryptedItems.length === 0 && errors.length > 0) {
        console.error('[Cryptography] Failed to decrypt any items. Returning empty list to avoid UI crash.');
        return [];
    }

    // Log partial failures but don't throw
    if (errors.length > 0) {
        console.warn(`[Cryptography] ${errors.length} items failed to decrypt out of ${itemsList.length} total items`);
    }

    return decryptedItems;
};

export const encryptItem = async (userSecretKey: string, itemToEncrypt: ItemDecrypted): Promise<ItemEncrypted> => {
    try {
        const cryptoUtils = await getCryptoUtils();
        const contentString = JSON.stringify(itemToEncrypt);
        const content_encrypted = await cryptoUtils.encryptData(itemToEncrypt.itemKey, contentString);
        const item_key_encrypted = await cryptoUtils.encryptData(userSecretKey, itemToEncrypt.itemKey);
        
        return {
            id: itemToEncrypt.id,
            created_at: itemToEncrypt.createdDateTime,
            content_encrypted,
            item_key_encrypted,
            last_used_at: itemToEncrypt.lastUseDateTime,
            // item_type kept only for statistics - not used in decryption logic
            item_type: itemToEncrypt.itemType,
        };
    } catch (error) {
        console.error('[Cryptography] Encryption failed for item', itemToEncrypt.id, error);
        throw new CryptographyError('Failed to encrypt item', error as Error);
    }
};

// Export the interface for type checking
export class CryptoService implements ICryptoService {
    public async decryptItem(userSecretKey: string, itemToDecrypt: ItemEncrypted): Promise<ItemDecrypted | null> {
        return decryptItem(userSecretKey, itemToDecrypt);
    }

    public async decryptAllItems(userSecretKey: string, itemsList: ItemEncrypted[]): Promise<ItemDecrypted[]> {
        return decryptAllItems(userSecretKey, itemsList);
    }

    public async encryptItem(userSecretKey: string, itemToEncrypt: ItemDecrypted): Promise<ItemEncrypted> {
        return encryptItem(userSecretKey, itemToEncrypt);
    }
}

