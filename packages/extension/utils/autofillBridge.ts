/**
 * Bridge utility for connecting extension autofill logic with core vault system
 * Provides safe access to decrypted vault data with proper session validation
 */

import { loadVaultIfNeeded } from './vaultLoader';
import { useItemStates } from '@common/core/states/itemStates';

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
  const itemStates = useItemStates.getState();
  const credentials = itemStates.getItemsByTypeFromState('credential');
  return credentials.length > 0;
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

    const itemStates = useItemStates.getState();
    const credentials = itemStates.getItemsByTypeFromState('credential');
    const pageRootDomain = getRootDomain(domain);
    
    return credentials
      .filter((credential: any) => {
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
      .map((credential: any) => ({
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

    const itemStates = useItemStates.getState();
    const credentials = itemStates.getItemsByTypeFromState('credential');
    const credential = credentials.find((c: any) => c.id === credentialId);
    
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

    const itemStates = useItemStates.getState();
    const credentials = itemStates.getItemsByTypeFromState('credential');
    return credentials.map((credential: any) => ({
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

    const itemStates = useItemStates.getState();
    const bankCards = itemStates.getItemsByTypeFromState('bankCard');
    return bankCards.map((card: any) => ({
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
export function getAllSecureNotes(): Array<{
  id: string;
  title: string;
  url?: string;
}> {
  try {
    if (!isAutofillAvailable()) {
      return [];
    }

    const itemStates = useItemStates.getState();
    const secureNotes = itemStates.getItemsByTypeFromState('secureNote');
    return secureNotes.map((note: any) => ({
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
 * Get vault data for autofill operations
 * @returns Promise<{credentials: any[], bankCards: any[], secureNotes: any[]}>
 */
export async function getVaultForAutofill() {
  try {
    await loadVaultIfNeeded();
    
    const itemStates = useItemStates.getState();
    const credentials = itemStates.getItemsByTypeFromState('credential');
    const bankCards = itemStates.getItemsByTypeFromState('bankCard');
    const secureNotes = itemStates.getItemsByTypeFromState('secureNote');
    
    return {
      credentials,
      bankCards,
      secureNotes,
    };
  } catch (error) {
    console.error('[AutofillBridge] Error getting vault for autofill:', error);
    return {
      credentials: [],
      bankCards: [],
      secureNotes: [],
    };
  }
} 