/**
 * Extension Platform Adapter Implementation
 * 
 * Handles all extension-specific functionality including:
 * - Chrome storage API
 * - Extension-specific storage
 * - Clipboard operations
 * - Network detection
 */

import { PlatformAdapter, EncryptedVault } from '@common/core/types/platform.types';

export class ExtensionPlatformAdapter implements PlatformAdapter {
  private config = {
    storageKey: 'userSecretKey',
    vaultKey: 'encryptedVault',
    sessionKey: 'sessionData',
  };

  // ===== Storage Operations =====

  async getUserSecretKey(): Promise<string | null> {
    try {
      const result = await chrome.storage.local.get(this.config.storageKey);
      return result[this.config.storageKey] || null;
    } catch (error) {
      throw new Error(`Failed to retrieve user secret key from storage: ${error}`);
    }
  }

  async storeUserSecretKey(key: string): Promise<void> {
    try {
      await chrome.storage.local.set({ [this.config.storageKey]: key });
    } catch (error) {
      throw new Error(`Failed to store user secret key in storage: ${error}`);
    }
  }

  async deleteUserSecretKey(): Promise<void> {
    try {
      await chrome.storage.local.remove(this.config.storageKey);
    } catch (error) {
      throw new Error(`Failed to delete user secret key from storage: ${error}`);
    }
  }

  // ===== Platform Information =====

  getPlatformName(): 'mobile' | 'extension' {
    return 'extension';
  }

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

  // ===== Session Management =====

  async clearSession(): Promise<void> {
    try {
      await chrome.storage.local.clear();
    } catch (error) {
      throw new Error(`Failed to clear session data: ${error}`);
    }
  }

  /**
   * Generate a reliable device fingerprint using multiple stable characteristics
   * Based on research from fingerprinting techniques, this uses:
   * - Hardware characteristics (CPU cores, memory)
   * - Browser capabilities (WebGL, Canvas)
   * - Extension-specific identifiers
   * - Stable browser APIs
   */
  async getDeviceFingerprint(): Promise<string> {
    try {
      const fingerprintComponents: string[] = [];

      // 1. Extension ID (most stable identifier)
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        fingerprintComponents.push(`ext:${chrome.runtime.id}`);
      }

      // 2. Hardware characteristics
      if (typeof navigator !== 'undefined') {
        // CPU cores
        if (navigator.hardwareConcurrency) {
          fingerprintComponents.push(`cpu:${navigator.hardwareConcurrency}`);
        }
        
        // Device memory
        if ('deviceMemory' in navigator) {
          fingerprintComponents.push(`mem:${(navigator as any).deviceMemory}`);
        }
      }

      // 3. Browser capabilities (stable across sessions)
      if (typeof navigator !== 'undefined') {
        // Language and languages
        fingerprintComponents.push(`lang:${navigator.language}`);
        if (navigator.languages && navigator.languages.length > 0) {
          fingerprintComponents.push(`langs:${navigator.languages.slice(0, 3).join(',')}`);
        }
        
        // Platform
        if (navigator.platform) {
          fingerprintComponents.push(`platform:${navigator.platform}`);
        }
        
        // User agent (sanitized)
        if (navigator.userAgent) {
          const ua = navigator.userAgent;
          // Extract browser and OS info without version numbers
          const browserMatch = ua.match(/(Chrome|Firefox|Safari|Edge)\//);
          const osMatch = ua.match(/(Windows|Mac|Linux|Android|iOS)/);
          if (browserMatch) fingerprintComponents.push(`browser:${browserMatch[1]}`);
          if (osMatch) fingerprintComponents.push(`os:${osMatch[1]}`);
        }
      }

      // 4. Canvas fingerprint (hardware-dependent)
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Draw a simple pattern that varies by hardware
          ctx.fillStyle = 'rgb(255,255,255)';
          ctx.fillRect(0, 0, 1, 1);
          ctx.fillStyle = 'rgb(0,0,0)';
          ctx.fillRect(1, 1, 1, 1);
          const dataURL = canvas.toDataURL();
          // Use a hash of the canvas data
          const canvasHash = await this.hashString(dataURL);
          fingerprintComponents.push(`canvas:${canvasHash}`);
        }
      } catch (_error) {
        // Canvas fingerprinting failed, continue without it
      }

      // 5. WebGL fingerprint (hardware-dependent)
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
        if (gl) {
          const renderer = gl.getParameter(gl.RENDERER);
          const vendor = gl.getParameter(gl.VENDOR);
          if (renderer) fingerprintComponents.push(`gpu:${renderer}`);
          if (vendor) fingerprintComponents.push(`gpuVendor:${vendor}`);
        }
      } catch (_error) {
        // WebGL fingerprinting failed, continue without it
      }

      // 6. Timezone (stable)
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezone) {
          fingerprintComponents.push(`tz:${timezone}`);
        }
      } catch (_error) {
        // Timezone detection failed
      }

      // 7. Screen characteristics (stable)
      if (typeof screen !== 'undefined') {
        fingerprintComponents.push(`screen:${screen.width}x${screen.height}`);
        if (screen.colorDepth) {
          fingerprintComponents.push(`colorDepth:${screen.colorDepth}`);
        }
      }

      // Combine all components and create a hash
      const fingerprintString = fingerprintComponents.join('|');
      const fingerprintHash = await this.hashString(fingerprintString);
      
      return `extension-${fingerprintHash}`;
    } catch (_error) {
      // Fallback to basic fingerprint
      return `extension-fallback-${Date.now()}`;
    }
  }

  /**
   * Create a hash of a string using Web Crypto API
   */
  private async hashString(str: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex.substring(0, 16); // Use first 16 characters for brevity
    } catch (_error) {
      // Fallback to simple hash
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(16).substring(0, 16);
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

  // ===== Session Metadata =====

  async storeSessionMetadata(metadata: any): Promise<void> {
    try {
      await chrome.storage.local.set({ sessionMetadata: metadata });
    } catch (_error) {
      throw new Error('Failed to store session metadata');
    }
  }

  async getSessionMetadata(): Promise<any> {
    try {
      const result = await chrome.storage.local.get('sessionMetadata');
      return result.sessionMetadata || null;
    } catch (_error) {
      return null;
    }
  }

  async deleteSessionMetadata(): Promise<void> {
    try {
      await chrome.storage.local.remove('sessionMetadata');
    } catch (_error) {
      throw new Error('Failed to delete session metadata');
    }
  }

  // ===== Vault Operations (Extension-specific) =====

  async getEncryptedVault(): Promise<EncryptedVault | null> {
    try {
      const result = await chrome.storage.local.get(this.config.vaultKey);
      return result[this.config.vaultKey] || null;
    } catch (_error) {
      throw new Error('Failed to retrieve encrypted vault');
    }
  }

  async storeEncryptedVault(vault: EncryptedVault): Promise<void> {
    try {
      await chrome.storage.local.set({ [this.config.vaultKey]: vault });
    } catch (_error) {
      throw new Error('Failed to store encrypted vault');
    }
  }

  async deleteEncryptedVault(): Promise<void> {
    try {
      await chrome.storage.local.remove(this.config.vaultKey);
    } catch (_error) {
      throw new Error('Failed to delete encrypted vault');
    }
  }
} 