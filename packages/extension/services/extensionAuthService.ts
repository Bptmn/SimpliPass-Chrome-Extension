/**
 * Extension-specific authentication service
 * Wraps common auth service for extension-specific functionality
 */

import { authService } from '@common/core/services/authService';
import { secretsService } from '@common/core/services/secretsService';
import { vaultService } from '@common/core/services/vaultService';
import { itemsService } from '@common/core/services/itemsService';

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
      return await authService.isAuthenticated();
    } catch (error) {
      console.error('[ExtensionAuthService] Failed to check authentication:', error);
      return false;
    }
  }

  async hasUserSecretKey(): Promise<boolean> {
    try {
      return await secretsService.hasUserSecretKey();
    } catch (error) {
      console.error('[ExtensionAuthService] Failed to check user secret key:', error);
      return false;
    }
  }

  async hasCredentials(): Promise<boolean> {
    try {
      const vault = await vaultService.getLocalVault();
      return Array.isArray(vault) && vault.length > 0;
    } catch (error) {
      console.error('[ExtensionAuthService] Failed to check credentials:', error);
      return false;
    }
  }

  getCurrentUserId(): string | null {
    return authService.getCurrentUserId();
  }

  async getLocalVault(): Promise<any[]> {
    try {
      return await vaultService.getLocalVault();
    } catch (error) {
      console.error('[ExtensionAuthService] Failed to get local vault:', error);
      return [];
    }
  }
}

// Export singleton instance
export const extensionAuthService = new ExtensionAuthService();
