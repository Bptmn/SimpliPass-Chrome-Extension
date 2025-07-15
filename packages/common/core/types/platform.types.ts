export interface PlatformAdapter {
  // ===== Storage Operations =====
  
  /**
   * Get the user's secret key from platform-specific secure storage
   * @returns Promise<string | null> - The user secret key or null if not found
   */
  getUserSecretKey(): Promise<string | null>;
  
  /**
   * Store the user's secret key in platform-specific secure storage
   * @param key - The user secret key to store
   */
  storeUserSecretKey(key: string): Promise<void>;
  
  /**
   * Delete the user's secret key from platform-specific secure storage
   */
  deleteUserSecretKey(): Promise<void>;
  
  // ===== Session Metadata Storage =====
  
  /**
   * Get session metadata from platform-specific storage
   * @returns Promise<any> - The session metadata or null if not found
   */
  getSessionMetadata(): Promise<any>;
  
  /**
   * Store session metadata in platform-specific storage
   * @param metadata - The session metadata to store
   */
  storeSessionMetadata(metadata: any): Promise<void>;
  
  /**
   * Delete session metadata from platform-specific storage
   */
  deleteSessionMetadata(): Promise<void>;
  
  // ===== Vault Operations (Extension only) =====
  
  /**
   * Get encrypted vault from local storage (Extension only)
   * @returns Promise<EncryptedVault | null> - The encrypted vault or null if not found
   */
  getEncryptedVault?(): Promise<EncryptedVault | null>;
  
  /**
   * Store encrypted vault in local storage (Extension only)
   * @param vault - The encrypted vault to store
   */
  storeEncryptedVault?(vault: EncryptedVault): Promise<void>;
  
  /**
   * Delete encrypted vault from local storage (Extension only)
   */
  deleteEncryptedVault?(): Promise<void>;
  
  // ===== Platform Information =====
  
  /**
   * Get the current platform name
   * @returns 'mobile' | 'extension'
   */
  getPlatformName(): 'mobile' | 'extension';
  
  /**
   * Check if the platform supports biometric authentication
   * @returns boolean
   */
  supportsBiometric(): boolean;
  
  /**
   * Check if the platform supports offline vault storage
   * @returns boolean
   */
  supportsOfflineVault(): boolean;
  
  // ===== Authentication =====
  
  /**
   * Authenticate user with biometrics (if supported)
   * @returns Promise<boolean> - Whether authentication was successful
   */
  authenticateWithBiometrics?(): Promise<boolean>;
  
  /**
   * Check if biometric authentication is available
   * @returns Promise<boolean>
   */
  isBiometricAvailable?(): Promise<boolean>;
  
  // ===== Clipboard Operations =====
  
  /**
   * Copy text to clipboard
   * @param text - Text to copy
   */
  copyToClipboard(text: string): Promise<void>;
  
  /**
   * Get text from clipboard
   * @returns Promise<string> - Text from clipboard
   */
  getFromClipboard(): Promise<string>;
  
  // ===== Session Management =====
  
  /**
   * Clear all session data and memory
   */
  clearSession(): Promise<void>;
  
  /**
   * Get device fingerprint for encryption
   * @returns Promise<string> - Device fingerprint
   */
  getDeviceFingerprint(): Promise<string>;
  

  
  // ===== Network Operations =====
  
  /**
   * Check if device is online
   * @returns Promise<boolean>
   */
  isOnline(): Promise<boolean>;
  
  /**
   * Get network status
   * @returns Promise<'online' | 'offline' | 'unknown'>
   */
  getNetworkStatus(): Promise<'online' | 'offline' | 'unknown'>;
  
  // ===== Email Remembering =====
  
  /**
   * Set remembered email
   * @param email - Email to remember or null to clear
   */
  setRememberedEmail?(email: string | null): Promise<void>;
  
  /**
   * Get remembered email
   * @returns Promise<string | null> - Remembered email or null
   */
  getRememberedEmail?(): Promise<string | null>;
}

export interface EncryptedVault {
  version: string;
  encryptedData: string;
  iv: string;
  salt: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceInfo {
  platform: 'mobile' | 'extension';
  deviceId: string;
  deviceName: string;
  osVersion: string;
  appVersion: string;
}

export interface NetworkStatus {
  isOnline: boolean;
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  latency?: number;
} 