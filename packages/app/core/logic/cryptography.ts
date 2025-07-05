// cryptography.ts 
// Services for cryptography for items

import { 
  CredentialDecrypted, 
  CredentialEncrypted, 
  BankCardDecrypted, 
  BankCardEncrypted, 
  SecureNoteDecrypted,
  SecureNoteEncrypted,
  ItemEncrypted,
  ItemType
} from '@app/core/types/types';
import { encryptData, decryptData } from '@utils/crypto';

type DecryptedItem = CredentialDecrypted | BankCardDecrypted | SecureNoteDecrypted;

/**
 * Decrypt any item based on its item_type
 */
export async function decryptItem(
  userSecretKey: string,
  itemToDecrypt: ItemEncrypted
): Promise<DecryptedItem | null> {
  try {
    const itemKey = await decryptData(userSecretKey, itemToDecrypt.item_key_encrypted);
    const decryptedContent = await decryptData(itemKey, itemToDecrypt.content_encrypted);
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
          itemKey: itemKey,
        } as CredentialDecrypted;
      case 'bank_card':
        return {
          id: itemToDecrypt.id || '',
          createdDateTime: itemToDecrypt.created_at,
          lastUseDateTime: itemToDecrypt.last_used_at,
          title: contentJson.title || '',
          owner: contentJson.owner || '',
          note: contentJson.note || '',
          color: contentJson.color || '',
          itemKey: itemKey,
          cardNumber: contentJson.cardNumber || '',
          expirationDate: contentJson.expirationDate ? new Date(contentJson.expirationDate) : new Date(),
          verificationNumber: contentJson.verificationNumber || '',
          bankName: contentJson.bankName || '',
          bankDomain: contentJson.bankDomain || '',
        } as BankCardDecrypted;
      case 'secure_note':
        return {
          id: itemToDecrypt.id || '',
          createdDateTime: itemToDecrypt.created_at,
          lastUseDateTime: itemToDecrypt.last_used_at,
          title: contentJson.title || '',
          note: contentJson.note || '',
          color: contentJson.color || '',
          itemKey: itemKey,
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

/**
 * Decrypt an array of items using the user's secret key.
 * Returns an array of decrypted items based on their item_type.
 */
export async function decryptAllItems(
  userSecretKey: string,
  itemsList: ItemEncrypted[],
): Promise<DecryptedItem[]> {
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

/**
 * Encrypt a credential item using the user's secret key.
 * Returns a CredentialEncrypted object.
 */
export async function encryptCredential(
  userSecretKey: string,
  itemToEncrypt: CredentialDecrypted,
  itemType: ItemType
): Promise<CredentialEncrypted> {
  // Build the content dictionary
  const contentDict = {
    title: itemToEncrypt.title,
    username: itemToEncrypt.username || '',
    password: itemToEncrypt.password,
    note: itemToEncrypt.note || '',
    url: itemToEncrypt.url || '',
    itemType,
  };
  // Convert to JSON string
  const contentString = JSON.stringify(contentDict);
  // Encrypt content and item key
  const itemKey = itemToEncrypt.itemKey;
  const content_encrypted = await encryptData(itemKey, contentString);
  const item_key_encrypted = await encryptData(userSecretKey, itemKey);
  // Return the encrypted item
  return {
    id: itemToEncrypt.id,
    created_at: itemToEncrypt.createdDateTime,
    content_encrypted,
    item_key_encrypted,
    last_used_at: itemToEncrypt.lastUseDateTime,
    item_type: 'credential',
  };
}

/**
 * Encrypt a bank card item using the user's secret key.
 * Returns a BankCardEncrypted object.
 */
export async function encryptBankCard(
  userSecretKey: string,
  itemToEncrypt: BankCardDecrypted,
  itemType: ItemType
): Promise<BankCardEncrypted> {
  const contentDict = {
    title: itemToEncrypt.title,
    owner: itemToEncrypt.owner,
    note: itemToEncrypt.note,
    color: itemToEncrypt.color,
    cardNumber: itemToEncrypt.cardNumber,
    expirationDate: itemToEncrypt.expirationDate,
    verificationNumber: itemToEncrypt.verificationNumber,
    bankName: itemToEncrypt.bankName,
    bankDomain: itemToEncrypt.bankDomain,
    itemType,
  };
  const contentString = JSON.stringify(contentDict);
  const itemKey = itemToEncrypt.itemKey;
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

/**
 * Encrypt a secure note item using the user's secret key.
 * Returns a SecureNoteEncrypted object.
 */
export async function encryptSecureNote(
  userSecretKey: string,
  itemToEncrypt: SecureNoteDecrypted,
  itemType: ItemType
): Promise<SecureNoteEncrypted> {
  const contentDict = {
    title: itemToEncrypt.title,
    note: itemToEncrypt.note,
    color: itemToEncrypt.color,
    itemType,
  };
  const contentString = JSON.stringify(contentDict);
  const itemKey = itemToEncrypt.itemKey;
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