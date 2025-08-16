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
        const contentJson = JSON.parse(decryptedContent);
        
        // ✅ Database adapter now provides standard Date objects
        const createdDateTime = itemToDecrypt.created_at;
        const lastUseDateTime = itemToDecrypt.last_used_at;
        
        const itemType = contentJson.itemType;
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
    
    // ✅ Propagate errors if all items failed
    if (decryptedItems.length === 0 && errors.length > 0) {
        throw new CryptographyError('Failed to decrypt any items', errors[0]);
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

