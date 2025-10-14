/**
 * Extension Platform Adapter Implementation
 * 
 * Handles all extension-specific functionality including:
 * - Clipboard operations
 * - Network detection
 * - Email remembering
 * 
 * Works in both web mode (dev) and extension mode (production).
 */

import { PlatformAdapter} from '@common/core/adapters/platform.adapter';
import { browser } from '@extension/shims/browserAPI';

export class ExtensionPlatformAdapter implements PlatformAdapter {

  // ===== Core Platform Capabilities =====

  async getAppVersion(): Promise<string> {
    try {
      const manifest = browser.runtime.getManifest();
      return manifest.version || '1.0.0';
    } catch (_error) {
      return '1.0.0';
    }
  }

  async getPlatformInfo(): Promise<{ platform: string; version: string }> {
    const version = await this.getAppVersion();
    return { platform: 'extension', version };
  }

  // ===== Storage Operations =====

  async supportsBiometric(): Promise<boolean> {
    return false; // Extensions don't support biometrics
  }

  async supportsOfflineVault(): Promise<boolean> {
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
        await browser.storage.local.set({ rememberedEmail: email });
      } else {
        await browser.storage.local.remove('rememberedEmail');
      }
    } catch (_error) {
      throw new Error('Failed to set remembered email');
    }
  }

  async getRememberedEmail(): Promise<string | null> {
    try {
      const result = await browser.storage.local.get('rememberedEmail');
      return result.rememberedEmail || null;
    } catch (_error) {
      return null;
    }
  }

  // ===== Session Management =====

  async clearSession(): Promise<void> {
    try {
      await browser.storage.local.remove(['rememberedEmail', 'sessionMetadata']);
    } catch (_error) {
      throw new Error('Failed to clear session');
    }
  }

  // ===== Session Metadata =====

  async storeSessionMetadata(metadata: any): Promise<void> {
    try {
      await browser.storage.local.set({ sessionMetadata: metadata });
    } catch (_error) {
      throw new Error('Failed to store session metadata');
    }
  }

  async getSessionMetadata(): Promise<any> {
    try {
      const result = await browser.storage.local.get('sessionMetadata');
      return result.sessionMetadata || null;
    } catch (_error) {
      return null;
    }
  }

  async deleteSessionMetadata(): Promise<void> {
    try {
      await browser.storage.local.remove('sessionMetadata');
    } catch (_error) {
      throw new Error('Failed to delete session metadata');
    }
  }
}