/**
 * Extension Platform Adapter Implementation
 * 
 * Handles all extension-specific functionality including:
 * - Clipboard operations
 * - Network detection
 * - Email remembering
 */

import { PlatformAdapter} from '@common/core/adapters/platform.adapter';

export class ExtensionPlatformAdapter implements PlatformAdapter {

  // ===== Storage Operations =====

  supportsBiometric(): boolean {
    return false; // Extensions don't support biometrics
  }

  supportsOfflineVault(): boolean {
    return true;
  }

  // ===== Authentication =====

  async authenticateWithBiometrics(): Promise<boolean> {
    throw new Error('Biometric authentication not supported in extension');
  }

  async isBiometricAvailable(): Promise<boolean> {
    return false;
  }

  // ===== Clipboard Operations =====

  async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      throw new Error(`Failed to copy to clipboard: ${error}`);
    }
  }

  async getFromClipboard(): Promise<string> {
    try {
      return await navigator.clipboard.readText();
    } catch (error) {
      throw new Error(`Failed to get from clipboard: ${error}`);
    }
  }


  // ===== Network Operations =====

  async isOnline(): Promise<boolean> {
    return navigator.onLine;
  }

  async getNetworkStatus(): Promise<'online' | 'offline' | 'unknown'> {
    if (navigator.onLine) {
      return 'online';
    } else {
      return 'offline';
    }
  }

  // ===== Email Remembering =====

  async setRememberedEmail(email: string | null): Promise<void> {
    try {
      if (email) {
        await chrome.storage.local.set({ rememberedEmail: email });
      } else {
        await chrome.storage.local.remove('rememberedEmail');
      }
    } catch (_error) {
      throw new Error('Failed to set remembered email');
    }
  }

  async getRememberedEmail(): Promise<string | null> {
    try {
      const result = await chrome.storage.local.get('rememberedEmail');
      return result.rememberedEmail || null;
    } catch (_error) {
      return null;
    }
  }
}