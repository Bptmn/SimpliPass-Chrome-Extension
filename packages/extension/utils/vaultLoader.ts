import { generateStableFingerprintKey } from '@app/core/sessionPersistent/fingerprint';
import { decryptData } from '@app/utils/crypto';
import {
  getAllItemsFromMemory,
  setCredentialsInMemory,
  setBankCardsInMemory,
  setSecureNotesInMemory
} from '../session/memory';

const USER_SECRET_KEY_STORAGE = 'simplipass_persistent_user_secret_key';
const VAULT_ENCRYPTED_STORAGE = 'simplipass_encrypted_vault';

/**
 * Decrypts the vault using the userSecretKey
 * @param vaultEncrypted - The encrypted vault string
 * @param userSecretKey - The decrypted user secret key
 * @returns The decrypted vault object or null
 */
export async function decryptVaultWithUserSecretKey(vaultEncrypted: string, userSecretKey: string): Promise<any | null> {
  try {
    const decrypted = await decryptData(vaultEncrypted, userSecretKey);
    if (!decrypted) return null;
    return JSON.parse(decrypted);
  } catch (e) {
    console.error('[VaultLoader] Failed to decrypt vault:', e);
    return null;
  }
}

/**
 * Loads the vault into memory if not already present
 * - Loads userSecretKeyEncrypted from storage
 * - Decrypts with deviceFingerprintKey
 * - Loads vaultEncrypted and decrypts with userSecretKey
 * - Populates memory with vault data
 */
export async function loadVaultIfNeeded(): Promise<void> {
  const items = getAllItemsFromMemory();
  if (
    items.credentials.length > 0 ||
    items.bankCards.length > 0 ||
    items.secureNotes.length > 0
  ) {
    return;
  }
  try {
    // 1. Load userSecretKeyEncrypted from storage
    const userKeyResult = await chrome.storage.local.get([USER_SECRET_KEY_STORAGE]);
    const userKeyData = userKeyResult[USER_SECRET_KEY_STORAGE];
    if (!userKeyData || !userKeyData.encryptedKey) {
      console.warn('[VaultLoader] No persistent userSecretKey found');
      return;
    }
    // 2. Derive deviceFingerprintKey
    const fingerprintKey = await generateStableFingerprintKey();
    // 3. Decrypt userSecretKey
    const userSecretKey = await decryptData(userKeyData.encryptedKey, fingerprintKey);
    if (!userSecretKey) {
      console.warn('[VaultLoader] Failed to decrypt userSecretKey');
      return;
    }
    // 4. Load vaultEncrypted from storage
    const vaultResult = await chrome.storage.local.get([VAULT_ENCRYPTED_STORAGE]);
    const vaultEncrypted = vaultResult[VAULT_ENCRYPTED_STORAGE];
    if (!vaultEncrypted) {
      console.warn('[VaultLoader] No encrypted vault found');
      return;
    }
    // 5. Decrypt vault
    const vault = await decryptVaultWithUserSecretKey(vaultEncrypted, userSecretKey);
    if (!vault) {
      console.warn('[VaultLoader] Failed to decrypt vault');
      return;
    }
    // 6. Store in memory
    setCredentialsInMemory(vault.credentials || []);
    setBankCardsInMemory(vault.bankCards || []);
    setSecureNotesInMemory(vault.secureNotes || []);
    console.log('[VaultLoader] Vault loaded into memory');
  } catch (e) {
    console.error('[VaultLoader] Error loading vault:', e);
  }
} 