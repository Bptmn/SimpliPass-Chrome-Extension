/**
 * Vault Service - Layer 2: Business Logic
 * 
 * Handles vault management operations including local storage and synchronization.
 * Orchestrates vault operations between hooks and libraries.
 */

import { CredentialDecrypted, BankCardDecrypted, SecureNoteDecrypted } from '@common/core/types/types';
import { encryptData, decryptData } from '@common/utils/crypto';
import { platform } from '../platform/platform.adapter';

type ItemDecrypted = CredentialDecrypted | BankCardDecrypted | SecureNoteDecrypted;

/**
 * Store encrypted vault in local storage
 */
export async function setLocalVault(items: ItemDecrypted[]): Promise<void> {
  try {
    if (!platform.storeEncryptedVault) {
      throw new Error('Local vault storage not supported on this platform');
    }
    
    // Get device fingerprint for encryption
    const deviceFingerprint = await platform.getDeviceFingerprint();
    
    // Encrypt the vault data
    const encryptedData = encryptData(deviceFingerprint, JSON.stringify(items));
    
    // Store encrypted vault
    await platform.storeEncryptedVault({
      version: '1.0',
      encryptedData,
      iv: '', // Not used with ChaCha20Poly1305
      salt: '', // Not used with ChaCha20Poly1305
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    throw new Error(`Failed to store local vault: ${error}`);
  }
}

/**
 * Load encrypted vault from local storage
 */
export async function getLocalVault(): Promise<ItemDecrypted[]> {
  try {
    if (!platform.getEncryptedVault) {
      throw new Error('Local vault storage not supported on this platform');
    }
    
    // Get encrypted vault
    const encryptedVault = await platform.getEncryptedVault();
    
    if (!encryptedVault) {
      return [];
    }
    
    // Get device fingerprint for decryption
    const deviceFingerprint = await platform.getDeviceFingerprint();
    
    // Decrypt the vault data
    const decryptedData = decryptData(deviceFingerprint, encryptedVault.encryptedData);
    
    return JSON.parse(decryptedData);
  } catch (error) {
    throw new Error(`Failed to get local vault: ${error}`);
  }
}

/**
 * Clear local vault
 */
export async function clearLocalVault(): Promise<void> {
  try {
    if (platform.deleteEncryptedVault) {
      await platform.deleteEncryptedVault();
    }
  } catch (error) {
    throw new Error(`Failed to clear local vault: ${error}`);
  }
}

 