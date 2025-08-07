/**
 * Extension-specific items service
 * Uses direct Chrome APIs to avoid React Native dependencies
 */

import { matchCredentialDomain, getDomainMatchingDetails } from '../utils/domainMatching';

export interface IExtensionItemsService {
  getMatchingCredentials(domain: string): Promise<Array<{
    id: string;
    title: string;
    username: string;
    url?: string;
  }>>;
  getCredentialForInjection(credentialId: string): Promise<{
    id: string;
    title: string;
    username: string;
    password: string;
    url?: string;
  } | null>;
  getAllCredentials(): Promise<Array<{
    id: string;
    title: string;
    username: string;
    url?: string;
  }>>;
}

export class ExtensionItemsService implements IExtensionItemsService {
  private async getAllItems(): Promise<any[]> {
    try {
      const sessionData = await chrome.storage.session.get(['encryptedVault']);
      if (!sessionData.encryptedVault) return [];
      
      const vaultData = JSON.parse(sessionData.encryptedVault);
      return vaultData.items || [];
    } catch (error) {
      console.error('[ExtensionItemsService] Failed to get all items:', error);
      return [];
    }
  }

  async getMatchingCredentials(domain: string): Promise<Array<{
    id: string;
    title: string;
    username: string;
    url?: string;
  }>> {
    try {
      // Get all items from Chrome storage directly
      const allItems = await this.getAllItems();
      
      // Filter credentials that match the domain using utility function
      const matchingCredentials = allItems
        .filter((item: any) => item.itemType === 'credential')
        .filter((cred: any) => {
          if (!cred.url) return false;
          
          const matches = matchCredentialDomain(cred, domain);
          const details = getDomainMatchingDetails(domain, cred.url);
          
          console.log('[ExtensionItemsService] Domain matching:', {
            currentDomain: details.currentDomain,
            storedDomain: details.storedDomain,
            credUrl: cred.url,
            normalizedCurrent: details.normalizedCurrent,
            normalizedStored: details.normalizedStored,
            matches: details.matches,
            matchType: details.matchType
          });
          
          return matches;
        });
      
      console.log('[ExtensionItemsService] Matching credentials for domain', domain, ':', matchingCredentials.length);
      return matchingCredentials.map((cred: any) => ({
        id: cred.id,
        title: cred.title || 'Untitled',
        username: cred.username || '',
        url: cred.url
      }));
    } catch (error) {
      console.error('[ExtensionItemsService] Error getting matching credentials:', error);
      return [];
    }
  }

  async getCredentialForInjection(credentialId: string): Promise<{
    id: string;
    title: string;
    username: string;
    password: string;
    url?: string;
  } | null> {
    try {
      // Get all items from Chrome storage directly
      const allItems = await this.getAllItems();
      
      // Find the specific credential by ID
      const credential = allItems
        .filter((item: any) => item.itemType === 'credential')
        .find((cred: any) => cred.id === credentialId);
      
      if (credential) {
        console.log('[ExtensionItemsService] Found credential for injection:', credential.title);
        return {
          id: credential.id,
          title: credential.title || 'Untitled',
          username: credential.username || '',
          password: credential.password || '',
          url: credential.url
        };
      } else {
        console.log('[ExtensionItemsService] Credential not found for ID:', credentialId);
        return null;
      }
    } catch (error) {
      console.error('[ExtensionItemsService] Error getting credential for injection:', error);
      return null;
    }
  }

  async getAllCredentials(): Promise<Array<{
    id: string;
    title: string;
    username: string;
    url?: string;
  }>> {
    try {
      // Get all items from Chrome storage directly
      const allItems = await this.getAllItems();
      
      // Filter credentials only
      const credentials = allItems
        .filter((item: any) => item.itemType === 'credential')
        .map((cred: any) => ({
          id: cred.id,
          title: cred.title || 'Untitled',
          username: cred.username || '',
          url: cred.url
        }));
      
      return credentials;
    } catch (error) {
      console.error('[ExtensionItemsService] Error getting all credentials:', error);
      return [];
    }
  }
}

// Export singleton instance
export const extensionItemsService = new ExtensionItemsService();
