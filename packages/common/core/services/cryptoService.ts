// packages/common/core/services/cryptoService.ts
import {
  CredentialDecrypted,
  BankCardDecrypted,
  SecureNoteDecrypted,
  ItemEncrypted,
  ItemDecrypted,
} from '../types/items.types';
import * as cryptoUtils from '@common/utils/crypto';

export interface ICryptoService {
    decryptItem(userSecretKey: string, itemToDecrypt: ItemEncrypted): Promise<ItemDecrypted | null>;
    decryptAllItems(userSecretKey: string, itemsList: ItemEncrypted[]): Promise<ItemDecrypted[]>;
    encryptItem(userSecretKey: string, itemToEncrypt: ItemDecrypted): Promise<ItemEncrypted>;
}

// Create a singleton instance for the crypto service
let cryptoServiceInstance: CryptoService | null = null;

export const decryptItem = async (userSecretKey: string, itemToDecrypt: ItemEncrypted): Promise<ItemDecrypted | null> => {
  if (!cryptoServiceInstance) {
    throw new Error('CryptoService not initialized');
  }
  return cryptoServiceInstance.decryptItem(userSecretKey, itemToDecrypt);
};

export const decryptAllItems = async (userSecretKey: string, itemsList: ItemEncrypted[]): Promise<ItemDecrypted[]> => {
  if (!cryptoServiceInstance) {
    throw new Error('CryptoService not initialized');
  }
  return cryptoServiceInstance.decryptAllItems(userSecretKey, itemsList);
};

export class CryptoService implements ICryptoService {
    public async decryptItem(userSecretKey: string, itemToDecrypt: ItemEncrypted): Promise<ItemDecrypted | null> {
        try {
            const itemKey = await cryptoUtils.decryptData(userSecretKey, itemToDecrypt.item_key_encrypted);
            const decryptedContent = await cryptoUtils.decryptData(itemKey, itemToDecrypt.content_encrypted);
            const contentJson = JSON.parse(decryptedContent);
            
            const itemType = contentJson.itemType;
            switch (itemType) {
              case 'credential':
                return {
                  id: itemToDecrypt.id || '',
                  createdDateTime: itemToDecrypt.created_at,
                  lastUseDateTime: itemToDecrypt.last_used_at,
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
                  createdDateTime: itemToDecrypt.created_at,
                  lastUseDateTime: itemToDecrypt.last_used_at,
                  title: contentJson.title || '',
                  owner: contentJson.owner || '',
                  note: contentJson.note || '',
                  color: contentJson.color || '',
                  itemType: 'bankCard',
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
                  createdDateTime: itemToDecrypt.created_at,
                  lastUseDateTime: itemToDecrypt.last_used_at,
                  title: contentJson.title || '',
                  note: contentJson.note || '',
                  color: contentJson.color || '',
                  itemType: 'secureNote',
                  itemKey,
                } as SecureNoteDecrypted;
              default:
                console.error('[Cryptography] Unknown item type:', itemType);
                return null;
            }
        } catch (error) {
            console.error('[Cryptography] Decryption failed for item', itemToDecrypt.id, error);
            throw error;
        }
    }

    public async decryptAllItems(userSecretKey: string, itemsList: ItemEncrypted[]): Promise<ItemDecrypted[]> {
        const decryptedItems: ItemDecrypted[] = [];
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
                    continue;
                }
                const decryptedItem = await this.decryptItem(userSecretKey, item);
                if (decryptedItem) {
                    decryptedItems.push(decryptedItem);
                }
            } catch (e) {
                console.error('[Cryptography] Error processing item:', e);
            }
        }
        return decryptedItems;
    }

    public async encryptItem(userSecretKey: string, itemToEncrypt: ItemDecrypted): Promise<ItemEncrypted> {
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
    }
}
