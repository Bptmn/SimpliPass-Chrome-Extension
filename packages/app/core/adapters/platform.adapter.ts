/**
 * Platform Adapter Interface
 * 
 * This interface abstracts all platform-specific functionality to ensure
 * the app/ and core/ packages remain platform-agnostic.
 */

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
   * @returns Promise<string | null> - The session metadata JSON or null if not found
   */
  getSessionMetadata(): Promise<string | null>;
  
  /**
   * Store session metadata in platform-specific storage
   * @param metadata - The session metadata JSON to store
   */
  storeSessionMetadata(metadata: string): Promise<void>;
  
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

// ===== Type Definitions =====

export interface EncryptedVault {
  version: string;
  encryptedData: string;
  iv: string;
  salt: string;
  timestamp: number;
}

export interface PlatformCapabilities {
  biometric: boolean;
  offlineVault: boolean;
  secureStorage: boolean;
  clipboard: boolean;
  networkDetection: boolean;
}

export interface PlatformInfo {
  name: 'mobile' | 'extension';
  version: string;
  capabilities: PlatformCapabilities;
}

// ===== Error Types =====

export class PlatformError extends Error {
  constructor(
    message: string,
    public code: string,
    public platform: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'PlatformError';
  }
}

export class BiometricError extends PlatformError {
  constructor(message: string, platform: string, originalError?: Error) {
    super(message, 'BIOMETRIC_ERROR', platform, originalError);
    this.name = 'BiometricError';
  }
}

export class StorageError extends PlatformError {
  constructor(message: string, platform: string, originalError?: Error) {
    super(message, 'STORAGE_ERROR', platform, originalError);
    this.name = 'StorageError';
  }
}

export class NetworkError extends PlatformError {
  constructor(message: string, platform: string, originalError?: Error) {
    super(message, 'NETWORK_ERROR', platform, originalError);
    this.name = 'NetworkError';
  }
} 