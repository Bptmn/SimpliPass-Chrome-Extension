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
      const SecureStore = await this.getSecureStore();
      return await SecureStore.getItemAsync(this.config.storageKey);
    } catch {
      return null;
    }
  }

  async storeUserSecretKey(key: string): Promise<void> {
    try {
      const SecureStore = await this.getSecureStore();
      await SecureStore.setItemAsync(this.config.storageKey, key);
    } catch {
      throw new Error('Failed to store user secret key');
    }
  }

  async deleteUserSecretKey(): Promise<void> {
    try {
      const SecureStore = await this.getSecureStore();
      await SecureStore.deleteItemAsync(this.config.storageKey);
    } catch {
      throw new Error('Failed to delete user secret key');
    }
  }

  // ===== Platform Information =====

  getPlatformName(): 'mobile' | 'extension' {
    return 'mobile';
  }

  supportsBiometric(): boolean {
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
    } catch (_error) {
      throw new Error('Biometric authentication failed');
    }
  }

  async isBiometricAvailable(): Promise<boolean> {
    try {
      const LocalAuthentication = await this.getLocalAuthentication();
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (_error) {
      return false;
    }
  }

  // ===== Clipboard Operations =====

  async copyToClipboard(text: string): Promise<void> {
    try {
      const Clipboard = await import('@react-native-clipboard/clipboard');
      await Clipboard.default.setString(text);
    } catch (_error) {
      throw new Error('Failed to copy to clipboard');
    }
  }

  async getFromClipboard(): Promise<string> {
    try {
      const Clipboard = await import('@react-native-clipboard/clipboard');
      return await Clipboard.default.getString();
    } catch (_error) {
      throw new Error('Failed to get from clipboard');
    }
  }

  // ===== Session Management =====

  async clearSession(): Promise<void> {
    try {
      const SecureStore = await this.getSecureStore();
      // Clear all known keys manually since getAllKeysAsync is not available
      const knownKeys = [
        this.config.storageKey,
        'remembered_email',
        'session_metadata',
        this.config.biometricKey,
        this.config.sessionKey
      ];
      await Promise.all(knownKeys.map((key: string) => SecureStore.deleteItemAsync(key)));
    } catch {
      throw new Error('Failed to clear session');
    }
  }

  async getDeviceFingerprint(): Promise<string> {
    try {
      const Device = await this.getDevice();
      // Use device name and type as fingerprint since getDeviceIdAsync is not available
      const deviceName = Device.deviceName || 'unknown';
      const deviceType = await Device.getDeviceTypeAsync();
      return `mobile-${deviceName}-${deviceType}`;
    } catch (_error) {
      throw new Error('Failed to get device fingerprint');
    }
  }

  // ===== Network Operations =====

  async isOnline(): Promise<boolean> {
    try {
      const Network = await this.getNetwork();
      const networkState = await Network.getNetworkStateAsync();
      return (networkState.isConnected ?? false) && (networkState.isInternetReachable ?? false);
    } catch (_error) {
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
    } catch (_error) {
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
    } catch (_error) {
      throw new Error('Failed to set remembered email');
    }
  }

  async getRememberedEmail(): Promise<string | null> {
    try {
      const SecureStore = await this.getSecureStore();
      return await SecureStore.getItemAsync('remembered_email');
    } catch (_error) {
      return null;
    }
  }

  // ===== Session Metadata =====

  async storeSessionMetadata(metadata: any): Promise<void> {
    try {
      const SecureStore = await this.getSecureStore();
      await SecureStore.setItemAsync('session_metadata', JSON.stringify(metadata));
    } catch (_error) {
      throw new Error('Failed to store session metadata');
    }
  }

  async getSessionMetadata(): Promise<any> {
    try {
      const SecureStore = await this.getSecureStore();
      const metadata = await SecureStore.getItemAsync('session_metadata');
      return metadata ? JSON.parse(metadata) : null;
    } catch (_error) {
      return null;
    }
  }

  async deleteSessionMetadata(): Promise<void> {
    try {
      const SecureStore = await this.getSecureStore();
      await SecureStore.deleteItemAsync('session_metadata');
    } catch (_error) {
      throw new Error('Failed to delete session metadata');
    }
  }

  // ===== Private Helper Methods =====

  private async getSecureStore() {
    try {
      return await import('expo-secure-store');
    } catch {
      throw new Error('SecureStore not available');
    }
  }

  private async getLocalAuthentication() {
    try {
      return await import('expo-local-authentication');
    } catch {
      throw new Error('LocalAuthentication not available');
    }
  }

  private async getDevice() {
    try {
      return await import('expo-device');
    } catch {
      throw new Error('Device not available');
    }
  }

  private async getNetwork() {
    try {
      return await import('expo-network');
    } catch {
      throw new Error('Network not available');
    }
  }
} 