// cryptography.ts 
// Services for cryptography for items

import { CredentialDecrypted, CredentialEncrypted } from '@shared/types';
import { encryptData, decryptData } from '@utils/crypto';
import { Timestamp } from 'firebase/firestore';

/**
 * Decrypt a credential item using the user's secret key.
 * Returns a CredentialDecrypted object.
 */
export async function decryptCredential(
  userSecretKey: string,
  itemToDecrypt: CredentialEncrypted
): Promise<CredentialDecrypted> {
  try {
    const itemKey = await decryptData(userSecretKey, itemToDecrypt.item_key_encrypted);
    const decryptedContent = await decryptData(itemKey, itemToDecrypt.content_encrypted);
    const contentJson = JSON.parse(decryptedContent);
    return {
      createdDateTime: itemToDecrypt.created_at.toDate(),
      lastUseDateTime: itemToDecrypt.last_used_at.toDate(),
      title: contentJson.title || '',
      username: contentJson.username || '',
      password: contentJson.password || '',
      note: contentJson.note || '',
      url: contentJson.url || '',
      itemKey: itemKey,
      document_reference: itemToDecrypt.document_reference,
    };
  } catch (error) {
    console.error('❌ Decryption failed for item', itemToDecrypt.document_reference, error);
    console.error('🔐 Encrypted content:', itemToDecrypt.content_encrypted);
    console.error('🔑 Encrypted item key:', itemToDecrypt.item_key_encrypted);
    throw error;
  }
}

/**
 * Decrypt an array of credential items using the user's secret key.
 * Returns an array of CredentialDecrypted objects.
 */
export async function decryptAllCredentials(
  userSecretKey: string,
  credentialsList: CredentialEncrypted[],
): Promise<CredentialDecrypted[]> {
  console.log('[Cryptography] Decrypting all credentials:', credentialsList.length, 'credentials');
  const decryptedItems: CredentialDecrypted[] = [];
  if (!credentialsList.length) {
    console.debug('No credential items provided.');
    return decryptedItems;
  }
  for (const credential of credentialsList) {
    try {
      if (
        typeof credential.item_key_encrypted !== 'string' ||
        typeof credential.content_encrypted !== 'string'
      ) {
        console.error('[Cryptography] Malformed credential:', credential);
        continue;
      }
      const decryptedItem = await decryptCredential(userSecretKey, credential);
      decryptedItems.push(decryptedItem);
    } catch (e) {
      console.debug(`[Cryptography] Error processing credential:`, e);
    }
  }
  console.log('[Cryptography] decryptAllCredentials success:', decryptedItems.length, 'credentials decrypted');
  return decryptedItems;
}

/**
 * Encrypt a credential item using the user's secret key.
 * Returns a CredentialEncrypted object.
 */
export async function encryptCredential(
  userSecretKey: string,
  itemToEncrypt: CredentialDecrypted
): Promise<CredentialEncrypted> {
  // Build the content dictionary
  const contentDict = {
    title: itemToEncrypt.title,
    username: itemToEncrypt.username || '',
    password: itemToEncrypt.password,
    note: itemToEncrypt.note || '',
    url: itemToEncrypt.url || '',
  };
  // Convert to JSON string
  const contentString = JSON.stringify(contentDict);
  // Encrypt content and item key
  const itemKey = itemToEncrypt.itemKey;
  const content_encrypted = await encryptData(itemKey, contentString);
  const item_key_encrypted = await encryptData(userSecretKey, itemKey);
  // Return the encrypted item
  return {
    created_at: Timestamp.fromDate(itemToEncrypt.createdDateTime),
    content_encrypted,
    item_key_encrypted,
    last_used_at: Timestamp.fromDate(itemToEncrypt.lastUseDateTime),
    document_reference: itemToEncrypt.document_reference || null,
  };
}
