/**
 * Bridge utility for connecting extension autofill logic with core vault system
 * Provides safe access to decrypted vault data with proper session validation
 * Uses centralized items service for data access
 */

import { loadItemsWithFallback } from '@common/core/services/itemsService';
import { CredentialDecrypted, BankCardDecrypted, SecureNoteDecrypted } from '@common/core/types/types';

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
 * Get items using centralized items service
 */
async function getItemsFromService(): Promise<(CredentialDecrypted | BankCardDecrypted | SecureNoteDecrypted)[]> {
  try {
    return await loadItemsWithFallback();
  } catch (error) {
    console.error('[AutofillBridge] Error getting items from service:', error);
    return [];
  }
}

/**
 * Check if autofill is available (valid session exists)
 * @returns true if autofill can be used, false otherwise
 */
export async function isAutofillAvailable(): Promise<boolean> {
  try {
    const items = await getItemsFromService();
    const credentials = items.filter(item => item.itemType === 'credential');
    return credentials.length > 0;
  } catch (error) {
    console.error('[AutofillBridge] Error checking autofill availability:', error);
    return false;
  }
}

/**
 * Get matching credentials for a domain with session validation
 * @param domain The domain to match against
 * @returns Array of matching credentials (non-sensitive data only)
 */
export async function getMatchingCredentials(domain: string): Promise<Array<{
  id: string;
  title: string;
  username: string;
  url?: string;
}>> {
  try {
    // Check if session is valid before accessing decrypted data
    if (!(await isAutofillAvailable())) {
      console.log('[AutofillBridge] No valid session for autofill');
      return [];
    }

    const items = await getItemsFromService();
    const credentials = items.filter(item => item.itemType === 'credential') as CredentialDecrypted[];
    const pageRootDomain = getRootDomain(domain);
    
    return credentials
      .filter((credential) => {
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
      .map((credential) => ({
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
export async function getCredentialForInjection(credentialId: string): Promise<{
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
} | null> {
  try {
    // Check if session is valid before accessing decrypted data
    if (!(await isAutofillAvailable())) {
      console.log('[AutofillBridge] No valid session for credential injection');
      return null;
    }

    const items = await getItemsFromService();
    const credentials = items.filter(item => item.itemType === 'credential') as CredentialDecrypted[];
    const credential = credentials.find((c) => c.id === credentialId);
    
    if (!credential || credential.itemType !== 'credential') {
      return null;
    }
    
    return {
      id: credential.id,
      title: credential.title,
      username: credential.username,
      password: credential.password,
      url: credential.url
    };
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
    // Use the centralized items service to check if vault is available
    const items = await loadItemsWithFallback();
    return items.length > 0;
  } catch (error) {
    console.error('[AutofillBridge] Error restoring vault:', error);
    return false;
  }
}

/**
 * Get all available credentials for current session
 * @returns Array of all credentials (non-sensitive data only)
 */
export async function getAllCredentials(): Promise<Array<{
  id: string;
  title: string;
  username: string;
  url?: string;
}>> {
  try {
    if (!(await isAutofillAvailable())) {
      return [];
    }

    const items = await getItemsFromService();
    const credentials = items.filter(item => item.itemType === 'credential') as CredentialDecrypted[];
    return credentials.map((credential) => ({
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
export async function getAllBankCards(): Promise<Array<{
  id: string;
  title: string;
  cardNumber: string;
  url?: string;
}>> {
  try {
    if (!(await isAutofillAvailable())) {
      return [];
    }

    const items = await getItemsFromService();
    const bankCards = items.filter(item => item.itemType === 'bankCard') as BankCardDecrypted[];
    return bankCards.map((card) => ({
      id: card.id,
      title: card.title,
      cardNumber: card.cardNumber,
      url: 'url' in card ? (card as any).url : '',
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
export async function getAllSecureNotes(): Promise<Array<{
  id: string;
  title: string;
  url?: string;
}>> {
  try {
    if (!(await isAutofillAvailable())) {
      return [];
    }

    const items = await getItemsFromService();
    const secureNotes = items.filter(item => item.itemType === 'secureNote') as SecureNoteDecrypted[];
    return secureNotes.map((note) => ({
      id: note.id,
      title: note.title,
      url: 'url' in note ? (note as any).url : '',
    }));
  } catch (error) {
    console.error('[AutofillBridge] Error getting all secure notes:', error);
    return [];
  }
}

/**
 * Get vault data for autofill (for debugging/testing)
 * @returns Promise with vault data or null
 */
export async function getVaultForAutofill() {
  try {
    const items = await getItemsFromService();
    return { items };
  } catch (error) {
    console.error('[AutofillBridge] Error getting vault for autofill:', error);
    return null;
  }
} 