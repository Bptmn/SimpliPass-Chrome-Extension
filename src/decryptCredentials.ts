import { CredentialEncrypted, ItemCredentialDecrypted } from "./types";
import { getUserSecretKey } from "../utils/indexdb";
import { decryptData } from "../utils/crypto";

/**
 * Decrypt all credentials for a user.
 * @param credentialsList List of encrypted credentials from Firestore
 * @returns Promise<ItemCredentialDecrypted[]>
 */
export async function decryptAllCredentials(credentialsList: CredentialEncrypted[]): Promise<ItemCredentialDecrypted[]> {
  const decryptedItems: ItemCredentialDecrypted[] = [];

  if (!credentialsList.length) {
    console.debug("No credential items provided.");
    return decryptedItems;
  }

  let userSecretKey: string | null = null;
  try {
    userSecretKey = await getUserSecretKey();
    if (!userSecretKey) {
      throw new Error("User secret key not found in IndexedDB");
    }
  } catch (e) {
    console.error("Error retrieving user secret key:", e);
    return decryptedItems;
  }

  for (const credential of credentialsList) {
    try {
      // Decrypt the item key
      const itemKeyDecrypted = await decryptData(userSecretKey, credential.item_key_encrypted);
      // Decrypt the content
      const contentDecrypted = await decryptData(itemKeyDecrypted, credential.content_encrypted);
      // Parse the decrypted JSON
      const contentJson = JSON.parse(contentDecrypted);
      // Build the decrypted item
      const decryptedItem: ItemCredentialDecrypted = {
        createdDateTime: credential.created_at.toDate(),
        lastUseDateTime: credential.last_used_at.toDate(),
        title: contentJson.title || '',
        username: contentJson.username || '',
        password: contentJson.password || '',
        note: contentJson.note || '',
        url: contentJson.url || '',
        itemKey: itemKeyDecrypted,
        document_reference: credential.document_reference || '',
      };
      decryptedItems.push(decryptedItem);
    } catch (e) {
      console.debug(`Error processing credential:`, e);
    }
  }

  return decryptedItems;
} 