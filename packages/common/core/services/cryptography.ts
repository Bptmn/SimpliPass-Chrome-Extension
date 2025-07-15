/**
 * Cryptography Service - Layer 2: Business Logic
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
import { encryptData, decryptData, generateItemKey } from '@common/utils/crypto';
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

export async function encryptCredential(userSecretKey: string, itemToEncrypt: CredentialDecrypted): Promise<any> {
  const contentDict = {
    title: itemToEncrypt.title,
    username: itemToEncrypt.username || '',
    password: itemToEncrypt.password,
    note: itemToEncrypt.note || '',
    url: itemToEncrypt.url || '',
    itemType: 'credential',
  };
  const contentString = JSON.stringify(contentDict);
  // Generate a random item key for encryption
  const itemKey = generateItemKey();
  const content_encrypted = await encryptData(itemKey, contentString);
  const item_key_encrypted = await encryptData(userSecretKey, itemKey);
  return {
    id: itemToEncrypt.id,
    created_at: itemToEncrypt.createdDateTime,
    content_encrypted,
    item_key_encrypted,
    last_used_at: itemToEncrypt.lastUseDateTime,
    item_type: 'credential',
  };
}

export async function encryptBankCard(userSecretKey: string, itemToEncrypt: BankCardDecrypted): Promise<any> {
  const contentDict = {
    title: itemToEncrypt.title,
    owner: itemToEncrypt.owner,
    cardNumber: itemToEncrypt.cardNumber,
    expirationDate: itemToEncrypt.expirationDate,
    verificationNumber: itemToEncrypt.verificationNumber,
    bankName: itemToEncrypt.bankName,
    bankDomain: itemToEncrypt.bankDomain,
    note: itemToEncrypt.note,
    itemType: 'bank_card',
  };
  const contentString = JSON.stringify(contentDict);
  // Generate a random item key for encryption
  const itemKey = generateItemKey();
  const content_encrypted = await encryptData(itemKey, contentString);
  const item_key_encrypted = await encryptData(userSecretKey, itemKey);
  return {
    id: itemToEncrypt.id,
    created_at: itemToEncrypt.createdDateTime,
    content_encrypted,
    item_key_encrypted,
    last_used_at: itemToEncrypt.lastUseDateTime,
    item_type: 'bank_card',
  };
}

export async function encryptSecureNote(userSecretKey: string, itemToEncrypt: SecureNoteDecrypted): Promise<any> {
  const contentDict = {
    title: itemToEncrypt.title,
    note: itemToEncrypt.note,
    color: itemToEncrypt.color,
    itemType: 'secure_note',
  };
  const contentString = JSON.stringify(contentDict);
  // Generate a random item key for encryption
  const itemKey = generateItemKey();
  const content_encrypted = await encryptData(itemKey, contentString);
  const item_key_encrypted = await encryptData(userSecretKey, itemKey);
  return {
    id: itemToEncrypt.id,
    created_at: itemToEncrypt.createdDateTime,
    content_encrypted,
    item_key_encrypted,
    last_used_at: itemToEncrypt.lastUseDateTime,
    item_type: 'secure_note',
  };
}

// ===== Device Fingerprint Functions =====

/**
 * Encrypt data with device fingerprint
 */
export async function encryptWithDeviceFingerprint(data: string): Promise<string> {
  try {
    // For now, return a simple encrypted version
    // In production, this would use proper device fingerprint encryption
    return btoa(data);
  } catch (error) {
    throw new CryptographyError('Failed to encrypt with device fingerprint', error as Error);
  }
}

/**
 * Decrypt data with device fingerprint
 */
export async function decryptWithDeviceFingerprint(encryptedData: string): Promise<string> {
  try {
    // For now, return a simple decrypted version
    // In production, this would use proper device fingerprint decryption
    return atob(encryptedData);
  } catch (error) {
    throw new CryptographyError('Failed to decrypt with device fingerprint', error as Error);
  }
}