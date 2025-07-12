/**
 * Bridge utility for connecting extension autofill logic with core vault system
 * Provides safe access to decrypted vault data with proper session validation
 */

import { loadVaultIfNeeded } from './vaultLoader';
import { getAllItemsFromMemory } from '../session/memory';

/**
 * Extracts the root domain from a hostname, removing 'www.' and subdomains.
 * @param hostname The full hostname (e.g., 'www.example.co.uk')
 * @returns The root domain (e.g., 'example.co.uk')
 */
function getRootDomain(hostname: string): string {
  const parts = hostname.split('.').filter(Boolean);
  if (parts.length <= 2) return hostname.replace(/^www\./, '');
  return parts.slice(-2).join('.');
}

/**
 * Check if autofill is available (valid session exists)
 * @returns true if autofill can be used, false otherwise
 */
export function isAutofillAvailable(): boolean {
  return getAllItemsFromMemory().credentials.length > 0;
}

/**
 * Get matching credentials for a domain with session validation
 * @param domain The domain to match against
 * @returns Array of matching credentials (non-sensitive data only)
 */
export function getMatchingCredentials(domain: string): Array<{
  id: string;
  title: string;
  username: string;
  url?: string;
}> {
  try {
    // Check if session is valid before accessing decrypted data
    if (!isAutofillAvailable()) {
      console.log('[AutofillBridge] No valid session for autofill');
      return [];
    }

    const items = getAllItemsFromMemory();
    const credentials = items.credentials;
    const pageRootDomain = getRootDomain(domain);
    
    return credentials
      .filter(credential => {
        if (!credential.url) return false;
        
        const credRootDomain = getRootDomain(credential.url);
        const credDomain = credential.url;
        
        // Exact domain match
        if (credDomain === domain || credDomain === pageRootDomain) {
          return true;
        }
        
        // Root domain match
        if (credRootDomain === pageRootDomain) {
          return true;
        }
        
        // Subdomain match (e.g., login.example.com matches example.com)
        if (domain.includes(credRootDomain) && domain !== credRootDomain) {
          return true;
        }
        
        return false;
      })
      .map(credential => ({
        id: credential.id,
        title: credential.title,
        username: credential.username,
        url: credential.url
      }));
  } catch (error) {
    console.error('[AutofillBridge] Error finding matching credentials:', error);
    return [];
  }
}

/**
 * Get full credential data for injection (with password)
 * @param credentialId The ID of the credential to retrieve
 * @returns Full credential data or null if not found
 */
export function getCredentialForInjection(credentialId: string): {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
} | null {
  try {
    // Check if session is valid before accessing decrypted data
    if (!isAutofillAvailable()) {
      console.log('[AutofillBridge] No valid session for credential injection');
      return null;
    }

    const items = getAllItemsFromMemory();
    return items.credentials.find(c => c.id === credentialId) || null;
  } catch (error) {
    console.error('[AutofillBridge] Error getting credential for injection:', error);
    return null;
  }
}

/**
 * Restore vault if session is valid
 * @returns Promise<boolean> true if vault was restored successfully
 */
export async function restoreVaultForAutofill(): Promise<boolean> {
  try {
    await loadVaultIfNeeded();
    return true;
  } catch (error) {
    console.error('[AutofillBridge] Error restoring vault:', error);
    return false;
  }
}

/**
 * Get all available credentials for current session
 * @returns Array of all credentials (non-sensitive data only)
 */
export function getAllCredentials(): Array<{
  id: string;
  title: string;
  username: string;
  url?: string;
}> {
  try {
    if (!isAutofillAvailable()) {
      return [];
    }

    const items = getAllItemsFromMemory();
    return items.credentials.map(credential => ({
      id: credential.id,
      title: credential.title,
      username: credential.username,
      url: credential.url
    }));
  } catch (error) {
    console.error('[AutofillBridge] Error getting all credentials:', error);
    return [];
  }
}

/**
 * Get all available bank cards for current session
 * @returns Array of all bank cards (non-sensitive data only)
 */
export function getAllBankCards(): Array<{
  id: string;
  title: string;
  cardNumber: string;
  url?: string;
}> {
  try {
    if (!isAutofillAvailable()) {
      return [];
    }

    const items = getAllItemsFromMemory();
    return items.bankCards.map(card => ({
      id: card.id,
      title: card.title,
      cardNumber: card.cardNumber,
      url: card.url
    }));
  } catch (error) {
    console.error('[AutofillBridge] Error getting all bank cards:', error);
    return [];
  }
}

/**
 * Get all available secure notes for current session
 * @returns Array of all secure notes (non-sensitive data only)
 */
export function getAllSecureNotes(): Array<{
  id: string;
  title: string;
  url?: string;
}> {
  try {
    if (!isAutofillAvailable()) {
      return [];
    }

    const items = getAllItemsFromMemory();
    return items.secureNotes.map(note => ({
      id: note.id,
      title: note.title,
      url: note.url
    }));
  } catch (error) {
    console.error('[AutofillBridge] Error getting all secure notes:', error);
    return [];
  }
} 

export async function getVaultForAutofill() {
  let items = getAllItemsFromMemory();
  if (
    items.credentials.length === 0 &&
    items.bankCards.length === 0 &&
    items.secureNotes.length === 0
  ) {
    await loadVaultIfNeeded();
    items = getAllItemsFromMemory();
  }
  return items;
} 