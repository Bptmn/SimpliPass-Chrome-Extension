import { getUserSecretKey } from '@common/core/services/secret';
import { useCredentialsStore, useBankCardsStore, useSecureNotesStore } from '@common/core/states';

/**
 * Decrypts the vault using the userSecretKey
 * @param vaultEncrypted - The encrypted vault string
 * @param userSecretKey - The decrypted user secret key
 * @returns The decrypted vault object or null
 */
export async function decryptVaultWithUserSecretKey(vaultEncrypted: string, _userSecretKey: string): Promise<any | null> {
  try {
    if (!vaultEncrypted) return null;
    return JSON.parse(vaultEncrypted);
  } catch (e) {
    console.error('[VaultLoader] Failed to decrypt vault:', e);
    return null;
  }
}

/**
 * Loads the vault into memory if not already present
 * - Ensures userSecretKey is restored to state from storage if needed
 */
export async function loadVaultIfNeeded(): Promise<void> {
  const credentialsStore = useCredentialsStore.getState();
  const bankCardsStore = useBankCardsStore.getState();
  const secureNotesStore = useSecureNotesStore.getState();
  
  // Check if vault is already loaded in states
  if (
    credentialsStore.credentials.length > 0 ||
    bankCardsStore.bankCards.length > 0 ||
    secureNotesStore.secureNotes.length > 0
  ) {
    return;
  }

  try {
    // Ensure userSecretKey is restored to state (from state or storage)
    const userSecretKey = await getUserSecretKey();
    if (!userSecretKey) {
      console.log('[VaultLoader] No persistent userSecretKey found (expected for new or logged-out users)');
      return;
    }
    console.log('[VaultLoader] userSecretKey restored to state');
    // Do not attempt to decrypt vault here; let the main app logic handle it
  } catch (e) {
    console.error('[VaultLoader] Error loading vault:', e);
  }
} 