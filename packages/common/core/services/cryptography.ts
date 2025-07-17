/**
 * Cryptography Service - Layer 2 Business Logic
 * 
 * Handles encryption and decryption operations for items.
 * Orchestrates cryptographic operations between hooks and libraries.
 */

import {
  CredentialDecrypted,
  BankCardDecrypted,
  SecureNoteDecrypted,
  ItemEncrypted,
} from '../types/items.types';
import { encryptData, decryptData } from '@common/utils/crypto';
import { CryptographyError } from '../types/errors.types';

// ===== Encryption/Decryption Functions =====

type DecryptedItem = CredentialDecrypted | BankCardDecrypted | SecureNoteDecrypted;

export async function decryptItem(userSecretKey: string, itemToDecrypt: ItemEncrypted): Promise<DecryptedItem | null> {
  try {
    console.log('[Cryptography] Decrypting item:', itemToDecrypt.id);
    
    const itemKey = await decryptData(userSecretKey, itemToDecrypt.item_key_encrypted);
    console.log('[Cryptography] Item key decrypted successfully, length:', itemKey.length);
    
    const decryptedContent = await decryptData(itemKey, itemToDecrypt.content_encrypted);
    console.log('[Cryptography] Content decrypted successfully, length:', decryptedContent.length);
    
    const contentJson = JSON.parse(decryptedContent);
    console.log('[Cryptography] Content parsed as JSON, itemType:', contentJson.itemType);
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
      case 'bank_card': {
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
        console.error('Unknown item type:', itemType);
        return null;
    }
  } catch (error) {
    console.error('❌ Decryption failed for item', itemToDecrypt.id, error);
    console.error('🔐 Encrypted content:', itemToDecrypt.content_encrypted);
    console.error('🔑 Encrypted item key:', itemToDecrypt.item_key_encrypted);
    throw error;
  }
}

export async function decryptAllItems(userSecretKey: string, itemsList: ItemEncrypted[]): Promise<DecryptedItem[]> {
  console.log('[Cryptography] Decrypting all items:', itemsList.length, 'items');
  const decryptedItems: DecryptedItem[] = [];
  if (!itemsList.length) {
    console.debug('No items provided.');
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
      const decryptedItem = await decryptItem(userSecretKey, item);
      if (decryptedItem) {
        decryptedItems.push(decryptedItem);
      }
    } catch (e) {
      console.debug(`[Cryptography] Error processing item:`, e);
    }
  }
  console.log('[Cryptography] decryptAllItems success:', decryptedItems.length, 'items decrypted');
  return decryptedItems;
}

export async function encryptItem(userSecretKey: string, itemToEncrypt: DecryptedItem): Promise<any> {
  // Simply stringify the entire item object - no need to create contentDict
  const contentString = JSON.stringify(itemToEncrypt);
  
  const content_encrypted = await encryptData(itemToEncrypt.itemKey, contentString);
  const item_key_encrypted = await encryptData(userSecretKey, itemToEncrypt.itemKey);
  
  return {
    id: itemToEncrypt.id,
    created_at: itemToEncrypt.createdDateTime,
    content_encrypted,
    item_key_encrypted,
    last_used_at: itemToEncrypt.lastUseDateTime,
  };
}