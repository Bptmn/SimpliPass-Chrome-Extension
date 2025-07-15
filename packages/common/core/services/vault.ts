/**
 * Vault Service - Layer 2: Business Logic
 * 
 * Handles vault management operations including local storage and synchronization.
 * Orchestrates vault operations between hooks and libraries.
 */

import { VaultError } from '../types/errors.types';
import { CredentialDecrypted, BankCardDecrypted, SecureNoteDecrypted } from '@common/core/types/types';
import { EncryptedVault } from '../types/platform.types';
import { encryptData, decryptData } from '@common/utils/crypto';
import { getPlatformAdapter } from '../platform/platform.adapter';

type ItemDecrypted = CredentialDecrypted | BankCardDecrypted | SecureNoteDecrypted;

/**
 * Store encrypted vault in local storage
 */
export async function setLocalVault(items: ItemDecrypted[]): Promise<void> {
  try {
    const adapter = await getPlatformAdapter();
    
    if (!adapter.storeEncryptedVault) {
      console.warn('[Vault] Platform does not support local vault storage, skipping');
      return;
    }
    
    // Handle empty vault gracefully
    if (!items || items.length === 0) {
      console.log('[Vault] Empty vault, storing empty vault data');
      const emptyVault = {
        version: '1.0',
        encryptedData: '',
        iv: '',
        salt: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await adapter.storeEncryptedVault(emptyVault);
      console.log('[Vault] Successfully stored empty local vault');
      return;
    }
    
    // 1. Get device fingerprint for encryption
    const deviceFingerprintKey = await adapter.getDeviceFingerprint();
    
    // 2. Encrypt vault data (Library Layer)
    const vaultData = await encryptVaultForStorage(items, deviceFingerprintKey);
    
    // 3. Store encrypted vault (Library Layer)
    await adapter.storeEncryptedVault(vaultData);
    
    console.log('[Vault] Successfully stored local vault with', items.length, 'items');
  } catch (error) {
    console.error('[Vault] Failed to store local vault:', error);
    // Don't throw error, just log it and continue
    // This allows the login flow to complete even if vault storage fails
  }
}

/**
 * Load encrypted vault from local storage
 */
export async function getLocalVault(): Promise<ItemDecrypted[]> {
  try {
    const adapter = await getPlatformAdapter();
    
    if (!adapter.getEncryptedVault) {
      throw new VaultError('Platform does not support local vault storage');
    }
    
    // 1. Get encrypted vault from storage (Library Layer)
    const encryptedVault = await adapter.getEncryptedVault();
    
    if (!encryptedVault) {
      console.log('[Vault] No local vault found');
      return [];
    }
    
    // 2. Get device fingerprint for decryption
    const deviceFingerprintKey = await adapter.getDeviceFingerprint();
    
    // 3. Decrypt vault data (Library Layer)
    const items = await decryptVaultFromStorage(encryptedVault, deviceFingerprintKey);
    
    console.log('[Vault] Successfully loaded local vault with', items.length, 'items');
    return items;
  } catch (error) {
    throw new VaultError('Failed to load local vault', error as Error);
  }
}

/**
 * Clear local vault
 */
export async function clearLocalVault(): Promise<void> {
  try {
    const adapter = await getPlatformAdapter();
    
    if (adapter.deleteEncryptedVault) {
      await adapter.deleteEncryptedVault();
      console.log('[Vault] Successfully cleared local vault');
    }
  } catch (error) {
    throw new VaultError('Failed to clear local vault', error as Error);
  }
}

/**
 * Encrypt vault data for local storage
 */
async function encryptVaultForStorage(
  items: ItemDecrypted[],
  deviceFingerprintKey: string
): Promise<EncryptedVault> {
  try {
    // 1. Convert items to JSON
    const vaultData = {
      version: '1.0',
      items: items,
      timestamp: new Date().toISOString(),
    };
    
    const vaultJson = JSON.stringify(vaultData);
    
    // 2. Encrypt vault data (Library Layer)
    const encryptedData = await encryptData(deviceFingerprintKey, vaultJson);
    
    // 3. Create encrypted vault object
    return {
      version: '1.0',
      encryptedData,
      iv: '', // Will be part of encrypted data
      salt: deviceFingerprintKey,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    throw new VaultError('Failed to encrypt vault for storage', error as Error);
  }
}

/**
 * Decrypt vault data from local storage
 */
async function decryptVaultFromStorage(
  encryptedVault: EncryptedVault,
  deviceFingerprintKey: string
): Promise<ItemDecrypted[]> {
  try {
    // 1. Decrypt vault data (Library Layer)
    const decryptedJson = await decryptData(deviceFingerprintKey, encryptedVault.encryptedData);
    
    // 2. Parse vault data
    const vaultData = JSON.parse(decryptedJson);
    
    if (!vaultData.items || !Array.isArray(vaultData.items)) {
      console.warn('[Vault] Invalid vault data format');
      return [];
    }
    
    return vaultData.items as ItemDecrypted[];
  } catch (error) {
    throw new VaultError('Failed to decrypt vault from storage', error as Error);
  }
} 