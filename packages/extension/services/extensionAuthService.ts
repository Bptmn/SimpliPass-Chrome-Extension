/**
 * Extension-specific authentication service
 * Uses direct Chrome APIs to avoid React Native dependencies
 */

export interface IExtensionAuthService {
  isAuthenticated(): Promise<boolean>;
  hasUserSecretKey(): Promise<boolean>;
  hasCredentials(): Promise<boolean>;
  getCurrentUserId(): string | null;
  getLocalVault(): Promise<any[]>;
}

export class ExtensionAuthService implements IExtensionAuthService {
  async isAuthenticated(): Promise<boolean> {
    try {
      const sessionData = await chrome.storage.session.get(['user']);
      return !!(sessionData.user && sessionData.user.id);
    } catch (error) {
      console.error('[ExtensionAuthService] Failed to check authentication:', error);
      return false;
    }
  }

  async hasUserSecretKey(): Promise<boolean> {
    try {
      const sessionData = await chrome.storage.session.get(['userSecretKey']);
      return !!sessionData.userSecretKey;
    } catch (error) {
      console.error('[ExtensionAuthService] Failed to check user secret key:', error);
      return false;
    }
  }

  async hasCredentials(): Promise<boolean> {
    try {
      const sessionData = await chrome.storage.session.get(['encryptedVault']);
      if (!sessionData.encryptedVault) return false;
      
      const vaultData = JSON.parse(sessionData.encryptedVault);
      const vaultItems = vaultData.items;
      return Array.isArray(vaultItems) && vaultItems.length > 0;
    } catch (error) {
      console.error('[ExtensionAuthService] Failed to check credentials:', error);
      return false;
    }
  }

  getCurrentUserId(): string | null {
    // This would need to be implemented with direct Chrome API calls
    // For now, return null and let the calling code handle it
    return null;
  }

  async getLocalVault(): Promise<any[]> {
    try {
      const sessionData = await chrome.storage.session.get(['encryptedVault']);
      if (!sessionData.encryptedVault) return [];
      
      const vaultData = JSON.parse(sessionData.encryptedVault);
      return vaultData.items || [];
    } catch (error) {
      console.error('[ExtensionAuthService] Failed to get local vault:', error);
      return [];
    }
  }
}

// Export singleton instance
export const extensionAuthService = new ExtensionAuthService();
