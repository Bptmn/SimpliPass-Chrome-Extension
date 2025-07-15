/**
 * Mobile Platform Adapter Implementation
 * 
 * Handles all mobile-specific functionality including:
 * - iOS Keychain / Android Keystore access
 * - Biometric authentication
 * - Mobile-specific storage
 * - Network detection
 */

import { PlatformAdapter } from '@common/core/types/platform.types';

export class MobilePlatformAdapter implements PlatformAdapter {
  private config = {
    storageKey: 'userSecretKey',
    biometricKey: 'biometricEnabled',
    sessionKey: 'sessionData',
  };

  // ===== Storage Operations =====

  async getUserSecretKey(): Promise<string | null> {
    try {
      // Conditional import for Expo SecureStore
      const SecureStore = await this.getSecureStore();
      return await SecureStore.getItemAsync(this.config.storageKey);
    } catch {
      console.error('Failed to get user secret key');
      return null;
    }
  }

  async storeUserSecretKey(key: string): Promise<void> {
    try {
      const SecureStore = await this.getSecureStore();
      await SecureStore.setItemAsync(this.config.storageKey, key);
    } catch {
      console.error('Failed to store user secret key');
    }
  }

  async deleteUserSecretKey(): Promise<void> {
    try {
      const SecureStore = await this.getSecureStore();
      await SecureStore.deleteItemAsync(this.config.storageKey);
    } catch {
      console.error('Failed to delete user secret key');
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
      // @ts-expect-error - Dynamic import for clipboard functionality
      const { Clipboard } = await import('@react-native-clipboard/clipboard');
      await Clipboard.setString(text);
    } catch (error) {
      throw new Error(`Failed to copy to clipboard: ${error}`);
    }
  }

  async getFromClipboard(): Promise<string> {
    try {
      // @ts-expect-error - Dynamic import for clipboard functionality
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
    } catch {
      console.error('Failed to clear session');
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

  getAppVersion(): string {
    return '1.0.0'; // This should be dynamically retrieved
  }

  // ===== Private Helper Methods =====

  private async getSecureStore() {
    try {
      // @ts-expect-error - Dynamic import for secure store
      return await import('expo-secure-store');
    } catch {
      console.error('Failed to import SecureStore');
      throw new Error('SecureStore not available');
    }
  }

  private async getLocalAuthentication() {
    try {
      // @ts-expect-error - Dynamic import for local authentication
      return await import('expo-local-authentication');
    } catch {
      console.error('Failed to import LocalAuthentication');
      throw new Error('LocalAuthentication not available');
    }
  }

  private async getDevice() {
    try {
      // @ts-expect-error - Dynamic import for device info
      return await import('expo-device');
    } catch {
      console.error('Failed to import Device');
      throw new Error('Device not available');
    }
  }

  private async getNetwork() {
    try {
      // @ts-expect-error - Dynamic import for network info
      return await import('expo-network');
    } catch {
      console.error('Failed to import Network');
      throw new Error('Network not available');
    }
  }
} 