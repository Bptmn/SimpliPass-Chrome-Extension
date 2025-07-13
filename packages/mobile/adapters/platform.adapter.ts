/**
 * Mobile Platform Adapter Implementation
 * 
 * Handles all mobile-specific functionality including:
 * - iOS Keychain / Android Keystore access
 * - Biometric authentication
 * - Mobile-specific storage
 * - Network detection
 */

import { PlatformAdapter } from '../../app/core/adapters';
import { getPlatformConfig } from '../../app/core/adapters/platform.detection';

export class MobilePlatformAdapter implements PlatformAdapter {
  private config = getPlatformConfig();

  // ===== Storage Operations =====

  async getUserSecretKey(): Promise<string | null> {
    try {
      // Conditional import for Expo SecureStore
      const SecureStore = await this.getSecureStore();
      return await SecureStore.getItemAsync(this.config.storageKey);
    } catch (error) {
      throw new Error(`Failed to retrieve user secret key from secure storage: ${error}`);
    }
  }

  async storeUserSecretKey(key: string): Promise<void> {
    try {
      const SecureStore = await this.getSecureStore();
      await SecureStore.setItemAsync(this.config.storageKey, key);
    } catch (error) {
      throw new Error(`Failed to store user secret key in secure storage: ${error}`);
    }
  }

  async deleteUserSecretKey(): Promise<void> {
    try {
      const SecureStore = await this.getSecureStore();
      await SecureStore.deleteItemAsync(this.config.storageKey);
    } catch (error) {
      throw new Error(`Failed to delete user secret key from secure storage: ${error}`);
    }
  }

  // ===== Platform Information =====

  getPlatformName(): 'mobile' {
    return 'mobile';
  }

  supportsBiometric(): boolean {
    // Will be checked dynamically
    return true;
  }

  supportsOfflineVault(): boolean {
    return true;
  }

  // ===== Authentication =====

  async authenticateWithBiometrics(): Promise<boolean> {
    try {
      const LocalAuthentication = await this.getLocalAuthentication();
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access SimpliPass',
        fallbackLabel: 'Use passcode',
      });
      return result.success;
    } catch (error) {
      throw new Error(`Biometric authentication failed: ${error}`);
    }
  }

  async isBiometricAvailable(): Promise<boolean> {
    try {
      const LocalAuthentication = await this.getLocalAuthentication();
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.warn('Failed to check biometric availability:', error);
      return false;
    }
  }

  // ===== Clipboard Operations =====

  async copyToClipboard(text: string): Promise<void> {
    try {
      const { Clipboard } = await import('@react-native-clipboard/clipboard');
      await Clipboard.setString(text);
    } catch (error) {
      throw new Error(`Failed to copy to clipboard: ${error}`);
    }
  }

  async getFromClipboard(): Promise<string> {
    try {
      const { Clipboard } = await import('@react-native-clipboard/clipboard');
      return await Clipboard.getString();
    } catch (error) {
      throw new Error(`Failed to get from clipboard: ${error}`);
    }
  }

  // ===== Session Management =====

  async clearSession(): Promise<void> {
    try {
      const SecureStore = await this.getSecureStore();
      // Clear all secure storage items
      const keys = await SecureStore.getAllKeysAsync();
      await Promise.all(keys.map((key: string) => SecureStore.deleteItemAsync(key)));
    } catch (error) {
      throw new Error(`Failed to clear session data: ${error}`);
    }
  }

  async getDeviceFingerprint(): Promise<string> {
    try {
      const Device = await this.getDevice();
      const deviceId = await Device.getDeviceIdAsync();
      return `mobile-${deviceId}`;
    } catch (error) {
      throw new Error(`Failed to get device fingerprint: ${error}`);
    }
  }

  // ===== Network Operations =====

  async isOnline(): Promise<boolean> {
    try {
      const Network = await this.getNetwork();
      const networkState = await Network.getNetworkStateAsync();
      return networkState.isConnected && networkState.isInternetReachable;
    } catch (error) {
      console.warn('Failed to check network status:', error);
      return false;
    }
  }

  async getNetworkStatus(): Promise<'online' | 'offline' | 'unknown'> {
    try {
      const Network = await this.getNetwork();
      const networkState = await Network.getNetworkStateAsync();
      if (networkState.isConnected && networkState.isInternetReachable) {
        return 'online';
      } else if (networkState.isConnected) {
        return 'offline';
      } else {
        return 'unknown';
      }
    } catch (error) {
      console.warn('Failed to get network status:', error);
      return 'unknown';
    }
  }

  // ===== Email Remembering =====

  async setRememberedEmail(email: string | null): Promise<void> {
    try {
      const SecureStore = await this.getSecureStore();
      if (email) {
        await SecureStore.setItemAsync('remembered_email', email);
      } else {
        await SecureStore.deleteItemAsync('remembered_email');
      }
    } catch (error) {
      console.warn('Failed to set remembered email:', error);
    }
  }

  async getRememberedEmail(): Promise<string | null> {
    try {
      const SecureStore = await this.getSecureStore();
      return await SecureStore.getItemAsync('remembered_email');
    } catch (error) {
      console.warn('Failed to get remembered email:', error);
      return null;
    }
  }

  // ===== Session Metadata =====

  async storeSessionMetadata(metadata: string): Promise<void> {
    try {
      const SecureStore = await this.getSecureStore();
      await SecureStore.setItemAsync('session_metadata', metadata);
    } catch (error) {
      throw new Error(`Failed to store session metadata: ${error}`);
    }
  }

  async getSessionMetadata(): Promise<string | null> {
    try {
      const SecureStore = await this.getSecureStore();
      return await SecureStore.getItemAsync('session_metadata');
    } catch (error) {
      console.warn('Failed to get session metadata:', error);
      return null;
    }
  }

  async deleteSessionMetadata(): Promise<void> {
    try {
      const SecureStore = await this.getSecureStore();
      await SecureStore.deleteItemAsync('session_metadata');
    } catch (error) {
      throw new Error(`Failed to delete session metadata: ${error}`);
    }
  }

  // ===== App Information =====

  /**
   * Get app version
   */
  getAppVersion(): string {
    try {
      const { Constants } = require('expo-constants');
      return Constants.expoConfig?.version || '1.0.0';
    } catch (error) {
      console.warn('Failed to get app version:', error);
      return '1.0.0';
    }
  }

  // ===== Helper Methods for Conditional Imports =====

  private async getSecureStore() {
    try {
      return await import('expo-secure-store');
    } catch (error) {
      throw new Error('expo-secure-store not available');
    }
  }

  private async getLocalAuthentication() {
    try {
      return await import('expo-local-authentication');
    } catch (error) {
      throw new Error('expo-local-authentication not available');
    }
  }

  private async getDevice() {
    try {
      return await import('expo-device');
    } catch (error) {
      throw new Error('expo-device not available');
    }
  }

  private async getNetwork() {
    try {
      return await import('expo-network');
    } catch (error) {
      throw new Error('expo-network not available');
    }
  }
} 